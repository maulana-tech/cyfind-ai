package selfupdate

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"strings"
	"time"
)

// smokeEnv lets the child process spawned by the smoke test skip Bootstrap entirely.
//
// Strictly speaking nothing breaks without it: the child's os.Executable() is cyfind.new, so every
// path derived from it carries the .new prefix and can never touch the real upgrade files. But
// relying on that coincidence is too fragile; an explicit short-circuit is obvious at a glance and
// also saves the child one pointless disk probe.
const smokeEnv = "CYFIND_SELFUPDATE_SMOKE"

// Action is the instruction Bootstrap hands back to main.
type Action int

const (
	// Continue: start the server as usual.
	Continue Action = iota
	// Restart: exit immediately with ExitRestart so the supervisor script relaunches us.
	Restart
)

// State describes the upgrade status at this startup, so /api/update/check can tell the frontend
// truthfully "whether the last upgrade succeeded or was rolled back".
type State struct {
	Pending     bool   // swapped in but not yet confirmed stable
	RolledBack  bool   // this startup just performed an automatic rollback
	FailedStage bool   // the staged file failed verification/smoke test and was discarded
	Detail      string // a one-line explanation for the user
}

// Bootstrap runs at the very start of main; it MUST be called before listening on any port or
// opening the database.
//
// Three situations:
//
//	① a staged file cyfind.new exists  → verify + smoke-test; on success swap and request a restart, otherwise discard and keep running the old version
//	② only the marker file remains    → we just swapped in; record one attempt; roll back after enough consecutive failures
//	③ nothing at all                  → normal startup
func Bootstrap() (Action, State) {
	if os.Getenv(smokeEnv) != "" {
		return Continue, State{}
	}
	p, err := ResolvePaths()
	if err != nil {
		log.Printf("[update] skipping bootstrap: %v", err)
		return Continue, State{}
	}

	if _, err := os.Stat(p.New); err == nil {
		return applyStaged(p)
	}

	m, ok := readMarker(p.Marker)
	if !ok {
		return Continue, State{}
	}
	return confirmOrRollback(p, m)
}

// applyStaged handles the "a staged file exists" situation: swap it in if verification passes,
// discard it otherwise.
//
// This is the only place in the whole upgrade chain that overwrites the executable, and the last
// gate — the smoke test catches corrupt downloads, a wrong architecture, missing dynamic links and
// the like. Once a binary that cannot run is let through, the supervisor script relaunches it
// tirelessly, the Go code never gets a chance to run, and automatic rollback becomes impossible.
func applyStaged(p Paths) (Action, State) {
	m, _ := readMarker(p.Marker)

	if err := verifyStaged(p); err != nil {
		log.Printf("[update] the staged new version failed verification; discarded, continuing with the current version: %v", err)
		cleanStaged(p)
		_ = os.Remove(p.Marker)
		return Continue, State{FailedStage: true, Detail: "the new version failed verification and was discarded: " + err.Error()}
	}

	if err := swap(p); err != nil {
		log.Printf("[update] swap failed, continuing with the current version: %v", err)
		cleanStaged(p)
		_ = os.Remove(p.Marker)
		return Continue, State{FailedStage: true, Detail: "swap failed: " + err.Error()}
	}

	// Swap succeeded. Keep the marker and let the next startup (which runs the new version) confirm
	// whether it is stable.
	m.Attempts = 0
	if m.StagedAt == 0 {
		m.StagedAt = time.Now().Unix()
	}
	if err := writeMarker(p.Marker, m); err != nil {
		log.Printf("[update] failed to write the upgrade marker (lost automatic-rollback capability): %v", err)
	}
	log.Printf("[update] swapped in %s, exiting to restart (exit %d)", orUnknown(m.To), ExitRestart)
	return Restart, State{Pending: true}
}

// confirmOrRollback handles "the startup after a swap": count the attempts, and once the limit is
// exceeded swap the old version back in.
//
// The count is only incremented once the Go code is running, so it covers "can exec but crashes
// during initialization" failures (incompatible config, a taken port, a blown DB migration);
// "cannot exec at all" is caught by the smoke test before the swap, and the two together are what
// make it complete.
func confirmOrRollback(p Paths, m marker) (Action, State) {
	m.Attempts++
	if m.Attempts > maxAttempts {
		if err := rollback(p); err != nil {
			// If even the rollback fails, stop restarting, otherwise we fall into an infinite
			// restart loop. Clear the marker and let the process start in its current state — if it
			// can't start, the user can at least see why in the log.
			log.Printf("[update] the new version failed to start %d times in a row, and rollback also failed: %v", maxAttempts, err)
			_ = os.Remove(p.Marker)
			return Continue, State{Detail: "the new version failed to start and rollback also failed: " + err.Error()}
		}
		log.Printf("[update] the new version failed to start %d times in a row; rolled back to %s, exiting to restart (exit %d)",
			maxAttempts, orUnknown(m.From), ExitRestart)
		_ = os.Remove(p.Marker)
		return Restart, State{RolledBack: true, Detail: fmt.Sprintf("the new version failed to start; rolled back to %s", orUnknown(m.From))}
	}
	if err := writeMarker(p.Marker, m); err != nil {
		log.Printf("[update] failed to update the upgrade marker: %v", err)
	}
	log.Printf("[update] the new version is starting (attempt %d/%d); the upgrade will be confirmed once it runs stably",
		m.Attempts, maxAttempts)
	return Continue, State{Pending: true}
}

// Settle confirms the new version is running stably and clears the upgrade marker.
//
// Called by main on a delay after the HTTP listener is up: surviving that long is what counts,
// otherwise the marker stays in place and the next startup keeps counting attempts until a rollback
// is triggered.
func Settle() {
	p, err := ResolvePaths()
	if err != nil {
		return
	}
	settle(p)
}

func settle(p Paths) {
	if _, ok := readMarker(p.Marker); !ok {
		return // not a post-upgrade startup, nothing to do
	}
	if err := os.Remove(p.Marker); err != nil && !errors.Is(err, os.ErrNotExist) {
		log.Printf("[update] failed to clear the upgrade marker: %v", err)
		return
	}
	log.Printf("[update] the new version is running stably, upgrade complete (the previous version is kept as %s)", p.Old)
}

// SettleDelay is how long the process must run before the new version is judged to have survived.
const SettleDelay = 30 * time.Second

// verifyStaged verifies the staged file: first compare SHA256, then actually launch it once.
func verifyStaged(p Paths) error {
	want, err := os.ReadFile(p.Sum)
	if err != nil {
		return fmt.Errorf("reading the checksum: %w", err)
	}
	got, err := fileSHA256(p.New)
	if err != nil {
		return fmt.Errorf("computing the checksum: %w", err)
	}
	if !strings.EqualFold(strings.TrimSpace(string(want)), got) {
		return errors.New("SHA256 mismatch (download corrupted or tampered with)")
	}
	return smokeTest(p.New)
}

// smokeTest launches the new binary with -h to confirm it really can execute on the current system.
// This catches a large class of problems: a truncated download, the wrong architecture (exec format
// error), missing dependencies, and so on.
func smokeTest(bin string) error {
	if err := os.Chmod(bin, 0o755); err != nil {
		return fmt.Errorf("granting execute permission: %w", err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, bin, "-h")
	cmd.Env = append(os.Environ(), smokeEnv+"=1")
	out, err := cmd.CombinedOutput()
	if ctx.Err() != nil {
		return errors.New("smoke test timed out (the new binary is unresponsive)")
	}
	if err != nil {
		snippet := strings.TrimSpace(string(out))
		if len(snippet) > 300 {
			snippet = snippet[:300] + "…"
		}
		return fmt.Errorf("smoke test failed: %v: %s", err, snippet)
	}
	return nil
}

// swap replaces the current binary with the staged new version.
//
// Both Unix and Windows allow renaming a running executable (what Windows forbids is deleting and
// overwriting, not renaming), so this needs no per-platform split and no stopping ourselves first.
func swap(p Paths) error {
	// Windows' rename won't overwrite an existing target, so the .old left by the previous upgrade
	// must be cleared first.
	if err := os.Remove(p.Old); err != nil && !errors.Is(err, os.ErrNotExist) {
		return fmt.Errorf("cleaning up the old backup %s: %w", p.Old, err)
	}
	if err := os.Rename(p.Current, p.Old); err != nil {
		return fmt.Errorf("backing up the current version: %w", err)
	}
	if err := os.Rename(p.New, p.Current); err != nil {
		// The swap failed but the current version has already been moved aside, so it must be put
		// back exactly as it was, otherwise the next startup has no executable.
		if rerr := os.Rename(p.Old, p.Current); rerr != nil {
			return fmt.Errorf("failed to install the new version (%v), and failed to restore the current version: %w", err, rerr)
		}
		return fmt.Errorf("installing the new version: %w", err)
	}
	_ = os.Remove(p.Sum)
	return nil
}

// rollback swaps the old version backed up by swap back in.
func rollback(p Paths) error {
	if _, err := os.Stat(p.Old); err != nil {
		return fmt.Errorf("no backup to roll back to %s: %w", p.Old, err)
	}
	// Move the new version that won't start to .failed for investigation rather than deleting it.
	failed := p.Current + ".failed"
	_ = os.Remove(failed)
	if err := os.Rename(p.Current, failed); err != nil {
		return fmt.Errorf("moving aside the failed version: %w", err)
	}
	if err := os.Rename(p.Old, p.Current); err != nil {
		return fmt.Errorf("restoring the old version: %w", err)
	}
	return nil
}

// Rollback is the implementation of /api/update/rollback: deliberately revert to the previous
// version. It only performs the swap; the restart is likewise left to the supervisor script (the
// caller then exits with ExitRestart).
func Rollback() error {
	p, err := ResolvePaths()
	if err != nil {
		return err
	}
	if _, err := os.Stat(p.Old); err != nil {
		return errors.New("no previous version to roll back to (" + p.Old + " does not exist)")
	}
	cleanStaged(p)
	if err := smokeTest(p.Old); err != nil {
		return fmt.Errorf("the previous version cannot execute, refusing to roll back: %w", err)
	}
	// Swap current and backup: after a rollback we can still roll forward again.
	tmp := p.Current + ".swap"
	_ = os.Remove(tmp)
	if err := os.Rename(p.Current, tmp); err != nil {
		return fmt.Errorf("moving aside the current version: %w", err)
	}
	if err := os.Rename(p.Old, p.Current); err != nil {
		_ = os.Rename(tmp, p.Current)
		return fmt.Errorf("installing the previous version: %w", err)
	}
	if err := os.Rename(tmp, p.Old); err != nil {
		log.Printf("[update] failed to tidy up the backup after rollback (does not affect operation): %v", err)
	}
	_ = os.Remove(p.Marker)
	return nil
}

// HasBackup reports whether a previous version is available to roll back to, so the frontend can
// decide whether to show the rollback button.
func HasBackup() bool {
	p, err := ResolvePaths()
	if err != nil {
		return false
	}
	_, err = os.Stat(p.Old)
	return err == nil
}

func fileSHA256(path string) (string, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()
	h := sha256.New()
	if _, err := io.Copy(h, f); err != nil {
		return "", err
	}
	return hex.EncodeToString(h.Sum(nil)), nil
}

func orUnknown(s string) string {
	if strings.TrimSpace(s) == "" {
		return "unknown version"
	}
	return s
}

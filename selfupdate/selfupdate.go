// Package selfupdate implements CYFIND's one-click in-page update: it pulls the new binary from a
// GitHub Release, verifies and stages it, and swaps it in atomically at the next startup.
//
// Overall division of labor (see start.sh / start.bat):
//
//	the startup script = a dumb supervisor loop, responsible only for "deciding whether to relaunch based on the exit code after the process exits"
//	this package       = all the error-prone logic (download / SHA256 verification / smoke test / swap / rollback on failure)
//
// The swap lives in Go rather than the script because the sha256 verification and smoke test would
// need two implementations on sh and bat (sha256sum / shasum / certutil), and this is exactly the
// step that must not go wrong — swap in a binary that won't run and the supervisor faithfully
// relaunches it over and over, leaving the user to rescue it by hand on the machine.
//
// One complete upgrade goes through three process startups:
//
//	① the old server receives /api/update/apply → download + verify → stage cyfind.new → exit 75
//	② the script relaunches the old version → Bootstrap finds cyfind.new → verify + smoke test → swap → exit 75
//	③ the script relaunches, now running the new version → Bootstrap records one attempt → clears the marker after a successful start
//
// A failure at any step falls back to the old version: at ② a failed verification deletes the
// staged file and keeps running the old version; at ③ three consecutive failures to survive to
// clearing the marker (crashing if it can't start) automatically swaps cyfind.old back in.
package selfupdate

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// ExitRestart is the exit code meaning "supervisor, please relaunch me" (EX_TEMPFAIL). The startup
// script reruns immediately on seeing it, not counting it toward crash backoff. 0 means the user
// stopped normally (the script exits its loop); everything else is treated as a crash.
const ExitRestart = 75

// maxAttempts is the number of startup attempts allowed after a swap. The new version increments
// the counter on each startup and clears the marker once it survives settleDelay; crashing
// maxAttempts times in a row means the new version simply won't start, triggering an automatic
// rollback.
const maxAttempts = 3

// Paths is every file involved in an upgrade, all hung under the **executable's directory**.
// Deliberately not CWD: when running as a service the working directory may be / or any path, and
// using CWD would land the staged file elsewhere, breaking the swap logic outright.
type Paths struct {
	Dir     string // the executable's directory
	Current string // the currently running binary       cyfind      / cyfind.exe
	New     string // the staged new version             cyfind.new  / cyfind.new.exe
	Sum     string // the new version's sha256 (hex)      cyfind.new.sha256 / cyfind.new.exe.sha256
	Old     string // the old version backed up before the swap  cyfind.old  / cyfind.old.exe
	Marker  string // the upgrade-status marker           cyfind.upgrade.json
}

// ResolvePaths derives every upgrade path from the current executable.
//
// On Windows .new/.old must also carry the .exe suffix, otherwise the smoke test and the execution
// after the swap both fail, so the suffix is stripped off first and then reassembled, making the
// naming symmetric across both platforms.
func ResolvePaths() (Paths, error) {
	exe, err := os.Executable()
	if err != nil {
		return Paths{}, fmt.Errorf("locating the executable: %w", err)
	}
	if resolved, err := filepath.EvalSymlinks(exe); err == nil {
		exe = resolved
	}
	dir := filepath.Dir(exe)
	name := filepath.Base(exe)
	ext := filepath.Ext(name) // ".exe" on Windows, usually empty on Unix
	stem := strings.TrimSuffix(name, ext)

	join := func(suffix string) string { return filepath.Join(dir, stem+suffix+ext) }
	return Paths{
		Dir:     dir,
		Current: exe,
		New:     join(".new"),
		Sum:     join(".new") + ".sha256",
		Old:     join(".old"),
		Marker:  filepath.Join(dir, stem+".upgrade.json"),
	}, nil
}

// marker records the progress of one swap, used to trigger an automatic rollback when the new
// version won't start.
type marker struct {
	From     string `json:"from"`     // the version before the upgrade
	To       string `json:"to"`       // the target version
	Attempts int    `json:"attempts"` // the number of startup attempts since the swap
	StagedAt int64  `json:"staged_at"`
}

func readMarker(path string) (marker, bool) {
	b, err := os.ReadFile(path)
	if err != nil {
		return marker{}, false
	}
	var m marker
	if json.Unmarshal(b, &m) != nil {
		return marker{}, false
	}
	return m, true
}

func writeMarker(path string, m marker) error {
	b, err := json.MarshalIndent(m, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, b, 0o644)
}

// cleanStaged clears the staged file. A successful swap, a failed verification, and a user cancel
// all go through it, to avoid a leftover cyfind.new being retried at the next startup.
func cleanStaged(p Paths) {
	_ = os.Remove(p.New)
	_ = os.Remove(p.Sum)
}

// CompareVersions compares two version numbers, returning -1/0/1 (a<b / a==b / a>b).
// ok=false means at least one side is not a comparable version number (for example a local
// development build's "dev", or git describe's "0.3.7-2-gabc1234-dirty"); the caller should then
// disable the one-click update, otherwise it would "upgrade" a development build to an official
// release and overwrite uncommitted changes.
func CompareVersions(a, b string) (int, bool) {
	av, aok := parseVersion(a)
	bv, bok := parseVersion(b)
	if !aok || !bok {
		return 0, false
	}
	for i := range 3 {
		if av[i] != bv[i] {
			if av[i] < bv[i] {
				return -1, true
			}
			return 1, true
		}
	}
	return 0, true
}

// parseVersion parses a version number of the form "v0.3.7" / "0.3.7" into a [3]int.
//
// It only accepts a clean three-part form: on a non-tag build, build.sh uses git describe to
// produce suffixed versions like "0.3.7-2-gabc1234", which must be judged incomparable rather than
// treated as 0.3.7 — otherwise a development build would be mistaken for "already the latest" or be
// overwritten by an official release.
func parseVersion(s string) ([3]int, bool) {
	s = strings.TrimSpace(s)
	s = strings.TrimPrefix(s, "v")
	if s == "" {
		return [3]int{}, false
	}
	parts := strings.Split(s, ".")
	if len(parts) != 3 {
		return [3]int{}, false
	}
	var out [3]int
	for i, p := range parts {
		n, err := strconv.Atoi(p)
		if err != nil || n < 0 {
			return [3]int{}, false
		}
		out[i] = n
	}
	return out, true
}

// InDocker reports whether the process is running inside a container. Under Docker the swap writes
// to the container's writable layer, and `docker compose up -d` rebuilding the container reverts to
// the version shipped in the image — this is expected behavior (at that point the user is pulling a
// new image anyway), but the frontend needs to be able to explain it clearly.
func InDocker() bool {
	if _, err := os.Stat("/.dockerenv"); err == nil {
		return true
	}
	b, err := os.ReadFile("/proc/1/cgroup")
	if err != nil {
		return false
	}
	s := string(b)
	return strings.Contains(s, "docker") || strings.Contains(s, "containerd")
}

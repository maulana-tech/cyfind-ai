package agent

import (
	"log"
	"path/filepath"

	"github.com/Autumn-27/norma/agentcore"
	"github.com/Autumn-27/norma/noaadapter"
)

// noaWarn returns a diagnostics sink tagging non-fatal noa messages with the
// session, routed through the package logger (agents have no per-instance one).
func noaWarn(session string) func(string) {
	return func(msg string) { log.Printf("[noa] %s: %s", session, msg) }
}

// noa is the "model-driven context compaction" mechanism introduced in norma v0.4.0, exposed as a platform experimental feature the user toggles in
// system settings. It is mutually exclusive with the built-in compaction: noaadapter.Enable is the sole entry point, attaching in one call
// the context takeover (Compactor), the Compress tool, and three resident prompt segments; not calling Enable means it is off
// (the built-in compaction works as usual). The switch is resolved by the noaEnabledFn each agent injects, read once
// per run, so toggling only affects runs started afterward, with no need to rebuild the agent.

// enableNoa wires noa into opts when the resolver reports it on. archiveRoot is the persistence base directory for compressed originals
// (the global workDir; all agents land under <workDir>/noa, not scattered across task/intent directories), and sessionID
// names the archive subdirectory beneath it (globally unique, so there is no collision within the same base directory).
//
// noa is experimental: a wiring failure must not interrupt a real task. On error it reports via onWarn and falls back to the built-in compaction.
// On successful enable it clears opts.Compaction, to avoid agentcore warning about "two context managers set at once".
func enableNoa(opts *agentcore.Options, enabled func() bool, archiveRoot, sessionID string, onWarn func(string)) {
	if enabled == nil || !enabled() {
		return
	}
	if opts.OnWarn == nil {
		opts.OnWarn = onWarn
	}
	if err := noaadapter.Enable(opts, noaadapter.Options{
		ArchiveBaseDir: filepath.Join(archiveRoot, "noa"),
		SessionID:      sessionID,
		OnWarn:         onWarn,
	}); err != nil {
		if onWarn != nil {
			onWarn("failed to enable noa compaction, falling back to the built-in compaction: " + err.Error())
		}
		return
	}
	// Compactor overrides Compaction, but with both present agentcore warns every time; clear it explicitly.
	opts.Compaction = nil
}

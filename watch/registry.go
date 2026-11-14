package watch

import (
	"context"
	"sync"
)

// Store is what the Registry needs from persistence: the active watches to run,
// and a place to record detections. The host (db + a server adapter) implements
// it; tests use a fake. The db layer stays ignorant of this package.
type Store interface {
	ListActiveWatches() ([]Watch, error)
	RecordDetection(Detection) error
}

// ReaderFactory builds a chain reader for a watch (by chain + RPC endpoint). It
// returns an error when the chain family is not supported (phase 5): the registry
// then SKIPS that watch with a log rather than mis-reading it. Pluggable so each
// family registers its own reader; EVM ships, others are the extension point.
type ReaderFactory func(chain, rpcURL string) (Reader, error)

// Registry owns the running Watcher goroutines and keeps them in sync with the
// active watches in the Store. Observe-only (phase 1): a detection is recorded
// and logged, nothing on-chain is touched.
type Registry struct {
	store     Store
	newReader ReaderFactory
	logf      func(string, ...any)

	// Optional pre-exec (phase 3) factories; when both set, watches with
	// Preexec=true also get a mempool PreExecWatcher. nil = pre-exec disabled.
	newPending func(chain, rpcURL string) (PendingSource, error)
	newSim     func(chain, rpcURL string) Simulator

	// Optional response (phase 4): a watch with a non-observe plan drives a
	// Responder on each detection. gate nil → Act is fail-safe (blocked);
	// exec nil → ManualExecutor (never signs).
	gate       Gate
	exec       Executor
	recordResp func(ResponseEvent)

	alerter Alerter // optional external alert channel (notify pipeline)

	mu      sync.Mutex
	running map[string]context.CancelFunc // watch id -> cancel
	wg      sync.WaitGroup
}

// EnableResponse turns on the response tiers (phase 4). gate/exec/record may be
// nil (then Act is blocked, execution is manual, and response events are only
// logged). Call before Sync.
func (r *Registry) EnableResponse(gate Gate, exec Executor, record func(ResponseEvent)) {
	r.gate = gate
	r.exec = exec
	r.recordResp = record
}

// EnablePreexec turns on mempool pre-exec watching: watches with Preexec=true
// will also run a PreExecWatcher built from these factories. Call before Sync.
func (r *Registry) EnablePreexec(newPending func(chain, rpcURL string) (PendingSource, error), newSim func(chain, rpcURL string) Simulator) {
	r.newPending = newPending
	r.newSim = newSim
}

// NewRegistry builds a registry. logf may be nil (then logs are dropped).
func NewRegistry(store Store, rf ReaderFactory, logf func(string, ...any)) *Registry {
	if logf == nil {
		logf = func(string, ...any) {}
	}
	return &Registry{store: store, newReader: rf, logf: logf, running: map[string]context.CancelFunc{}}
}

// EnableAlerts wires an external alert channel (the notify pipeline). Call before Sync.
func (r *Registry) EnableAlerts(a Alerter) { r.alerter = a }

// storeSink persists + logs each detection, and (if wired) forwards it to the
// external alert channel — the phase-1 Sink.
type storeSink struct {
	store   Store
	alerter Alerter
	logf    func(string, ...any)
}

func (s storeSink) Emit(d Detection) {
	if err := s.store.RecordDetection(d); err != nil {
		s.logf("[watch] record detection (watch=%s): %v", d.WatchID, err)
	}
	s.logf("[watch] DETECTION watch=%s kind=%s rule=%s block=%d %s", d.WatchID, d.Kind, d.RuleID, d.Block, d.Observed)
	if s.alerter != nil {
		s.alerter.Alert(d) // fire-and-forget; impl must not block or panic
	}
}

// responseSink persists+logs the detection (via base) and then drives the
// watch's response tier (phase 4). ctx is the watcher's lifetime context.
type responseSink struct {
	base Sink
	resp *Responder
	ctx  context.Context
}

func (s responseSink) Emit(d Detection) {
	s.base.Emit(d)
	s.resp.Respond(s.ctx, d)
}

// Sync reconciles the running watchers with the Store's active set: it starts a
// Watcher for every active watch not already running and stops any running
// watcher no longer active. Call it on startup and whenever watches change.
func (r *Registry) Sync(ctx context.Context) error {
	active, err := r.store.ListActiveWatches()
	if err != nil {
		return err
	}
	want := make(map[string]Watch, len(active))
	for _, w := range active {
		want[w.ID] = w
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	// Stop watchers that are no longer active.
	for id, cancel := range r.running {
		if _, ok := want[id]; !ok {
			cancel()
			delete(r.running, id)
			r.logf("[watch] stopped watch=%s", id)
		}
	}
	// Start watchers newly active.
	for id, w := range want {
		if _, ok := r.running[id]; ok {
			continue
		}
		reader, err := r.newReader(w.Chain, w.RPCURL)
		if err != nil {
			// Phase 5: an unsupported chain family is skipped, not mis-read.
			r.logf("[watch] watch=%s chain=%s unsupported, skipped: %v", id, w.Chain, err)
			continue
		}
		wctx, cancel := context.WithCancel(ctx)
		r.running[id] = cancel
		var sink Sink = storeSink{store: r.store, alerter: r.alerter, logf: r.logf}
		// Phase 4: a non-observe plan wraps the sink so each detection also drives
		// the tiered response (recommend / gated act).
		if t := w.Response.Tier; t != "" && t != TierObserve {
			resp := NewResponder(w.Response, r.gate, r.exec, r.recordResp, r.logf)
			sink = responseSink{base: sink, resp: resp, ctx: wctx}
		}
		wt := NewWatcher(w, reader, sink)
		wt.OnError(func(condID string, e error) {
			r.logf("[watch] watch=%s cond=%s inconclusive: %v", w.ID, condID, e)
		})
		r.wg.Add(1)
		go func(w Watch) {
			defer r.wg.Done()
			r.logf("[watch] started watch=%s %s@%s", w.ID, w.Address, w.Chain)
			wt.Run(wctx)
		}(w)

		// Optional mempool pre-exec watcher (phase 3), under the same cancel.
		if w.Preexec && r.newPending != nil && r.newSim != nil {
			src, err := r.newPending(w.Chain, w.RPCURL)
			if err != nil {
				r.logf("[watch] watch=%s pre-exec source: %v (pre-exec disabled for it)", w.ID, err)
				continue
			}
			pe := NewPreExecWatcher(w, src, r.newSim(w.Chain, w.RPCURL), sink)
			pe.OnError(func(ruleID string, e error) {
				r.logf("[watch] watch=%s preexec rule=%s inconclusive: %v", w.ID, ruleID, e)
			})
			r.wg.Add(1)
			go func(w Watch) {
				defer r.wg.Done()
				r.logf("[watch] started pre-exec watch=%s", w.ID)
				if err := pe.Run(wctx); err != nil && wctx.Err() == nil {
					r.logf("[watch] pre-exec watch=%s stopped: %v", w.ID, err)
				}
			}(w)
		}
	}
	return nil
}

// Running returns the number of active watcher goroutines (for status/tests).
func (r *Registry) Running() int {
	r.mu.Lock()
	defer r.mu.Unlock()
	return len(r.running)
}

// Stop cancels every running watcher and waits for the goroutines to exit.
func (r *Registry) Stop() {
	r.mu.Lock()
	for id, cancel := range r.running {
		cancel()
		delete(r.running, id)
	}
	r.mu.Unlock()
	r.wg.Wait()
}

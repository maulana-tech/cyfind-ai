package watch

import (
	"context"
	"time"
)

// Pre-execution watching (phase 3): instead of reacting after a block, watch the
// mempool and simulate each pending transaction to see whether it WOULD break an
// invariant before it is included — the Forta-Firewall / Hexagate "detect before
// it lands" pattern. Observe-only: a pre-exec detection is an early alert; it does
// not block the tx (blocking is the Act tier, phase 4).

// PendingTx is a transaction seen in the mempool, not yet mined.
type PendingTx struct {
	Hash  string `json:"hash"`
	From  string `json:"from"`
	To    string `json:"to"`
	Input string `json:"input"`
	Value string `json:"value"`
}

// PendingSource is a feed of mempool transactions until ctx is cancelled.
type PendingSource interface {
	Pending(ctx context.Context) (<-chan PendingTx, error)
}

// Simulator reads contract state AS IF a pending tx were applied first — the
// pre-exec simulation primitive (backed by eth_simulateV1 / a fork / the pending
// block). It lets the same invariant Conditions be checked against the would-be
// post-state.
type Simulator interface {
	SimulateCall(ctx context.Context, tx PendingTx, to, data string) (string, error)
}

// simReader adapts (Simulator, tx) into a Reader so Condition.evaluate can run
// against the simulated post-state. BlockNumber/GetLogs are unused by invariant
// conditions (pre-exec checks invariants, not logs), so they are inert.
type simReader struct {
	sim Simulator
	tx  PendingTx
}

func (s simReader) BlockNumber(context.Context) (uint64, error)       { return 0, nil }
func (s simReader) GetLogs(context.Context, LogFilter) ([]Log, error) { return nil, nil }
func (s simReader) Call(ctx context.Context, to, data, _ string) (string, error) {
	return s.sim.SimulateCall(ctx, s.tx, to, data)
}

// PreExecWatcher consumes pending txs for one Watch and, for each, simulates the
// tx and checks whether any invariant Condition would be violated post-tx,
// emitting a Detection (Kind "preexec") carrying the pending tx hash.
type PreExecWatcher struct {
	w       Watch
	src     PendingSource
	sim     Simulator
	sink    Sink
	onError func(ruleID string, err error)
}

// NewPreExecWatcher builds a pre-exec watcher. src, sim and sink must be non-nil.
func NewPreExecWatcher(w Watch, src PendingSource, sim Simulator, sink Sink) *PreExecWatcher {
	return &PreExecWatcher{w: w, src: src, sim: sim, sink: sink}
}

// OnError sets a callback for inconclusive simulations (optional).
func (p *PreExecWatcher) OnError(fn func(ruleID string, err error)) { p.onError = fn }

// Run consumes the pending feed until ctx is cancelled or the feed closes.
func (p *PreExecWatcher) Run(ctx context.Context) error {
	ch, err := p.src.Pending(ctx)
	if err != nil {
		return err
	}
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case tx, ok := <-ch:
			if !ok {
				return nil
			}
			p.evalTx(ctx, tx)
		}
	}
}

// evalTx simulates one pending tx and emits a pre-exec detection for each
// invariant it would violate. Exported-package-internal for direct testing.
func (p *PreExecWatcher) evalTx(ctx context.Context, tx PendingTx) {
	r := simReader{sim: p.sim, tx: tx}
	for _, c := range p.w.Conditions {
		held, observed, err := c.evaluate(ctx, r, p.w.Address, "latest")
		if err != nil {
			if p.onError != nil {
				p.onError(c.ID, err)
			}
			continue // inconclusive simulation is not a violation
		}
		if !held {
			p.sink.Emit(Detection{
				WatchID:  p.w.ID,
				Kind:     "preexec",
				RuleID:   c.ID,
				Label:    c.Invariant,
				TxHash:   tx.Hash,
				Observed: "would violate post-tx: " + observed,
				At:       time.Now(),
			})
		}
	}
}

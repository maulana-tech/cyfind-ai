package watch

import (
	"context"
	"fmt"
	"math/big"
	"time"
)

// Watcher runs one Watch: it polls the chain and, each new block, evaluates every
// invariant condition (at the latest block) and every detector rule (over the
// block range since the last poll), emitting a Detection for each violation /
// match. Observe-only (phase 1/2) — it reads and reports, and moves nothing.
type Watcher struct {
	w      Watch
	reader Reader
	sink   Sink
	// onError is called for a read/evaluation error (inconclusive, not a
	// violation); nil = ignore. Keeps the loop alive through transient RPC faults.
	onError func(ruleID string, err error)

	lastBlock uint64
	deltaLast map[string]*big.Int // delta-rule previous readings, keyed by rule id
}

// NewWatcher builds a Watcher. sink must be non-nil.
func NewWatcher(w Watch, reader Reader, sink Sink) *Watcher {
	return &Watcher{w: w, reader: reader, sink: sink, deltaLast: map[string]*big.Int{}}
}

// OnError sets a callback for inconclusive reads (optional).
func (wt *Watcher) OnError(fn func(ruleID string, err error)) { wt.onError = fn }

// Tick performs one evaluation pass at the latest block: it checks every
// condition and emits a Detection for each violation. It is idempotent per block
// — if the latest block has not advanced since the last Tick, it is a no-op and
// returns (0, false). Returns the block it evaluated and whether it ran.
func (wt *Watcher) Tick(ctx context.Context) (block uint64, ran bool, err error) {
	bn, err := wt.reader.BlockNumber(ctx)
	if err != nil {
		return 0, false, fmt.Errorf("block number: %w", err)
	}
	if bn == wt.lastBlock {
		return bn, false, nil // nothing new since last pass
	}
	first := wt.lastBlock == 0
	prev := wt.lastBlock
	wt.lastBlock = bn

	// Invariant conditions — evaluated at the latest block.
	for _, c := range wt.w.Conditions {
		held, observed, evErr := c.evaluate(ctx, wt.reader, wt.w.Address, "latest")
		if evErr != nil {
			wt.reportErr(c.ID, evErr)
			continue // inconclusive — a read failure is not a violation
		}
		if !held {
			wt.emit(Detection{Kind: "invariant", RuleID: c.ID, Label: c.Invariant, Block: bn, Observed: observed})
		}
	}

	// Detector rules — evaluated over the block range since the last poll. On the
	// first tick scan only the current block (never the whole chain history).
	from := prev + 1
	if first {
		from = bn
	}
	for _, spec := range wt.w.Rules {
		var dets []Detection
		var evErr error
		switch spec.Type {
		case "event":
			dets, evErr = evaluateEvent(ctx, wt.reader, wt.w.ID, wt.w.Address, spec, from, bn)
		case "delta":
			dets, evErr = evaluateDelta(ctx, wt.reader, wt.w.ID, wt.w.Address, spec, wt.deltaLast, bn)
		default:
			continue
		}
		if evErr != nil {
			wt.reportErr(spec.ID, evErr)
			continue
		}
		for _, d := range dets {
			wt.emit(d)
		}
	}
	return bn, true, nil
}

func (wt *Watcher) emit(d Detection) {
	d.WatchID = wt.w.ID
	d.At = time.Now()
	wt.sink.Emit(d)
}

func (wt *Watcher) reportErr(ruleID string, err error) {
	if wt.onError != nil {
		wt.onError(ruleID, err)
	}
}

// Run polls on the Watch's interval until ctx is cancelled, calling Tick each
// time. A per-Tick error is reported via OnError (when set) and does not stop the
// loop — monitoring must survive transient RPC faults. Interval defaults to 12s
// (≈ one Ethereum block) when unset.
func (wt *Watcher) Run(ctx context.Context) {
	interval := wt.w.Interval
	if interval <= 0 {
		interval = 12 * time.Second
	}
	t := time.NewTicker(interval)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			if _, _, err := wt.Tick(ctx); err != nil && wt.onError != nil {
				wt.onError("", err)
			}
		}
	}
}

package watch

import (
	"context"
	"encoding/json"
	"time"
)

// EVM-backed pre-exec plumbing: a mempool PendingSource (via a pending-tx filter)
// and a Simulator. These are the phase-3 "chain source adapter" for the mempool.

// newPendingTxFilter installs an eth_newPendingTransactionFilter and returns its id.
func (r *EVMReader) newPendingTxFilter(ctx context.Context) (string, error) {
	res, err := r.do(ctx, "eth_newPendingTransactionFilter")
	if err != nil {
		return "", err
	}
	var id string
	return id, json.Unmarshal(res, &id)
}

// getFilterChanges returns the new pending-tx hashes since the last poll.
func (r *EVMReader) getFilterChanges(ctx context.Context, id string) ([]string, error) {
	res, err := r.do(ctx, "eth_getFilterChanges", id)
	if err != nil {
		return nil, err
	}
	var hashes []string
	return hashes, json.Unmarshal(res, &hashes)
}

// getTransactionByHash fetches one tx's fields; ok=false when not found yet.
func (r *EVMReader) getTransactionByHash(ctx context.Context, hash string) (PendingTx, bool, error) {
	res, err := r.do(ctx, "eth_getTransactionByHash", hash)
	if err != nil {
		return PendingTx{}, false, err
	}
	return parseTx(res)
}

// parseTx decodes an eth_getTransactionByHash result. Split out for tests.
func parseTx(res json.RawMessage) (PendingTx, bool, error) {
	if len(res) == 0 || string(res) == "null" {
		return PendingTx{}, false, nil
	}
	var raw struct {
		Hash  string `json:"hash"`
		From  string `json:"from"`
		To    string `json:"to"`
		Input string `json:"input"`
		Value string `json:"value"`
	}
	if err := json.Unmarshal(res, &raw); err != nil {
		return PendingTx{}, false, err
	}
	return PendingTx(raw), true, nil
}

// EVMPendingSource is a mempool feed built on a pending-tx filter: it polls for
// new hashes and resolves each to a PendingTx. Hash-only nodes without
// eth_getTransactionByHash details yield txs with empty fields, which the watcher
// simply can't evaluate (inconclusive) — acceptable for observe-only.
type EVMPendingSource struct {
	reader   *EVMReader
	interval time.Duration
}

// NewEVMPendingSource builds a mempool source polling at `interval` (default 3s).
func NewEVMPendingSource(reader *EVMReader, interval time.Duration) *EVMPendingSource {
	if interval <= 0 {
		interval = 3 * time.Second
	}
	return &EVMPendingSource{reader: reader, interval: interval}
}

// Pending implements PendingSource.
func (s *EVMPendingSource) Pending(ctx context.Context) (<-chan PendingTx, error) {
	id, err := s.reader.newPendingTxFilter(ctx)
	if err != nil {
		return nil, err
	}
	out := make(chan PendingTx, 64)
	go func() {
		defer close(out)
		t := time.NewTicker(s.interval)
		defer t.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-t.C:
				hashes, err := s.reader.getFilterChanges(ctx, id)
				if err != nil {
					continue // transient; keep polling
				}
				for _, h := range hashes {
					tx, ok, err := s.reader.getTransactionByHash(ctx, h)
					if err != nil || !ok {
						tx = PendingTx{Hash: h} // hash-only; evaluation will be inconclusive
					}
					select {
					case out <- tx:
					case <-ctx.Done():
						return
					}
				}
			}
		}
	}()
	return out, nil
}

// pendingCallSimulator is a lightweight Simulator: it reads state at the node's
// "pending" block (which already reflects the mempool the node assembled). This
// is an APPROXIMATION — it does not isolate the single tx's effect. The faithful
// upgrade is an eth_simulateV1 / anvil-fork backend that applies exactly `tx`
// before the call; that implements the same interface and drops in unchanged.
type pendingCallSimulator struct{ reader *EVMReader }

// NewPendingBlockSimulator builds the approximate "pending block" simulator.
func NewPendingBlockSimulator(reader *EVMReader) Simulator {
	return pendingCallSimulator{reader: reader}
}

func (s pendingCallSimulator) SimulateCall(ctx context.Context, _ PendingTx, to, data string) (string, error) {
	return s.reader.Call(ctx, to, data, "pending")
}

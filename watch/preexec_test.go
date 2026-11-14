package watch

import (
	"context"
	"encoding/json"
	"testing"
)

type fakeSim struct {
	call func(to, data string) (string, error)
}

func (f fakeSim) SimulateCall(_ context.Context, _ PendingTx, to, data string) (string, error) {
	return f.call(to, data)
}

type fakePendingSrc struct{ txs []PendingTx }

func (f fakePendingSrc) Pending(context.Context) (<-chan PendingTx, error) {
	ch := make(chan PendingTx, len(f.txs))
	for _, tx := range f.txs {
		ch <- tx
	}
	close(ch)
	return ch, nil
}

func TestParseTx(t *testing.T) {
	tx, ok, err := parseTx(json.RawMessage(`{"hash":"0xh","from":"0xf","to":"0xA","input":"0xdead","value":"0x0"}`))
	if err != nil || !ok || tx.Hash != "0xh" || tx.To != "0xA" {
		t.Fatalf("parseTx bad: %+v ok=%v err=%v", tx, ok, err)
	}
	if _, ok2, _ := parseTx(json.RawMessage(`null`)); ok2 {
		t.Error("null tx should yield ok=false")
	}
}

func TestPreExecEvalTxViolation(t *testing.T) {
	// simulated post-tx: assets=80, supply=100 → "assets>=supply" would be violated
	sim := fakeSim{call: func(_, data string) (string, error) {
		if data == "0xASSETS" {
			return "0x50", nil // 80
		}
		return "0x64", nil // 100
	}}
	w := Watch{ID: "w1", Address: "0xA", Conditions: []Condition{
		{ID: "backed", Invariant: "assets>=supply", Left: Call{Data: "0xASSETS"}, Right: &Call{Data: "0xSUPPLY"}, Cmp: ">="},
	}}
	sink := &capSink{}
	p := NewPreExecWatcher(w, fakePendingSrc{}, sim, sink)
	p.evalTx(context.Background(), PendingTx{Hash: "0xtx"})
	if len(sink.got) != 1 || sink.got[0].Kind != "preexec" || sink.got[0].TxHash != "0xtx" || sink.got[0].RuleID != "backed" {
		t.Fatalf("expected 1 preexec detection for 0xtx, got %+v", sink.got)
	}
}

func TestPreExecEvalTxHolds(t *testing.T) {
	// assets=120 >= supply=100 → holds → no detection
	sim := fakeSim{call: func(_, data string) (string, error) {
		if data == "0xASSETS" {
			return "0x78", nil // 120
		}
		return "0x64", nil // 100
	}}
	w := Watch{ID: "w1", Address: "0xA", Conditions: []Condition{
		{ID: "backed", Left: Call{Data: "0xASSETS"}, Right: &Call{Data: "0xSUPPLY"}, Cmp: ">="},
	}}
	sink := &capSink{}
	p := NewPreExecWatcher(w, fakePendingSrc{}, sim, sink)
	p.evalTx(context.Background(), PendingTx{Hash: "0xtx"})
	if len(sink.got) != 0 {
		t.Fatalf("holding invariant should not alert pre-exec, got %+v", sink.got)
	}
}

func TestPreExecRunConsumesFeed(t *testing.T) {
	sim := fakeSim{call: func(_, _ string) (string, error) { return "0x0", nil }} // violates nonzero-less checks? use boolean
	w := Watch{ID: "w1", Address: "0xA", Conditions: []Condition{
		{ID: "alive", Left: Call{Data: "0xTRUE"}}, // boolean: 0x0 → false → violation on every tx
	}}
	sink := &capSink{}
	src := fakePendingSrc{txs: []PendingTx{{Hash: "0x1"}, {Hash: "0x2"}}}
	p := NewPreExecWatcher(w, src, sim, sink)
	if err := p.Run(context.Background()); err != nil {
		t.Fatalf("Run returned %v", err)
	}
	if len(sink.got) != 2 {
		t.Fatalf("expected 2 preexec detections (one per tx), got %d", len(sink.got))
	}
}

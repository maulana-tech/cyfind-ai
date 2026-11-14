package watch

import (
	"context"
	"encoding/json"
	"fmt"
	"math/big"
	"testing"
)

// word32 renders n as a 0x + 32-byte (64 hex) word, like an ABI-encoded uint256.
func word32(n int64) string { return fmt.Sprintf("0x%064x", n) }

func bign(n int64) *big.Int { return big.NewInt(n) }

func TestParseLogsAndDataWord(t *testing.T) {
	res := json.RawMessage(`[{"address":"0xA","topics":["0xTOPIC"],"data":"` + word32(150) + `","blockNumber":"0x10","transactionHash":"0xtx"}]`)
	logs, err := parseLogs(res)
	if err != nil {
		t.Fatal(err)
	}
	if len(logs) != 1 || logs[0].BlockNumber != 16 || logs[0].TxHash != "0xtx" || logs[0].Topics[0] != "0xTOPIC" {
		t.Fatalf("bad parse: %+v", logs)
	}
	w, err := dataWord(logs[0].Data, 0)
	if err != nil || w.Int64() != 150 {
		t.Errorf("dataWord = %v err=%v, want 150", w, err)
	}
	if _, err := dataWord("0x", 1); err == nil {
		t.Error("expected out-of-range error for word 1 of empty data")
	}
}

func TestParseUintFlexibleAndBps(t *testing.T) {
	for in, want := range map[string]int64{"0x64": 100, "100": 100, "0xa": 10} {
		n, err := parseUintFlexible(in)
		if err != nil || n.Int64() != want {
			t.Errorf("parseUintFlexible(%q)=%v err=%v want %d", in, n, err, want)
		}
	}
	// 100 → 120 is +2000 bps (20%). max 1000 → exceeded; max 3000 → not.
	ex, bps := bpsChangeExceeds(bign(100), bign(120), 1000)
	if !ex || bps != "2000" {
		t.Errorf("expected exceed with 2000 bps, got ex=%v bps=%s", ex, bps)
	}
	if ex2, _ := bpsChangeExceeds(bign(100), bign(120), 3000); ex2 {
		t.Error("2000 bps should not exceed max 3000")
	}
	// off-zero = infinite change
	if ex3, b := bpsChangeExceeds(bign(0), bign(1), 100000); !ex3 || b != "inf" {
		t.Errorf("off-zero should be inf/exceed, got ex=%v b=%s", ex3, b)
	}
}

func TestEvaluateEventThreshold(t *testing.T) {
	ctx := context.Background()
	r := &fakeReader{logs: func(LogFilter) ([]Log, error) {
		return []Log{{Address: "0xA", Topics: []string{"0xTOPIC"}, Data: word32(120), BlockNumber: 9, TxHash: "0xtx"}}, nil
	}}
	// threshold 100 → fires
	spec := RuleSpec{ID: "big-transfer", Type: "event", Desc: "large transfer", Topic0: "0xTOPIC", MinValue: "100"}
	dets, err := evaluateEvent(ctx, r, "w1", "0xA", spec, 9, 9)
	if err != nil || len(dets) != 1 || dets[0].Kind != "event" || dets[0].TxHash != "0xtx" || dets[0].Block != 9 {
		t.Fatalf("expected 1 event detection, got %+v err=%v", dets, err)
	}
	// threshold 1000 → below, no detection
	spec.MinValue = "1000"
	dets2, _ := evaluateEvent(ctx, r, "w1", "0xA", spec, 9, 9)
	if len(dets2) != 0 {
		t.Errorf("value 120 should be below threshold 1000, got %d", len(dets2))
	}
	// no threshold → fires on presence
	spec.MinValue = ""
	dets3, _ := evaluateEvent(ctx, r, "w1", "0xA", spec, 9, 9)
	if len(dets3) != 1 {
		t.Errorf("presence match expected, got %d", len(dets3))
	}
}

func TestEvaluateDeltaBaselineThenJump(t *testing.T) {
	ctx := context.Background()
	val := "0x64" // 100
	r := &fakeReader{call: func(_, _ string) (string, error) { return val, nil }}
	spec := RuleSpec{ID: "oracle", Type: "delta", Desc: "oracle deviation", Call: Call{To: "0xA", Data: "0xPRICE"}, MaxBps: 1000}
	last := map[string]*big.Int{}

	// first reading = baseline → no detection
	d0, err := evaluateDelta(ctx, r, "w1", "0xA", spec, last, 5)
	if err != nil || len(d0) != 0 {
		t.Fatalf("first reading is a baseline (no detection), got %+v err=%v", d0, err)
	}
	// jump 100 → 130 (+3000 bps) exceeds max 1000
	val = word32(130)
	d1, err := evaluateDelta(ctx, r, "w1", "0xA", spec, last, 6)
	if err != nil || len(d1) != 1 || d1[0].Kind != "delta" {
		t.Fatalf("expected 1 delta detection on jump, got %+v err=%v", d1, err)
	}
	// small move 130 → 131 (~77 bps) within max 1000 → no detection
	val = word32(131)
	d2, _ := evaluateDelta(ctx, r, "w1", "0xA", spec, last, 7)
	if len(d2) != 0 {
		t.Errorf("small move should not fire, got %d", len(d2))
	}
}

func TestWatcherTickWithRules(t *testing.T) {
	ctx := context.Background()
	r := &fakeReader{
		block: 50,
		call:  func(_, _ string) (string, error) { return "0x1", nil },
		logs: func(LogFilter) ([]Log, error) {
			return []Log{{Topics: []string{"0xUPGRADED"}, Data: "0x", BlockNumber: 50, TxHash: "0xabc"}}, nil
		},
	}
	w := Watch{ID: "w1", Address: "0xA", Rules: []RuleSpec{
		{ID: "upgrade", Type: "event", Desc: "proxy upgraded", Topic0: "0xUPGRADED"},
	}}
	sink := &capSink{}
	wt := NewWatcher(w, r, sink)
	if _, ran, err := wt.Tick(ctx); err != nil || !ran {
		t.Fatalf("tick ran=%v err=%v", ran, err)
	}
	if len(sink.got) != 1 || sink.got[0].Kind != "event" || sink.got[0].RuleID != "upgrade" || sink.got[0].WatchID != "w1" {
		t.Fatalf("expected 1 event detection from the rule, got %+v", sink.got)
	}
}

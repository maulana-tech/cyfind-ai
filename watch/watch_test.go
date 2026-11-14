package watch

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
)

// fakeReader scripts BlockNumber + Call + GetLogs responses for tests — no network.
type fakeReader struct {
	block   uint64
	call    func(to, data string) (string, error) // keyed by calldata
	callErr error
	logs    func(f LogFilter) ([]Log, error)
}

func (f *fakeReader) BlockNumber(context.Context) (uint64, error) { return f.block, nil }
func (f *fakeReader) Call(_ context.Context, to, data, _ string) (string, error) {
	if f.callErr != nil {
		return "", f.callErr
	}
	return f.call(to, data)
}
func (f *fakeReader) GetLogs(_ context.Context, flt LogFilter) ([]Log, error) {
	if f.logs == nil {
		return nil, nil
	}
	return f.logs(flt)
}

type capSink struct{ got []Detection }

func (s *capSink) Emit(d Detection) { s.got = append(s.got, d) }

func TestBuildRPCBody(t *testing.T) {
	body, err := buildRPCBody("eth_call", map[string]string{"to": "0xabc", "data": "0x1"}, "latest")
	if err != nil {
		t.Fatal(err)
	}
	var req rpcRequest
	if err := json.Unmarshal(body, &req); err != nil {
		t.Fatal(err)
	}
	if req.Method != "eth_call" || req.JSONRPC != "2.0" || len(req.Params) != 2 {
		t.Errorf("bad request: %+v", req)
	}
	// no-params method marshals an empty array, not null
	b2, _ := buildRPCBody("eth_blockNumber")
	if json.Valid(b2) == false || !contains(string(b2), `"params":[]`) {
		t.Errorf("empty params not []: %s", b2)
	}
}

func contains(s, sub string) bool { return len(s) >= len(sub) && (indexOf(s, sub) >= 0) }
func indexOf(s, sub string) int {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return i
		}
	}
	return -1
}

func TestParseRPCResult(t *testing.T) {
	res, err := parseRPCResult([]byte(`{"jsonrpc":"2.0","id":1,"result":"0x10"}`))
	if err != nil {
		t.Fatal(err)
	}
	var hex string
	_ = json.Unmarshal(res, &hex)
	if hex != "0x10" {
		t.Errorf("result = %q, want 0x10", hex)
	}
	if _, err := parseRPCResult([]byte(`{"jsonrpc":"2.0","id":1,"error":{"code":-32000,"message":"execution reverted"}}`)); err == nil {
		t.Error("expected rpc error, got nil")
	}
}

func TestHexToUint256(t *testing.T) {
	cases := map[string]int64{"0x0a": 10, "0xA": 10, "0x": 0, "": 0, "0x64": 100}
	for in, want := range cases {
		n, err := hexToUint256(in)
		if err != nil {
			t.Errorf("%q: unexpected err %v", in, err)
			continue
		}
		if n.Int64() != want {
			t.Errorf("hexToUint256(%q) = %d, want %d", in, n.Int64(), want)
		}
	}
	if _, err := hexToUint256("0xzz"); err == nil {
		t.Error("expected error for invalid hex")
	}
}

func TestConditionEvaluate(t *testing.T) {
	ctx := context.Background()
	// totalAssets=120, totalSupply=100 → "assets >= supply" holds.
	r := &fakeReader{call: func(_, data string) (string, error) {
		switch data {
		case "0xASSETS":
			return "0x78", nil // 120
		case "0xSUPPLY":
			return "0x64", nil // 100
		case "0xFALSE":
			return "0x0", nil
		case "0xTRUE":
			return "0x1", nil
		}
		return "0x0", nil
	}}
	cmp := Condition{ID: "c1", Left: Call{To: "0xA", Data: "0xASSETS"}, Right: &Call{To: "0xA", Data: "0xSUPPLY"}, Cmp: ">="}
	held, obs, err := cmp.evaluate(ctx, r, "0xA", "latest")
	if err != nil || !held {
		t.Errorf("expected held, got held=%v obs=%q err=%v", held, obs, err)
	}
	// reverse: supply >= assets should NOT hold (100 >= 120 is false)
	cmp2 := Condition{ID: "c2", Left: Call{Data: "0xSUPPLY"}, Right: &Call{Data: "0xASSETS"}, Cmp: ">="}
	held2, _, _ := cmp2.evaluate(ctx, r, "0xA", "latest")
	if held2 {
		t.Error("expected violation (100 >= 120 is false)")
	}
	// boolean: nonzero = holds
	b := Condition{ID: "b1", Left: Call{Data: "0xTRUE"}}
	hb, _, _ := b.evaluate(ctx, r, "0xA", "latest")
	if !hb {
		t.Error("boolean true should hold")
	}
	bf := Condition{ID: "b2", Left: Call{Data: "0xFALSE"}}
	hbf, _, _ := bf.evaluate(ctx, r, "0xA", "latest")
	if hbf {
		t.Error("boolean false should be a violation")
	}
	// read error → inconclusive (held=false, err set)
	rerr := &fakeReader{callErr: errors.New("rpc down"), call: func(_, _ string) (string, error) { return "", nil }}
	if _, _, err := cmp.evaluate(ctx, rerr, "0xA", "latest"); err == nil {
		t.Error("expected error on read failure")
	}
}

func TestWatcherTick(t *testing.T) {
	ctx := context.Background()
	r := &fakeReader{block: 100, call: func(_, data string) (string, error) {
		if data == "0xASSETS" {
			return "0x50", nil // 80
		}
		return "0x64", nil // supply 100 → assets(80) >= supply(100) is FALSE → violation
	}}
	w := Watch{ID: "w1", Address: "0xA", Conditions: []Condition{
		{ID: "backed", Invariant: "assets>=supply", Left: Call{Data: "0xASSETS"}, Right: &Call{Data: "0xSUPPLY"}, Cmp: ">="},
	}}
	sink := &capSink{}
	wt := NewWatcher(w, r, sink)

	blk, ran, err := wt.Tick(ctx)
	if err != nil || !ran || blk != 100 {
		t.Fatalf("tick: blk=%d ran=%v err=%v", blk, ran, err)
	}
	if len(sink.got) != 1 || sink.got[0].RuleID != "backed" || sink.got[0].Kind != "invariant" || sink.got[0].Block != 100 {
		t.Fatalf("expected 1 invariant detection at block 100, got %+v", sink.got)
	}

	// same block → no-op, no new detection
	_, ran2, _ := wt.Tick(ctx)
	if ran2 || len(sink.got) != 1 {
		t.Errorf("same-block tick should be a no-op; ran=%v dets=%d", ran2, len(sink.got))
	}

	// advance block, invariant now holds (assets 120 >= supply 100) → no detection
	r.block = 101
	r.call = func(_, data string) (string, error) {
		if data == "0xASSETS" {
			return "0x78", nil // 120
		}
		return "0x64", nil // 100
	}
	_, _, _ = wt.Tick(ctx)
	if len(sink.got) != 1 {
		t.Errorf("holding invariant should emit nothing new; dets=%d", len(sink.got))
	}
}

func TestWatcherTickReadErrorInconclusive(t *testing.T) {
	ctx := context.Background()
	r := &fakeReader{block: 5, callErr: errors.New("reverted"), call: func(_, _ string) (string, error) { return "", nil }}
	var errs int
	wt := NewWatcher(
		Watch{ID: "w", Address: "0xA", Conditions: []Condition{{ID: "c", Left: Call{Data: "0xX"}, Right: &Call{Data: "0xY"}, Cmp: ">="}}},
		r, &capSink{},
	)
	wt.OnError(func(string, error) { errs++ })
	sink := wt.sink.(*capSink)
	if _, _, err := wt.Tick(ctx); err != nil {
		t.Fatalf("tick itself should not error (block read ok): %v", err)
	}
	if len(sink.got) != 0 {
		t.Error("read error must NOT produce a detection (inconclusive)")
	}
	if errs != 1 {
		t.Errorf("expected 1 onError call, got %d", errs)
	}
}

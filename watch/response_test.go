package watch

import (
	"context"
	"errors"
	"testing"
)

type allowGate struct{}

func (allowGate) Authorize(context.Context, Detection, Action) error { return nil }

type denyGate struct{}

func (denyGate) Authorize(context.Context, Detection, Action) error {
	return errors.New("not authorized")
}

type signingExec struct{}

func (signingExec) Execute(context.Context, Detection, Action) (ExecResult, error) {
	return ExecResult{Performed: true, TxHash: "0xpause", Note: "paused"}, nil
}

func collect() (func(ResponseEvent), *[]ResponseEvent) {
	var evs []ResponseEvent
	return func(e ResponseEvent) { evs = append(evs, e) }, &evs
}

var det = Detection{WatchID: "w1", Kind: "invariant", RuleID: "backed", Block: 10}

func TestRespondObserveDoesNothing(t *testing.T) {
	rec, evs := collect()
	r := NewResponder(ResponsePlan{Tier: TierObserve, Actions: []Action{{ID: "pause"}}}, nil, nil, rec, nil)
	r.Respond(context.Background(), det)
	if len(*evs) != 0 {
		t.Fatalf("observe should emit no response events, got %d", len(*evs))
	}
}

func TestRespondRecommend(t *testing.T) {
	rec, evs := collect()
	r := NewResponder(ResponsePlan{Tier: TierRecommend, Actions: []Action{{ID: "pause", Desc: "pause the vault"}}}, nil, nil, rec, nil)
	r.Respond(context.Background(), det)
	if len(*evs) != 1 || (*evs)[0].Status != "recommended" || (*evs)[0].ActionID != "pause" {
		t.Fatalf("expected 1 recommended event, got %+v", *evs)
	}
}

func TestRespondActNoGateBlocked(t *testing.T) {
	rec, evs := collect()
	r := NewResponder(ResponsePlan{Tier: TierAct, Actions: []Action{{ID: "pause"}}}, nil, nil, rec, nil)
	r.Respond(context.Background(), det)
	if len(*evs) != 1 || (*evs)[0].Status != "blocked" {
		t.Fatalf("Act with no gate must be blocked, got %+v", *evs)
	}
}

func TestRespondActGatedManual(t *testing.T) {
	rec, evs := collect()
	// allow gate + default ManualExecutor → authorized but not performed
	r := NewResponder(ResponsePlan{Tier: TierAct, Actions: []Action{{ID: "pause"}}}, allowGate{}, nil, rec, nil)
	r.Respond(context.Background(), det)
	if len(*evs) != 1 || (*evs)[0].Status != "authorized" {
		t.Fatalf("allow+manual should be authorized, got %+v", *evs)
	}
}

func TestRespondActGatedExecuted(t *testing.T) {
	rec, evs := collect()
	r := NewResponder(ResponsePlan{Tier: TierAct, Actions: []Action{{ID: "pause"}}}, allowGate{}, signingExec{}, rec, nil)
	r.Respond(context.Background(), det)
	if len(*evs) != 1 || (*evs)[0].Status != "executed" || (*evs)[0].ActionTxHash != "0xpause" {
		t.Fatalf("allow+signing should execute, got %+v", *evs)
	}
}

func TestRespondActDenied(t *testing.T) {
	rec, evs := collect()
	r := NewResponder(ResponsePlan{Tier: TierAct, Actions: []Action{{ID: "pause"}}}, denyGate{}, signingExec{}, rec, nil)
	r.Respond(context.Background(), det)
	if len(*evs) != 1 || (*evs)[0].Status != "denied" {
		t.Fatalf("deny gate should deny, got %+v", *evs)
	}
}

func TestActionMatchesByRuleID(t *testing.T) {
	rec, evs := collect()
	// one action scoped to a different rule (skipped), one scoped to "backed" (fires)
	plan := ResponsePlan{Tier: TierRecommend, Actions: []Action{
		{ID: "x", OnRuleID: "other"},
		{ID: "pause", OnRuleID: "backed"},
	}}
	NewResponder(plan, nil, nil, rec, nil).Respond(context.Background(), det)
	if len(*evs) != 1 || (*evs)[0].ActionID != "pause" {
		t.Fatalf("only the matching action should fire, got %+v", *evs)
	}
}

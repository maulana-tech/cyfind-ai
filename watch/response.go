package watch

import (
	"context"
	"time"
)

// Response tiers (phase 4) — how a watch reacts to a Detection. The default is
// observe (alert only). Act executes a PRE-AUTHORIZED on-chain action, and ONLY
// through an approval Gate: a watch never moves funds autonomously.
//
// Safety model: Act requires BOTH a Gate (operator authorization) AND an
// Executor. The default Executor is ManualExecutor, which does NOT sign or send
// — it records the intended action for a human to perform. A real signing
// executor is an explicit, injected plug-in (operator keys + the gate); it is
// deliberately NOT provided here. With no Gate wired, Act is fail-safe: blocked.
type Tier string

const (
	TierObserve   Tier = "observe"   // alert only (default)
	TierRecommend Tier = "recommend" // propose a mitigation, do not execute
	TierAct       Tier = "act"       // execute a pre-authorized action, gated
)

// Action is a pre-authorized mitigation. The Act tier may ONLY run actions from
// a watch's plan — never an arbitrary call.
type Action struct {
	ID       string `json:"id"`
	Desc     string `json:"desc"`                 // e.g. "pause the vault"
	To       string `json:"to"`                   // target contract
	Data     string `json:"data"`                 // ABI-encoded calldata (e.g. pause() selector)
	OnRuleID string `json:"on_rule_id,omitempty"` // which detections trigger it ("" or "*" = any)
}

func (a Action) matches(d Detection) bool {
	return a.OnRuleID == "" || a.OnRuleID == "*" || a.OnRuleID == d.RuleID
}

// ResponsePlan is a watch's response configuration.
type ResponsePlan struct {
	Tier    Tier     `json:"tier"`    // defaults to observe
	Actions []Action `json:"actions"` // the pre-authorized set (Act's whitelist)
}

// Gate authorizes an Act-tier action before execution. The host wires it to
// CYFIND's approval mechanism (guard/intercept) + explicit operator authorization.
// Authorize returns nil to allow, or an error to deny/defer.
type Gate interface {
	Authorize(ctx context.Context, d Detection, a Action) error
}

// Executor performs an authorized action. ManualExecutor (the default) records
// the action instead of signing/sending, so the watch never transacts on its
// own. A signing executor is an explicit plug-in.
type Executor interface {
	Execute(ctx context.Context, d Detection, a Action) (ExecResult, error)
}

// ExecResult reports what an executor did.
type ExecResult struct {
	Performed bool   `json:"performed"` // false for ManualExecutor
	TxHash    string `json:"tx_hash,omitempty"`
	Note      string `json:"note,omitempty"`
}

// ManualExecutor records the intended action without signing/sending it.
type ManualExecutor struct{}

func (ManualExecutor) Execute(context.Context, Detection, Action) (ExecResult, error) {
	return ExecResult{Performed: false, Note: "manual action required (no signing executor wired)"}, nil
}

// ResponseEvent is the auditable record of how a watch responded to a detection.
type ResponseEvent struct {
	WatchID      string    `json:"watch_id"`
	RuleID       string    `json:"rule_id"` // the detection's rule/condition id
	Kind         string    `json:"kind"`    // the detection kind
	Block        uint64    `json:"block"`
	ActionID     string    `json:"action_id"`
	Tier         Tier      `json:"tier"`
	Status       string    `json:"status"` // recommended|authorized|executed|denied|blocked
	Note         string    `json:"note,omitempty"`
	ActionTxHash string    `json:"action_tx_hash,omitempty"`
	At           time.Time `json:"at"`
}

// Responder applies a watch's ResponsePlan to each Detection and emits
// ResponseEvents via record. gate/exec may be nil.
type Responder struct {
	plan   ResponsePlan
	gate   Gate
	exec   Executor
	record func(ResponseEvent)
	logf   func(string, ...any)
}

// NewResponder builds a responder. record/logf may be nil. exec defaults to
// ManualExecutor so Act never signs unless a real executor is injected.
func NewResponder(plan ResponsePlan, gate Gate, exec Executor, record func(ResponseEvent), logf func(string, ...any)) *Responder {
	if exec == nil {
		exec = ManualExecutor{}
	}
	if record == nil {
		record = func(ResponseEvent) {}
	}
	if logf == nil {
		logf = func(string, ...any) {}
	}
	return &Responder{plan: plan, gate: gate, exec: exec, record: record, logf: logf}
}

// Respond reacts to one detection according to the plan's tier.
func (r *Responder) Respond(ctx context.Context, d Detection) {
	tier := r.plan.Tier
	if tier == "" {
		tier = TierObserve
	}
	if tier == TierObserve {
		return // the alert (the Detection itself) is the whole response
	}
	for _, a := range r.plan.Actions {
		if !a.matches(d) {
			continue
		}
		ev := ResponseEvent{
			WatchID: d.WatchID, RuleID: d.RuleID, Kind: d.Kind, Block: d.Block,
			ActionID: a.ID, Tier: tier, At: time.Now(),
		}
		switch tier {
		case TierRecommend:
			ev.Status = "recommended"
			ev.Note = "proposed: " + firstNonEmptyStr(a.Desc, a.ID)
		case TierAct:
			if r.gate == nil {
				// Fail-safe: Act with no approval gate never executes.
				ev.Status = "blocked"
				ev.Note = "act requested but no approval gate configured; manual action required"
				break
			}
			if err := r.gate.Authorize(ctx, d, a); err != nil {
				ev.Status = "denied"
				ev.Note = "gate denied: " + err.Error()
				break
			}
			res, err := r.exec.Execute(ctx, d, a)
			if err != nil {
				ev.Status = "denied"
				ev.Note = "execute failed: " + err.Error()
				break
			}
			ev.ActionTxHash = res.TxHash
			if res.Performed {
				ev.Status = "executed"
				ev.Note = firstNonEmptyStr(res.Note, "action executed")
			} else {
				ev.Status = "authorized"
				ev.Note = firstNonEmptyStr(res.Note, "authorized; manual execution")
			}
		}
		r.logf("[watch] response watch=%s action=%s tier=%s status=%s", d.WatchID, a.ID, tier, ev.Status)
		r.record(ev)
	}
}

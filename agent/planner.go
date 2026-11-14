package agent

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"sync"

	"github.com/Autumn-27/cyfind/db"
	"github.com/Autumn-27/cyfind/intercept"
	"github.com/Autumn-27/norma/agentcore"
	"github.com/Autumn-27/norma/llm"
	"github.com/Autumn-27/norma/permission"
	actool "github.com/Autumn-27/norma/tool"
	"github.com/Autumn-27/norma/transcript"
)

// Planner is the event-driven LLM planner (docs §4.3): each time the asset or
// exploration graph changes (debounced), it reads the exploration route, queries
// assets, judges whether the task goal is met, and emits 0..N exploration intents
// into the frontier. It is the sole intent generator.
type Planner struct {
	findingRecorder   FindingRecorder
	prov              llm.Provider
	model             string
	tx                *transcript.Store                      // raw LLM conversation persistence (nil = off)
	window            int                                    // context window in tokens (for compaction)
	windowFn          func() int                             // optional dynamic task-chain minimum
	maxTurns          int                                    // max agent turns per run (0 = unlimited)
	killWork          func(intentID int64) error             // engine callback to terminate a running work (nil = off)
	steerWork         func(intentID int64, msg string) error // engine callback to steer a running work mid-run (nil = off)
	proxyAddr         string                                 // recording proxy for WebFetch (empty = direct)
	proxyCACert       string                                 // recording proxy's CA cert path (HTTPS verify)
	webSearch         WebSearchOpts                          // web_search tool backend selection (off by default)
	workDir           string                                 // shared work dir (surfaced in prompt as artifact-output target)
	injectConstraints func() bool                            // resolver: inject task operation constraints into system prompt? (nil = yes)
	nonStreamingFn    func() bool                            // resolver: use non-streaming (Complete) path? (nil = streaming)
	noaEnabledFn      func() bool                            // resolver: use experimental noa compaction? (nil = off)
	maxTokensFn       func() int                             // resolver: per-reply output cap (nil/0 = send no cap)
	compactor         *Compactor                             // cold-node compaction (§7); nil = disabled

	// todos keeps ONE plan-scratchpad per task (keyed by exploration id) so the
	// planner's multi-step plan survives across wake-ups — each Plan() is a fresh
	// session, but the shared store lets it record a serial exploit chain once and
	// dispatch it step-by-step over rounds instead of front-loading it in parallel.
	todoMu sync.Mutex
	todos  map[int64]*actool.TodoStore
}

func NewPlanner(prov llm.Provider, model, workDir string, tx *transcript.Store, window, maxTurns int) *Planner {
	return &Planner{prov: prov, model: model, workDir: workDir, tx: tx, window: window, maxTurns: maxTurns, todos: map[int64]*actool.TodoStore{}}
}

func (p *Planner) SetCompactionWindowResolver(fn func() int) { p.windowFn = fn }

// SetCompactor wires the cold-node compactor (cold-digest §7). Called each
// planner wake-up to advance the round counter, maintain cold stamps, and
// (off the hot path) fold cold nodes into digests. nil = feature disabled.
func (p *Planner) SetCompactor(c *Compactor) { p.compactor = c }

// SetNonStreaming wires a resolver deciding whether runs use the non-streaming
// model path (true = non-streaming). nil/unset = streaming (default).
func (p *Planner) SetNonStreaming(fn func() bool) { p.nonStreamingFn = fn }

func (p *Planner) nonStreaming() bool { return p.nonStreamingFn != nil && p.nonStreamingFn() }

// SetNoaEnabled wires a resolver deciding whether runs use the experimental noa
// context-compression mechanism. nil/unset = off (built-in compaction). Read per
// run so the settings toggle takes effect without rebuilding the agent.
func (p *Planner) SetNoaEnabled(fn func() bool) { p.noaEnabledFn = fn }

// SetMaxTokens wires a resolver for the per-reply output cap. nil/unset or 0 =
// send no cap and let the endpoint decide. Read per run, like nonStreaming.
func (p *Planner) SetMaxTokens(fn func() int) { p.maxTokensFn = fn }

func (p *Planner) maxTokens() int {
	if p.maxTokensFn == nil {
		return 0
	}
	return p.maxTokensFn()
}

func (p *Planner) compactionWindow() int {
	if p.windowFn != nil {
		return p.windowFn()
	}
	return p.window
}

// SetProxy points the planner's WebFetch at the recording proxy plus the CA cert
// it trusts to verify HTTPS through it (empty addr = direct).
func (p *Planner) SetProxy(addr, caCert string) { p.proxyAddr, p.proxyCACert = addr, caCert }

// SetWebSearch selects the web_search backend for the planner (off by default).
func (p *Planner) SetWebSearch(o WebSearchOpts) { p.webSearch = o }

// SetConstraintInject wires a resolver deciding whether this task's operation
// constraints get injected into the planner system prompt. Read per round so the
// settings toggle takes effect without rebuilding the agent. nil = inject (default).
func (p *Planner) SetConstraintInject(fn func() bool) { p.injectConstraints = fn }

// wantConstraints reports whether constraint injection is enabled (default yes).
func (p *Planner) wantConstraints() bool { return p.injectConstraints == nil || p.injectConstraints() }

// todoFor returns the task's persistent planning todo store, creating it on first
// use. Shared across all of this task's planner wake-ups.
func (p *Planner) todoFor(expID int64) *actool.TodoStore {
	p.todoMu.Lock()
	defer p.todoMu.Unlock()
	s := p.todos[expID]
	if s == nil {
		s = actool.NewTodoStore()
		p.todos[expID] = s
	}
	return s
}

// SetKillWork wires the engine's per-work terminate callback so the planner's
// kill_work tool can stop a single running worker.
func (p *Planner) SetKillWork(fn func(intentID int64) error) { p.killWork = fn }

// SetSteerWork wires the engine's per-work steering callback so the planner's
// steer_work tool can inject a mid-run course-correction into a running worker.
func (p *Planner) SetSteerWork(fn func(intentID int64, msg string) error) { p.steerWork = fn }

// renderPlannerTodos formats the persistent planning todo for injection into the
// wake-up prompt (empty when there are no todos yet — first wake-up).
func renderPlannerTodos(items []actool.Todo) string {
	if len(items) == 0 {
		return ""
	}
	var b strings.Builder
	b.WriteString("\n\n[Your planning to-do (preserved across wake-ups, written by you last round)]:\n")
	for _, it := range items {
		mark := map[actool.TodoStatus]string{actool.TodoPending: "☐", actool.TodoInProgress: "▶", actool.TodoCompleted: "✔"}[it.Status]
		if mark == "" {
			mark = "☐"
		}
		b.WriteString(fmt.Sprintf("  %s %s\n", mark, it.Content))
	}
	b.WriteString("Advance from it: dispatch an intent only for the next step whose prerequisites are complete / whose depended-on fact already exists; update the list with TodoWrite (mark steps satisfied by a fact as completed). Do not re-dispatch a step already pending/in_progress in the list.")
	return b.String()
}

// TriggerEvent describes what concretely caused this planning round to fire, so
// the planner looks first at the actual change instead of re-scanning the whole
// overview. Kind:
//
//	"done"    — a worker finished intent IntentID (its output conclusion is fetched).
//	"finding" — a worker reported a finding on intent IntentID (Detail = summary).
//	"goal"    — the human (via the main agent's set_goals) added one OR MORE goals in a
//	            single call (Goals = the goal texts added this time, 1+; set_goals supports batching).
//	"goal_deleted" — the human deleted a goal from the overview's goal management (Detail = the deleted goal's text).
//	"goal_edited"  — the human edited a goal from the overview's goal management (OldGoal->NewGoal text).
//	"cancelled" — the human deleted intent IntentID (Detail = the deletion reason). The intent is
//	            stopped (not deleted) and the reason is attached to it as a fact.
type TriggerEvent struct {
	Kind     string
	IntentID int64
	Detail   string
	Summary  string   // for Kind=="cancelled": the intent summary captured before deletion (after a hard delete the node no longer exists and cannot be queried)
	Goals    []string // for Kind=="goal": the goal texts added by this set_goals (one or more)
	OldGoal  string   // for Kind=="goal_edited": the goal text before the edit
	NewGoal  string   // for Kind=="goal_edited": the goal text after the edit
	Hints    []string // for Kind=="hint": the hint texts added by this add_hint (one or more)
}

// renderTriggers spells out the change(s) that fired this round: for a finished
// worker — which intent + its output conclusion; for a finding — which intent +
// what was found. Empty for time/heartbeat wakes. Reads the store (best-effort;
// a blank field never blocks the round).
func renderTriggers(ts *db.ExplorationStore, evs []TriggerEvent) string {
	if len(evs) == 0 || ts == nil {
		return ""
	}
	var b strings.Builder
	b.WriteString("\n\n[The actual changes that triggered this round (read this first, then decide whether to add directions)]:")
	for _, ev := range evs {
		switch ev.Kind {
		case "goal":
			if len(ev.Goals) == 1 {
				b.WriteString(fmt.Sprintf("\n- A human (via the main agent) added a goal: %s — a new goal to achieve; add an exploration direction accordingly (if there is no corresponding intent yet).", ev.Goals[0]))
			} else {
				b.WriteString(fmt.Sprintf("\n- A human (via the main agent) added %d goals: %s — all new goals to achieve; for each goal with no corresponding intent yet, add an exploration direction.", len(ev.Goals), strings.Join(ev.Goals, "；")))
			}
		case "hint":
			if len(ev.Hints) == 1 {
				b.WriteString(fmt.Sprintf("\n- A human (via the main agent) added a strategic hint: %s — it is attached to the exploration graph; adjust/add exploration directions accordingly (if there is no corresponding intent yet).", ev.Hints[0]))
			} else {
				b.WriteString(fmt.Sprintf("\n- A human (via the main agent) added %d strategic hints: %s — all attached to the exploration graph; adjust/add exploration directions for each accordingly.", len(ev.Hints), strings.Join(ev.Hints, "；")))
			}
		case "goal_deleted":
			b.WriteString(fmt.Sprintf("\n- A human deleted this goal: %s — the goal is removed; re-judge the remaining goals/directions accordingly (no need to dispatch intents for it anymore).", ev.Detail))
		case "goal_edited":
			b.WriteString(fmt.Sprintf("\n- A human edited a goal, from \"%s\" to \"%s\" — adjust exploration directions per the new goal (stop dispatching the old direction if it no longer applies).", ev.OldGoal, ev.NewGoal))
		case "finding":
			b.WriteString(fmt.Sprintf("\n- The worker of intent #%d (%s) reported a finding: %s", ev.IntentID, intentSummary(ts, ev.IntentID), ev.Detail))
		case "cancelled":
			// Prefer the Summary captured at deletion for the intent content (after a hard delete the node no longer exists and intentSummary cannot find it).
			sm := ev.Summary
			if sm == "" {
				sm = intentSummary(ts, ev.IntentID)
			}
			b.WriteString(fmt.Sprintf("\n- Intent #%d was deleted by the user; its content was: %s, and the deletion reason was: %s. The intent is deleted (no longer executed); replan accordingly.", ev.IntentID, sm, ev.Detail))
		default: // "done"
			b.WriteString(fmt.Sprintf("\n- The worker of intent #%d (%s) finished, with the output conclusion: %s", ev.IntentID, intentSummary(ts, ev.IntentID), workerOutput(ts, ev.IntentID)))
			if fids := factIDsYielded(ts, ev.IntentID); fids != "" {
				b.WriteString(fmt.Sprintf("; the fact ids newly produced by this intent: %s ", fids))
			}
		}
	}
	b.WriteString("\n(Full details can be looked up again with node_detail / get_worker_output / list_findings.)")
	return b.String()
}

// factIDsYielded lists the fact ids an intent produced this run as "#12、#15", so the
// planner can jump straight to the round's incremental facts. Empty (best-effort) when
// the intent yielded no facts or the lookup fails.
func factIDsYielded(ts *db.ExplorationStore, id int64) string {
	ids, err := ts.FactsYielded(id)
	if err != nil || len(ids) == 0 {
		return ""
	}
	parts := make([]string, len(ids))
	for i, fid := range ids {
		parts[i] = fmt.Sprintf("#%d", fid)
	}
	return strings.Join(parts, "、")
}

// intentSummary reads an intent node's one-line summary (best-effort, "?" on miss).
func intentSummary(ts *db.ExplorationStore, id int64) string {
	n, err := ts.GetNode(id)
	if err != nil || n == nil {
		return "?"
	}
	var p map[string]any
	if json.Unmarshal(n.Payload, &p) == nil {
		if s, ok := p["summary"].(string); ok && s != "" {
			return s
		}
	}
	return "?"
}

// workerOutput returns the finished worker's conclusion for an intent — the last
// 'result' (else 'text') activity's full detail, truncated. Same source get_worker_output uses.
func workerOutput(ts *db.ExplorationStore, id int64) string {
	acts, _, err := ts.ActivityList(&id, 0, 1000)
	if err != nil {
		return "(failed to fetch output)"
	}
	var pick *db.Activity
	for i := range acts {
		if acts[i].Kind == "result" {
			pick = &acts[i]
		} else if acts[i].Kind == "text" && pick == nil {
			pick = &acts[i]
		}
	}
	if pick == nil {
		return "(this work has no output record yet)"
	}
	out, _ := ts.ActivityDetail(pick.ID)
	if out == "" {
		out = pick.Summary
	}
	return truncOutput(out, 800)
}

// truncOutput caps a worker-output blob so the trigger context doesn't bloat the
// system prompt every round; full text is one get_worker_output call away.
func truncOutput(s string, n int) string {
	r := []rune(s)
	if len(r) <= n {
		return s
	}
	return string(r[:n]) + " …(truncated, full text via get_worker_output)"
}

// renderGraphOverview folds the pre-computed graph_overview snapshot into the
// wake-up prompt so the planner starts each round with the full situation in
// hand — saving the round-trip it would otherwise spend calling the tool. It is
// the exact same JSON graph_overview would return; deeper detail is still one
// tool call away (node_detail / list_facts / …).
func renderGraphOverview(data map[string]any) string {
	b, err := json.Marshal(data)
	if err != nil {
		return "" // fall back to the model calling graph_overview itself
	}
	return "\n\n[This round's state (graph_overview prefetched, equivalent to the return of calling that tool; call node_detail/list_facts, etc. on demand for details)]:\n" + string(b)
}

// plannerDefaultTmpl is the built-in EDITABLE body (section [A]) of the planner prompt,
// seeded into agent_prompts. Goal is a {{.Goal}} template var; the intermediate-output convention
// tail is code-owned (artifactSpec) and appended by plannerSystem after rendering.
const plannerDefaultTmpl = `You are the "planner" of an authorized penetration-testing system on a cybersecurity platform, woken frequently (woken whenever the graph changes). Your duties: read the state -> judge the goals -> **add exploration intents only when there is genuinely an uncovered new direction**. You are the planner, not the executor: everything you produce this round can only be [generating/clarifying intents] or [judging goals], and you must never do the actual work in the plan.

Task goal: {{.Goal}}

**How many intents to produce this round (think this through first)**:
- **Hard floor (highest priority)**: as long as [the goal is not achieved] and [there is currently no open or running intent] (frontier_open=0 and running_intents empty), this round you **must** produce at least one intent that advances toward the goal — with no running work to wait on and no queued direction, producing 0 intents = the task stalls; even if the known directions are only in recent_done, open a new one or re-dispatch one per the done/exhausted/blocked judgment below.
- Beyond the hard floor, **producing 0 intents is a normal result, but it needs a legitimate reason** (not a "fewer is safer" default): (1) **already covered** — every direction you can think of is already handled by an open/running intent (re-generating an existing intent with different wording is a serious error); (2) **waiting on a dependency** — the next step depends on the output of a currently running work that has not come yet (forcing a dispatch here would leave the downstream without its prerequisite and spin idle; wait and dispatch after the next wake-up once the graph updates).
- Conversely: when there genuinely is a new direction [uncovered and not dependent on a running work], or the goal is unmet and there is still untested surface in scope, you should dispatch — do not treat 0 intents as a lazy default.

**Decision flow on each wake-up**:

1. **The full state is attached below this prompt** (it is the return of graph_overview, no need to call it again): task (original title + goal/root node), asset counts, goals + state, open/running/recent_done intents, sites_without_endpoints (sites with no endpoints, hinting at directions worth exploring), facts (the count of exploration facts, a different category from findings), recent_facts ({id,summary,confidence?}).
   - **Scope**: exploration nodes (goals/intents/facts/findings) are this task only; **the asset graph is shared globally** (one copy across tasks, and asset counts are global within scope, not unique to this task) — ignore assets unrelated to this task when they appear.
   - **Lineage**: each intent carries parents (upstream: which facts/intents it derives from) and yields (downstream: which facts/findings it produced), and each recent_facts entry carries from_intent; use these to understand "which facts come from which direction, and whether a new direction can be synthesized".
   - **Negative/doubtful observations** ("port closed/not injectable", etc. in recent_facts) are a worker's observations, not conclusions: before trusting one, use node_detail(id) to read the evidence — treat the direction as temporarily closed only when the evidence is solid, confidence=observed, and the means are exhausted; when evidence is missing, it is only "looks like / probed once", or confidence=inferred, treat it as [not yet determined], and if it is in scope and no other intent covers it, by default dispatch one re-check intent to confirm or refute it (**at most one re-check per negative direction**; if it is still negative after the re-check and the evidence is reasonable, respect that conclusion and do not dispatch again).
   - **Call these on demand only when you need deeper detail**: list_facts (paginated, newest first, default 20, with q filter and before paging, carrying total/has_more), list_findings (all findings), node_detail(id) (full evidence/detail; lists/recent_facts give only summaries), list_assets (pull: q search, type/company_id/task_id filters, pagination, or fetch directly by id/ids), asset_neighbors. The asset store is shared globally, so do not fetch everything by default.

2. **Judge the goals (the core duty)**: the goals field already carries the goals and their state; for an unmet goal that some finding/fact has proven, call prove_goal(goal_id, evidence_id, reason) to mark it met. **When the goal you mark is exactly the last unmet one, the system automatically judges the whole task complete** — wrap-up is driven only by per-goal prove_goal, there is no other "one-click complete" means.
   - ⚠️ **Quantitative acceptance check (never stamp early)**: when a goal has a quantifiable condition (coverage reaches X%, capture N flags, obtain some privilege), before prove_goal you **must** verify the measured values in the graph_overview above (coverage.pct, the findings_total count, etc.): if it is not met, prove_goal is **forbidden** — dispatch an intent to close the gap instead; you must not mark met early on the grounds of "mostly achieved / the core is captured". Example: the requirement is 100% coverage but the measured coverage.pct=40% -> not achieved, keep dispatching gap-filling intents.

3. **(Optional, opening only, extremely light) probing to understand**: only when the graph has almost no fact yet (recent_facts basically empty, the task just started) and the state alone cannot make the initial intent concrete, use Bash, etc. to do a tiny, read-only probe of the target (e.g. 1–2 curls to see the homepage/fingerprint). **The only legitimate product is a more precise intent description** — never the discovery/verification/exploitation of a finding, nor the enumeration result of endpoints/directories/parameters (those are the worker's job, write them as intents and dispatch them). Three hard boundaries:
   - When the graph already has worker-produced facts (facts>0 / recent_facts non-empty) -> probing yourself is **forbidden**; base all judgments on the existing facts, and this round's product can only be "dispatch new intents" or "finish"; to dig deeper into a lead -> dispatch an intent for the worker to investigate, not curl it yourself.
   - Even at the opening, probe at most ≤3 times and stop, only to make the initial intent clear; the moment you find yourself "deep-verifying" rather than "quickly fixing a direction" (enumerating endpoints/directories one by one, trying ids one by one, decode chains, repeatedly probing the same endpoint, any injection/privilege-escalation/finding test or verification — all the worker's heavy work), stop at once and write it as an intent.
   - Whatever you can judge from existing facts/state needs no probing at all.

4. **Decide which new directions to add**: **"restraint" here means only [do not repeat an existing intent], not "dispatch as few as possible"** — when the goal is unmet, the default question is "to close in on the goal, what deeper, harder, not-yet-covered plays remain", not "can we wrap up". An intent is [an open exploration direction] (not a fixed type/menu); judge the direction yourself from the known facts, assets, and goal, and compare each against open + running + recent_done:
   - Already covered by an open/running intent -> do not generate it again (it is being handled).
   - Appeared in recent_done -> **first look at that intent's state (each carries one) to tell how it stopped, then decide**:
     · **done (ran to completion normally)**: already covered -> do not re-dispatch as-is; whether it is a dead end depends on the fact conclusions it yielded, not on the state; re-dispatch only when a [substantive new mechanism] appears (a new fact/asset/parameter/clearly different play), and the summary must state how it differs from last time; rewording or "maybe it works if we try again" does not count, retrying is forbidden.
     · **exhausted (budget spent, cut off halfway, only partially written back) / blocked (model or network failure, essentially did not explore)**: both ended badly mid-way with incomplete information — first use get_worker_trace / get_worker_output to see how far it actually got and where it stuck, then choose from the following: cut off by the budget while near a breakthrough -> dispatch "continue from last progress"; a pure external failure that never ran (blocked often is) -> re-dispatch the same direction directly; stuck at the same place every time -> change the play/direction. The basis is always the real progress in the trace, not the state itself.
   - A brand-new direction with no intent covering it at all -> generate it.
   - All known directions are covered by still-open/running intents -> do not generate, finish directly (there is running/queued work, let it advance); but if only recent_done covers them, there is no open/running left, and the goal is unmet -> per the hard floor at the top you must open a new one or re-dispatch.
   - **Depth over coverage**: coverage is a lower bound / acceptance item, not the exploration goal itself; after finding a high-value entry (possibly leading to RCE/privilege escalation/data exfiltration), prioritize dispatching intents to [drive that path deep through], rather than spreading wide and shallow-testing each asset to flatten coverage.
   - **Keep routes diverse, do not converge too early**: when the goal is unmet, if the existing intents all crowd onto the same route/entry while a [fundamentally different] uncovered direction exists (another entry surface / another asset class / another exploitation chain), prioritize that divergent direction rather than adding a synonymous intent on the same line (judge by substantive difference, not wording); if that divergent direction is already covered by an existing intent, still do not generate. The ideal is 2–3 mechanistically different routes coexisting (e.g. "attack via the upload chain" and "attack via auth bypass"), concentrating resources only after one hands over evidence of [closing in on the goal]. **But diversity always yields to the [operation constraints] at the top**: an entry surface/port/host/operation excluded by a constraint must never get an intent, even if it is fundamentally different.

   **Serial exploitation chains: dispatch step by step, do not split into parallel.** For a strongly-dependent serial chain (1->2->3, each step depending on the previous step's actual output): do not fan out in parallel at once (a downstream that cannot get a not-yet-existing prerequisite only repeats/spins); use TodoWrite to record the whole chain as to-dos (one per step), this round dispatch only the step whose "prerequisite is satisfied" (usually the first), and after it produces a fact, on the next wake-up (the prompt carries the to-do list) dispatch the next step and mark the satisfied ones completed. Do not split "the same thing" into two ("confirm the trigger point" and "trigger the trigger point" are the same step); only [parallel, mutually independent] dimensions (e.g. enumerating several unrelated endpoints) use multiple intents in parallel.

5. **Submit**: use add_intent [once] to batch-submit the new directions you filtered out (the intents array, at most the 4 highest-value ones, do not call it repeatedly one by one):
   - **summary**: one natural-language sentence describing the direction (the target's full address + what to do + why), with no fixed classification; dedup relies mainly on comparing it with existing intents.
   - **asset_ids**: the target asset ids this direction tests/attacks (pass them when possible, 0/1/many, from list_assets) — whenever the direction revolves around specific assets (site/endpoint/parameter/host), pass them, for coverage dedup and to link into the asset graph; pass all of them when it spans multiple assets; leave empty only for pure global reconnaissance with no specific asset.
   - **parent_ids**: which upstream nodes this direction is synthesized from (optional, 0/1/many) — pass all when several facts combine into one intent, pass the id when derived from some upstream intent/finding, leave empty for a brand-new top-level direction.

Do not repeat and do not pad; but when the goal is unmet and there is an uncovered, deeper play, dispatch it. Be concise, focused, and efficient.`

func plannerSystem(goal, dataDir, workDir string) string {
	body := renderSystem("planner", plannerDefaultTmpl, PlannerVars{Goal: goal, DataDir: dataDir, Now: nowStr()})
	return body + artifactSpec(workDir)
}

// Plan runs one planning round. emit, if non-nil, receives the planner's execution
// steps (so users can see how it reads the situation and judges goals — the
// planner is the intent generator and was previously a black box). Returns whether
// the planner judged the goal met.
// triggers carries the concrete change(s) that fired this round — worker(s) done
// and/or finding(s) reported (may be several — the engine debounces a burst; empty
// for time/heartbeat wakes). They are spelled out at the top of the prompt so the
// planner looks first at the actual change (which intent, its output/finding).
func (p *Planner) Plan(ctx context.Context, taskID int64, as *db.AssetStore, ts *db.ExplorationStore, goal string, triggers []TriggerEvent, emit func(db.Activity)) (met bool, reason string, err error) {
	// cold-digest §2.3/§7: advance this task's planner-round counter, maintain the
	// cold_since_round stamps, and (if a threshold is hit) kick off background
	// compaction. Synchronous part is cheap (a few queries); the LLM compaction
	// runs in a detached goroutine so it never adds latency to this round.
	p.compactor.OnPlannerRound(ctx, ts)
	tsx := NewToolSet(ts, "planner")
	tsx.SetFindingRecorder(p.findingRecorder)
	if as != nil {
		tsx.SetAssetStore(as, as.Companies())
	}
	tsx.SetTaskID(taskID)
	tsx.SetCoverageEnabled(as == nil || as.CoverageEnabled(taskID))
	tsx.killWork = p.killWork   // enable kill_work tool (nil = unavailable)
	tsx.steerWork = p.steerWork // enable steer_work tool (nil = unavailable)
	if origin, _ := ts.OriginFactID(); origin > 0 {
		tsx.SetOwnerNode(origin) // planner-side anchors default to the task root (origin fact)
	}
	// Domain tools + the base default toolset (Read/Write/Edit/MultiEdit/LS/Glob/Grep/Bash)
	// When the asset-coverage feature is off, drop add_task_scope/list_untested_assets (not put in the prompt).
	base := append(tsx.DropCoverageTools(tsx.PlannerTools()), actool.DefaultTools()...)
	ctx = WithRunInfo(ctx, RunInfo{TaskID: taskID, ExplorationID: explorationID(ts)})
	tools, def, cleanup := AugmentTools(ctx, "planner", base)
	defer cleanup()
	// The key state (just-finished intents + the prefetched full graph) is moved into [this round's user input] (see input below); system
	// keeps only the static planning body. Moving it out keeps system stable each round and more cache-friendly; the cost is that if a single round grows long, the state may
	// be compacted (a planner round is usually short, so the risk is low). situational is appended into input below.
	situational := renderTriggers(ts, triggers) + renderGraphOverview(tsx.graphOverviewData())
	// Task-level deadline / endgame mode (injected via ctx, see taskclock.go). The endgame round splices the task-timeout
	// planner wrap-up prompt as [this round's operation instruction] into this round's user input (along with situational), making it do only the final
	// goal judgment and produce no new intents.
	tc := taskClockFrom(ctx)
	if tc.Final {
		situational += "\n\n[Task endgame wrap-up (this round's special instruction, overriding the normal planning flow above)]: " + resolveTaskTimeoutWrapup("planner")
	}
	// This task's working directory <workDir>/tasks/<taskID>, create it first.
	taskDir := ensureRunDir(p.workDir, taskID, 0)
	ctx = intercept.WithReviewContext(ctx, taskDir, intercept.ReviewBackground{})
	sysBody := plannerSystem(goal, p.workDir, taskDir)
	if p.wantConstraints() {
		sysBody += constraintBlock(ts) // inject operation constraints (if any) into the system prompt to bound exploration
	}
	system, boundary := deferredSystem(sysBody, def)
	// The planner has no wall-clock budget of its own; with a deadline, MaxDuration is squeezed to the remaining time, so a running planning round
	// enters wrap-up when the task's time is up (by timeout -> task-timeout prompt, by step count -> per-run prompt).
	maxDur, clamped := clampMaxDuration(tc.DeadlineUnix, 0)
	settle := wrapupSettlement("planner", nil)
	if tc.DeadlineUnix > 0 {
		settle = wrapupSettlementForTask("planner", nil, clamped)
	}
	opts := agentcore.Options{
		Provider:        p.prov,
		SystemPrompt:    system,
		DynamicBoundary: boundary,
		Tools:           tools,
		DeferredTools:   def.Deferred,
		UnlockSet:       def.Unlock,
		PermissionMode:  permission.ModeBypass,
		EnableWebFetch:  true, // go through the recording proxy to leave a trace; load the proxy CA to verify MITM re-signed HTTPS certs
		WebFetchProxy:   p.proxyAddr,
		WebFetchCACert:  p.proxyCACert,
		// Web search (optional). ddgs needs no key; brave-free needs BraveKey; tavily needs TavilyKey.
		// WebSearchProxy is a standalone egress proxy (http/https/socks5), unrelated to the traffic-recording MITM proxy; empty = direct connection.
		EnableWebSearch:       p.webSearch.Enabled,
		WebSearchBackend:      p.webSearch.Backend,
		BraveSearchAPIKey:     p.webSearch.BraveKey,
		TavilySearchAPIKey:    p.webSearch.TavilyKey,
		DeepSeekSearchBaseURL: p.webSearch.DeepSeekBaseURL,
		DeepSeekSearchAPIKey:  p.webSearch.DeepSeekAPIKey,
		DeepSeekSearchModel:   p.webSearch.DeepSeekModel,
		WebSearchProxy:        p.webSearch.Proxy,
		BashEnv:               proxyEnv(p.proxyAddr, p.proxyCACert), // Bash subcommands go through the proxy + trust the CA by default
		WorkingDir:            taskDir,                              // this task's working directory <workDir>/tasks/<taskID>
		ToolOutputDir:         cmdOutDir(taskDir),
		MaxTurns:              p.maxTurns, // 0 = unlimited (configurable in agent management)
		MaxDuration:           maxDur,     // 0 = unlimited; with a deadline = the time remaining until the deadline
		Compaction:            compactionConfig(p.compactionWindow()),
		// Planning to-dos shared across wake-ups: keep a serial chain across rounds (the session is new, the store is not).
		Todos: p.todoFor(ts.ID()),
		// Hitting [this round's] step budget -> the SDK runs wrap-up: land the conclusions already worked out this round (the add_intent to dispatch,
		// the prove_goal that can be proven, recording a serial chain with TodoWrite), rather than stopping planning — the planner will keep being woken afterward.
		// When clamped (squeezed by the task deadline) it uses PromptByReason instead (see wrapupSettlementForTask).
		Settlement:   settle,
		NonStreaming: p.nonStreaming(), // when this profile chooses non-streaming, go through Provider.Complete
		MaxTokens:    p.maxTokens(),    // 0 = send no cap, decided by the server default
	}
	if p.tx != nil { // persist raw LLM conversation; one accumulating file per task's planner
		opts.Transcript = p.tx
		opts.SessionID = fmt.Sprintf("exp%d-planner", ts.ID())
	}
	// Experimental: once on, noa takes over context compaction (archives collected under <workDir>/noa/<SessionID>, persistent).
	noaSession := fmt.Sprintf("exp%d-planner", ts.ID())
	enableNoa(&opts, p.noaEnabledFn, p.workDir, noaSession, noaWarn(noaSession))
	// The state (just-finished intents + the full graph) is now spliced into this round's user input (see input below). The user input also has
	// the instruction + cross-wake-up to-dos (the to-do is the model's own planning note, regenerable, so it belongs in user).
	// The opening line splits by "whether this round has a concrete change": with a change -> point to the [actual changes] block below; without a change
	// (heartbeat periodic patrol / hint / resume, etc.) -> do not falsely claim "the graph changed", and instead prompt to also review running intents.
	lead := "There was just a concrete change (see [the actual changes that triggered this round] below); plan the next step accordingly: "
	if len(triggers) == 0 {
		lead = "This round is a **periodic-patrol (heartbeat fired) / no-concrete-change-signal** wake-up — the graph may not have a new change. Also review running intents: for those with no progress for a long time or that have drifted, use steer_work to correct them, and for those with the whole direction wrong use kill_work to cut losses; then judge the goals and decide whether to add directions: "
		// On a heartbeat/no-change wake-up, if the whole graph has no open or running intent -> exploration has stalled (no worker running,
		// no queued direction either). Tell the planner explicitly and force it to add a new direction this round, rather than spinning a round after only reviewing running intents.
		if active, err := ts.HasActiveIntent(); err == nil && !active {
			lead = "This round is a **periodic-patrol (heartbeat fired)** wake-up, and currently there is **no open or running intent at all** — no worker running, no queued direction, exploration has stalled. You **must** produce one or more new intents this round that advance toward the goal and **do not duplicate** the existing intents in the graph (you may not produce 0 intents); first judge from the state below whether the goal is achieved, and if not, add directions immediately: "
		}
	}
	input := lead + situational + "\n\nFrom the state above, judge the goals. When a goal is [truly achieved] (the target outcome is obtained / the target finding is confirmed), use prove_goal to mark each one. **Hard floor: as long as the goal is not yet achieved and there is currently no open or running intent (frontier_open=0 and running_intents empty), this round you must produce at least one intent that advances toward the goal — there is no running work to wait on and no queued direction, so producing 0 intents = the task stalls. Only when there are already open/running intents advancing, or the goal is achieved, may this round produce no new intent.**" +
		renderPlannerTodos(opts.Todos.List())
	// MaxDuration now interrupts a running tool when the wall clock is up and enters wrap-up in place (on the live ctx), so a single stuck round no longer
	// bypasses wrap-up, and no external hard-ctx backstop is needed. ctx carries only pause / kill / shutdown.
	_, _, err = captureRun(ctx, opts, input,
		func(r db.Activity) {
			if emit != nil {
				r.Worker = "planner" // planner activity has no intent_id (it generates them)
				emit(r)
			}
		})
	return tsx.GoalMet, tsx.Reason, err
}

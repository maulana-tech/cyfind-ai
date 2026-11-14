package agent

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/Autumn-27/cyfind/db"
	"github.com/Autumn-27/norma/agentcore"
	"github.com/Autumn-27/norma/llm"
	acperm "github.com/Autumn-27/norma/permission"
	actool "github.com/Autumn-27/norma/tool"
	"github.com/Autumn-27/norma/transcript"
)

// goalsDefaultTmpl is the built-in EDITABLE body (section [A]) of the goals-decomposer
// prompt, seeded into agent_prompts. No template vars are used today.
const goalsDefaultTmpl = `You are a penetration-testing goal decomposer. Your duty is to identify from the user's input the **final results to be achieved**, not to plan attack steps.

**Step one (do this before splitting goals): extract operation constraints**
From the "task goal / task description", identify the operator's explicit rules about [which operations may and may not be done], and register each with set_constraints (if the description/goal involves no operation constraints, you may skip extracting them):
- type=deny: forbidden operations (e.g. "do not scan ports", "no write/delete operations against production", "no brute-forcing", "do not touch a certain subdomain").
- type=allow: an explicitly permitted/limited operation scope (e.g. "passive reconnaissance only", "only against a certain domain").
- A constraint is not a goal, nor an attack step: it is a rule about the boundary of operational behavior.
- **A constraint must be [self-contained, with the concrete target hardcoded]**: replace referential words like "the current target/current port/current IP/current domain/this site" with the **concrete value** from the task goal/description. A constraint is injected separately into the execution-phase prompt, and out of context a referential word cannot tell who it points to.
  Example: the target is https://abc.example.net -> write "only test abc.example.net" rather than "only test the current target"; "test only the target port 443, do not scan other ports" rather than "test only the current port". If the text says only "the current target" but the target address is already clear, fill in the address.
- **Register only constraints explicitly written or emphasized in the goal/description; never invent them**; when unsure of the type use deny (more conservative).
- If the goal/description genuinely has no operation constraint, **do not** call set_constraints.
After registering constraints (if any), proceed to the goal-splitting below.

**A goal = a final deliverable/verifiable result**

**What is not a goal (forbidden as a sub-goal)**:
- information gathering, reconnaissance, endpoint scanning
- the finding analysis and verification process
- attack steps, exploitation techniques
- result-verification steps

**Splitting principles**:
- the user describes only one final goal -> output one
- there are multiple **mutually independent** final deliverables -> list them separately
- label vulnclass when a clear finding class corresponds; leave it empty for information-gathering/business-logic goals
- never invent goals the user did not mention

Call set_goals to submit the result.`

// goalsScopeTail is the code-owned tail appended after the editable goals body
// WHEN an asset store + task context are available. It teaches the decomposer to
// also lift the explicit asset scope out of the goal/description and register it
// via add_task_scope. Kept in code (not the DB-editable body) so it always applies
// on released DBs and can't be edited away — same pattern as the trafficTool tail.
const goalsScopeTail = `

**Extra duty: register the test asset scope**
Besides splitting goals, you must also identify the **explicitly given test asset scope** from the "task goal / task description" and register it with add_task_scope (the task's authorization boundary and the denominator of asset test coverage). **Minimal-scope principle: register only the one target the user explicitly named, never widen it on your own.**
- the target is a URL or an address with a hostname (e.g. https://xxx.example.com/path, app.example.com) -> take its **full hostname**, kind=subdomain, value=the full hostname.
  Example: target https://a1b2c3.lab.example.net/path -> kind=subdomain, value=a1b2c3.lab.example.net (**not** example.net).
  **Never** shrink a hostname with a subdomain down to the root domain — seeing xxx.example.com and registering the whole example.com would widen the scope beyond the user's target, violating the minimal-scope principle.
- only when the user gives a **bare root domain with no subdomain** (e.g. writes example.com directly), or explicitly says "the whole site / all subdomains / the entire domain" -> use kind=root_domain, value=example.com.
- a pure IP or network -> kind=ip / cidr, value=the IP or CIDR.
- **Do not** register a company scope (company) — the task is just created and the company usually does not exist in the asset system yet, so it cannot be registered; leave company-level scope to the later plan phase.
Other rules:
- register only the scope **explicitly written in the goal/description**; never invent or infer domains/IPs not mentioned.
- reason briefly states which sentence it is based on, for auditing.
- if the goal/description has no explicit asset scope, **do not** call add_task_scope.
First register the scope with add_task_scope (if any), then call set_goals to submit the goals.`

// GoalSpec is one decomposed objective.
type GoalSpec struct {
	Text      string `json:"text"`
	VulnClass string `json:"vulnclass,omitempty"`
}

// DecomposeGoals asks the LLM to break a pentest task goal into discrete,
// independently-verifiable objectives (each becomes a goal node). Returns nil if
// no provider is configured or the call yields nothing — the caller then falls
// back to a rule-based split so goal nodes always exist.
//
// prov is supplied by the caller (rather than built here from a Config) so goal
// decomposition rides the SAME provider instance as the rest of the engine — it
// shares the rate limiter, gets recorded by llmrec, and participates in LLM
// failover instead of quietly bypassing all three.
//
// desc is the task's free-text description (background: target scope / flag count / engagement notes, etc.).
// It is fed alongside the goal so the decomposer no longer splits blind — the
// prompt still forbids inventing anything the two texts don't state.
//
// emit, when non-nil, receives every LLM step (thinking/tool_use/result) with
// Worker="planner" so the round-0 goal-decomposition activity is visible in the UI.
//
// as + taskID, when non-nil/positive, wire the add_task_scope tool so the
// decomposer can register the explicit asset scope it extracts from the goal.
//
// ts is the task's exploration store: set_goals writes the decomposed goal nodes
// straight into it (the same managed tool the main agent uses to add goals at
// runtime). The returned specs are read back from the store so callers can emit
// per-goal activity and detect the "LLM produced nothing" case for their fallback.
func DecomposeGoals(ctx context.Context, prov llm.Provider, dataDir, goalText, desc string, as *db.AssetStore, ts *db.ExplorationStore, taskID int64, emit func(db.Activity)) []GoalSpec {
	if prov == nil {
		return nil
	}
	return DecomposeGoalsWithProvider(ctx, prov, dataDir, goalText, desc, as, ts, taskID, false, 0, emit)
}

// DecomposeGoalsWithProvider is the task-runtime variant used when a task has an
// ordered provider chain. It preserves the same tools and write behavior while
// letting the caller own provider selection/failover. maxTokens is the profile's
// per-reply output cap (0 = send none).
func DecomposeGoalsWithProvider(ctx context.Context, prov llm.Provider, dataDir, goalText, desc string, as *db.AssetStore, ts *db.ExplorationStore, taskID int64, nonStreaming bool, maxTokens int, emit func(db.Activity)) []GoalSpec {
	if prov == nil {
		return nil
	}
	// Goal decomposition is a one-shot call: no transcript store is attached, so agentcore does not attach a
	// session id to the ctx (it only attaches one when there is a writer, see agentcore.Prompt). But a gateway that does
	// prompt caching / sticky routing by the session-id header (opencode zen returns 400
	// MissingSessionID without x-opencode-session) reads exactly this ctx value — without it you get "chat works, decomposition 400".
	// Attach a stable id explicitly: decomposition requests of the same exploration share it (helps cache hits), and its naming does not
	// conflict with planner/worker and can be attributed correctly by llmrec.parseSession.
	if ts != nil {
		ctx = transcript.WithSessionID(ctx, fmt.Sprintf("exp%d-goals", ts.ID()))
	}
	// worker="goals" tags the goal nodes' provenance; ts/taskID let set_goals link
	// each goal under the task root. This is the catalog's real set_goals tool, so a
	// web-edited description/schema on it applies here too.
	tsx := &ToolSet{as: as, ts: ts, taskID: taskID, worker: "goals"}
	// Description rides in the user message (same channel as the goal), NOT via the
	// {{.EngagementDescription}} template var — else a prompt that references the var
	// would inject the description twice. System prompt stays pure static instructions.
	sys := renderSystem("goals", goalsDefaultTmpl, GoalsVars{DataDir: dataDir, Now: nowStr()})
	// set_constraints is always available (it does not depend on the asset store): the body already includes the "extract operation constraints before splitting goals" step
	// (the wording is editable on the agent edit page), so here we just wire up the tool.
	tools := []actool.CoreTool{tsx.setGoals(), tsx.setConstraints()}
	// Wire add_task_scope only when we have a real asset store + task to write to.
	// The scope-extraction tail is appended in lockstep so the prompt never asks for
	// a tool that isn't present.
	if as != nil && taskID > 0 {
		tools = append(tools, tsx.addTaskScope())
		sys += goalsScopeTail
	}
	userMsg := "Task goal:\n" + goalText
	if d := strings.TrimSpace(desc); d != "" {
		userMsg += "\n\nTask description (background info, may contain target scope / flag count / engagement notes; for reference only, do not invent anything not mentioned in it):\n" + d
	}
	// Use captureRun so every LLM step is emitted as an activity record (visible in
	// the plan tab under the round-0 marker). Falls back gracefully when emit is nil.
	captureEmit := func(r db.Activity) {
		if emit != nil {
			r.Worker = "planner"
			emit(r)
		}
	}
	captureRun(ctx, agentcore.Options{
		Provider:               prov,
		SystemPrompt:           []string{sys},
		Tools:                  tools,
		PermissionMode:         acperm.ModeBypass,
		DisableBackgroundTasks: true,
		// The 3 steps (extract constraints -> register scope -> split goals) each need a tool call; give enough rounds so set_goals is not missed before wrap-up.
		MaxTurns:     8,
		NonStreaming: nonStreaming, // when this profile chooses non-streaming, go through Provider.Complete
		MaxTokens:    maxTokens,    // 0 = send no cap, decided by the server default
	}, userMsg, captureEmit)
	// set_goals persisted the goals directly; read them back so the caller sees what
	// was written (empty slice ⇒ the LLM produced nothing ⇒ caller falls back).
	if ts == nil {
		return nil
	}
	nodes, _ := ts.ListByKind(db.KindGoal, 10000)
	var out []GoalSpec
	for _, n := range nodes {
		var p struct {
			Text      string `json:"text"`
			VulnClass string `json:"vulnclass"`
		}
		_ = json.Unmarshal(n.Payload, &p)
		if strings.TrimSpace(p.Text) != "" {
			out = append(out, GoalSpec{Text: p.Text, VulnClass: p.VulnClass})
		}
	}
	return out
}

/**
 * Task detail → Overview tab (goals, constraints, coverage, tokens, scope, heartbeat).
 */

const messages = {
  "Company #{id}": "Company #{id}",
  Company: "Company",
  "Root domain": "Root domain",
  Subdomain: "Subdomain",
  Range: "Range",
  Keyword: "Keyword",
  Auto: "Auto",
  Manual: "Manual",
  "Failed to add": "Failed to add",
  "Save failed": "Save failed",
  "Task description & goals": "Task description & goals",
  Description: "Description",
  Target: "Target",
  "Goal management": "Goal management",
  " ({n} verifiable goals; adding or editing notifies the planner and revives the task)":
    " ({n} verifiable goals; adding or editing notifies the planner and revives the task)",
  "Add a goal, e.g. “gain privilege escalation to an admin account”":
    "Add a goal, e.g. “gain privilege escalation to an admin account”",
  "Vulnerability class (optional)": "Vulnerability class (optional)",
  Add: "Add",
  "No goals yet. Once added, the planner dispatches exploration intents from them and judges completion.":
    "No goals yet. Once added, the planner dispatches exploration intents from them and judges completion.",
  "operation constraints": "operation constraints",
  " ({n} constraints scoping planner/worker exploration; changes apply in the next planning round)":
    " ({n} constraints scoping planner/worker exploration; changes apply in the next planning round)",
  Deny: "Deny",
  Allow: "Allow",
  "An operation constraint, e.g. “test only this port, don’t scan others”":
    "An operation constraint, e.g. “test only this port, don’t scan others”",
  "No operation constraints yet. They are extracted from the description/goals at task creation; you can also add, edit, and remove them here to scope what is allowed or denied.":
    "No operation constraints yet. They are extracted from the description/goals at task creation; you can also add, edit, and remove them here to scope what is allowed or denied.",
  "Asset test coverage": "Asset test coverage",
  " (rough estimate, for reference only)": " (rough estimate, for reference only)",
  "{tested} tested / {denominator} in scope": "{tested} tested / {denominator} in scope",
  "LLM token usage": "LLM token usage",
  " (by model, {n} calls total)": " (by model, {n} calls total)",
  " (by model)": " (by model)",
  Input: "Input",
  Output: "Output",
  "Cache read": "Cache read",
  "Cache hit rate": "Cache hit rate",
  Model: "Model",
  Calls: "Calls",
  "Hit rate": "Hit rate",
  "No LLM usage yet (the task hasn’t made any calls, or records are still being written).":
    "No LLM usage yet (the task hasn’t made any calls, or records are still being written).",
  "Test scope": "Test scope",
  " ({n} entries: coverage denominator + authorization boundary)":
    " ({n} entries: coverage denominator + authorization boundary)",
  "Company name or id": "Company name or id",
  "e.g. 10.0.0.1 or 10.0.0.0/24": "e.g. 10.0.0.1 or 10.0.0.0/24",
  "e.g. ICP filing no. 12345678": "e.g. ICP filing no. 12345678",
  "e.g. a company-name keyword": "e.g. a company-name keyword",
  "e.g. example.com": "e.g. example.com",
  Inherited: "Inherited",
  "No test scope yet. Entries here become the denominator for asset coverage.":
    "No test scope yet. Entries here become the denominator for asset coverage.",
  Heartbeat: "Heartbeat",
  "Engine state": "Engine state",
  "Running Workers": "Running Workers",
  "Last activity": "Last activity",
  "Goals {met}/{total}": "Goals {met}/{total}",
  "Completed at": "Completed at",
  "Running intents": "Running intents",
  "No running intents": "No running intents",
  "Needs attention": "Needs attention",
  "Confirmed findings": "Confirmed findings",
  "Unclaimed frontier": "Unclaimed frontier",
  "Blocked intents": "Blocked intents",
  "Recent findings": "Recent findings",
  "No findings yet": "No findings yet",
  "Blocked/failed intents": "Blocked/failed intents",
  " ({n} total; can be re-run)": " ({n} total; can be re-run)",
  "Re-run all": "Re-run all",
  "Re-run": "Re-run",
  "Showing only the first 20; click “Re-run all” to process the remaining {n}.":
    "Showing only the first 20; click “Re-run all” to process the remaining {n}.",
  "Unclaimed intents": "Unclaimed intents",
  "open frontier": "open frontier",
  "this task": "this task",
  "Total intents": "Total intents",
  "all intents of this task": "all intents of this task",
  "Domain (exact)": "Domain (exact)",
  "IP (exact)": "IP (exact)",
  "URL (exact)": "URL (exact)",
  "Domain (fuzzy)": "Domain (fuzzy)",
  "IP (fuzzy)": "IP (fuzzy)",
  "URL (fuzzy)": "URL (fuzzy)",
  "CIDR range": "CIDR range",
  "Task-level asset block / allow": "Task-level asset block / allow",
  " ({n} rules; this task only, not global — block is checked before allow)":
    " ({n} rules; this task only, not global — block is checked before allow)",
  "Note (optional)": "Note (optional)",
  "No task-level rules yet. A “Block” match forbids testing; “Allow” is a whitelist — once configured, only assets matching an allow rule may be tested (no whitelist is active until then).":
    "No task-level rules yet. A “Block” match forbids testing; “Allow” is a whitelist — once configured, only assets matching an allow rule may be tested (no whitelist is active until then).",
  "Exploration graph": "Exploration graph",
  "({n} nodes · {e} relations — open the Explore tab for the full interactive view)":
    "({n} nodes · {e} relations — open the Explore tab for the full interactive view)",
  "Waiting for exploration to start…": "Waiting for exploration to start…",
} satisfies Record<string, string>;

export default messages;

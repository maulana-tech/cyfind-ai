/**
 * Mock/demo dataset strings (src/lib/mock/data.ts) that are translated inside
 * the module's functions (agentDetail, assetRefsFor, workspaceRead,
 * llmRecordDetail). Top-level mock data stays zh — render sites translate it.
 */

const messages = {
  'You are CYFIND\'s "{name}".\nGoal: {{.Goal}}\nAsset summary: {{.AssetSummary}}\nRoute hint: {{.RouteHint}}\nUse the information above to drive exploration and write results back to the graph.':
    'You are CYFIND\'s "{name}".\nGoal: {{.Goal}}\nAsset summary: {{.AssetSummary}}\nRoute hint: {{.RouteHint}}\nUse the information above to drive exploration and write results back to the graph.',
  "Time/steps are running low — summarize confirmed findings and set intents to their final states.":
    "Time/steps are running low — summarize confirmed findings and set intents to their final states.",
  "The task timed out — wrap up immediately and persist the current conclusions.":
    "The task timed out — wrap up immediately and persist the current conclusions.",
  "Vulnerability Retest": "Vulnerability Retest",
  "Goal Decomposer": "Goal Decomposer",
  Planner: "Planner",
  "Main Agent": "Main Agent",
  "Recon Bot (Custom)": "Recon Bot (Custom)",
  "Current task goal": "Current task goal",
  "Obtain admin access to the acme.com console": "Obtain admin access to the acme.com console",
  "Asset graph overview": "Asset graph overview",
  "6 subdomains / 3 IPs / 4 apps / 4 endpoints": "6 subdomains / 3 IPs / 4 apps / 4 endpoints",
  "Exploration route hint": "Exploration route hint",
  "Prioritize the admin console and API authorization-bypass surface":
    "Prioritize the admin console and API authorization-bypass surface",
  "Strengthen guidance on probing for authorization bypass": "Strengthen guidance on probing for authorization bypass",
  "Initial tweaks": "Initial tweaks",
  "You are CYFIND's planner…": "You are CYFIND's planner…",
  "You are CYFIND's planner (v2)…": "You are CYFIND's planner (v2)…",
  "Probe the www.acme.com search endpoint for SQL injection":
    "Probe the www.acme.com search endpoint for SQL injection",
  "Enumerate object-level authorization flaws (IDOR) on api.acme.com":
    "Enumerate object-level authorization flaws (IDOR) on api.acme.com",
  "The search?q= parameter is injectable — error responses echo MySQL syntax errors":
    "The search?q= parameter is injectable — error responses echo MySQL syntax errors",
  "[High] SQL injection on www.acme.com/search?q=": "[High] SQL injection on www.acme.com/search?q=",
  "# Workspace notes\n\n(demo) This is a sample file in the workspace root; edit it online and save.\n":
    "# Workspace notes\n\n(demo) This is a sample file in the workspace root; edit it online and save.\n",
  "<!-- (demo) Captured response body snippet -->\n<html><body>MySQL error near ''1'='1'</body></html>\n":
    "<!-- (demo) Captured response body snippet -->\n<html><body>MySQL error near ''1'='1'</body></html>\n",
  "(demo) Raw LLM conversation log sample — omitted here.": "(demo) Raw LLM conversation log sample — omitted here.",
  'You are the "executor" of an authorized penetration testing system… (omitted)':
    'You are the "executor" of an authorized penetration testing system… (omitted)',
  "Start executing this intent from the system prompt: do only that, produce only facts, stop when done.":
    "Start executing this intent from the system prompt: do only that, produce only facts, stop when done.",
  "Probe search?q= for injection; verify first with an error-based payload.":
    "Probe search?q= for injection; verify first with an error-based payload.",
  "Run a shell command in the target environment and return its output.":
    "Run a shell command in the target environment and return its output.",
  "Probe search?q= for injection.": "Probe search?q= for injection.",
} satisfies Record<string, string>;

export default messages;

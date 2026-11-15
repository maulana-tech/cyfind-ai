/**
 * System tools catalog page translations (keys are the original zh-CN strings).
 */

const messages = {
  Tools: "Tools",
  "Descriptions/bindings for system tools, plus custom tools (command/script/http)":
    "Descriptions/bindings for system tools, plus custom tools (command/script/http)",
  "Search tool name, description, agent…": "Search tool name, description, agent…",
  "System tools": "System tools",
  "Custom tools": "Custom tools",
  "{a} / {b} matches — click a card to edit description, parameter defaults, and agent bindings":
    "{a} / {b} matches — click a card to edit description, parameter defaults, and agent bindings",
  "{n} in total — click a card to edit description, parameter defaults, and agent bindings":
    "{n} in total — click a card to edit description, parameter defaults, and agent bindings",
  "No matching system tools": "No matching system tools",
  "(no system tools yet — waiting for the backend seed)": "(no system tools yet — waiting for the backend seed)",
  "shell/command/script/http — {a} / {b} matches, click a card to edit":
    "shell/command/script/http — {a} / {b} matches, click a card to edit",
  "shell (bash declaration) / command (shell command) / script (Python) / http (API) — {n} in total, click a card to edit":
    "shell (bash declaration) / command (shell command) / script (Python) / http (API) — {n} in total, click a card to edit",
  "New custom tool": "New custom tool",
  "No matching custom tools": "No matching custom tools",
  "(no custom tools yet — click “New custom tool” at the top right)":
    "(no custom tools yet — click “New custom tool” at the top right)",
  "Edit description, parameter defaults, and agent bindings":
    "Edit description, parameter defaults, and agent bindings",
  "Saved tool “{key}”": "Saved tool “{key}”",
  "Save failed: {message}": "Save failed: {message}",
  "Restored “{key}” to code defaults": "Restored “{key}” to code defaults",
  "Restore failed: {message}": "Restore failed: {message}",
  "This tool requires ": "This tool requires ",
  "Traffic capture": "Traffic capture",
  ". Enable traffic capture in System Settings first, then bind it to agents and turn it on.":
    ". Enable traffic capture in System Settings first, then bind it to agents and turn it on.",
  "Bind agents (decides which agents get this tool)": "Bind agents (decides which agents get this tool)",
  "(no agents)": "(no agents)",
  Enabled: "Enabled",
  "Tool description (sent to the model)": "Tool description (sent to the model)",
  "Parameters (name / type / required are read-only; description and default are editable)":
    "Parameters (name / type / required are read-only; description and default are editable)",
  "(no parameters)": "(no parameters)",
  Required: "Required",
  "items sub-field": "items sub-field",
  Description: "Description",
  "Default value": "Default value",
  "(empty = no default)": "(empty = no default)",
  "Scalars only": "Scalars only",
  Save: "Save",
  "Restore defaults": "Restore defaults",
  System: "System",
  "Custom · {kind}": "Custom · {kind}",
  Disabled: "Disabled",
  "Called {n} times in total": "Called {n} times in total",
  "Calls {n}": "Calls {n}",
  "(no description)": "(no description)",
  "(no agents bound)": "(no agents bound)",
  "Edit {key}": "Edit {key}",
  "shell = bash environment declaration (name + description only; tells the model it can call bash). command/script/http need an execution spec.":
    "shell = bash environment declaration (name + description only; tells the model it can call bash). command/script/http need an execution spec.",
  "e.g. nmap_scan": "e.g. nmap_scan",
  "Description (sent to the model)": "Description (sent to the model)",
  Type: "Type",
  "shell (bash environment declaration)": "shell (bash environment declaration)",
  "command (shell command template)": "command (shell command template)",
  "script (Python script)": "script (Python script)",
  "http (API request)": "http (API request)",
  "For well-known tools like nmap, sqlmap, ffuf — the model already knows how to use them; just declare that they can be called from bash. The name + description are appended to the Bash tool description.":
    "For well-known tools like nmap, sqlmap, ffuf — the model already knows how to use them; just declare that they can be called from bash. The name + description are appended to the Bash tool description.",
  "Command template (placeholders {param}, e.g. nmap -p {ports} {target})":
    "Command template (placeholders {param}, e.g. nmap -p {ports} {target})",
  'Python body (params via stdin JSON / os.environ["TOOL_X"])':
    'Python body (params via stdin JSON / os.environ["TOOL_X"])',
  "URL (may contain {param})": "URL (may contain {param})",
  "Headers (JSON, may contain {param})": "Headers (JSON, may contain {param})",
  "Body (may contain {param})": "Body (may contain {param})",
  "Proxy URL (empty = direct)": "Proxy URL (empty = direct)",
  "Use recording proxy": "Use recording proxy",
  "Timeout (ms, empty = default)": "Timeout (ms, empty = default)",
  "Parameter JSON Schema": "Parameter JSON Schema",
  "(required for http tools; must include properties)": "(required for http tools; must include properties)",
  "(empty = auto-wrap with {args})": "(empty = auto-wrap with {args})",
  "Bind agents": "Bind agents",
  "deferred (only enable for large sets of rarely used tools)":
    "deferred (only enable for large sets of rarely used tools)",
  "Test run (uses the current form; nothing is saved)": "Test run (uses the current form; nothing is saved)",
  'Sample params JSON, e.g. {"target":"example.com"}': 'Sample params JSON, e.g. {"target":"example.com"}',
  "Running…": "Running…",
  "Test run": "Test run",
  "(no output)": "(no output)",
  Create: "Create",
  Delete: "Delete",
  "key must start with a lowercase letter and use only lowercase letters, digits, and underscores":
    "key must start with a lowercase letter and use only lowercase letters, digits, and underscores",
  "Invalid parameter JSON Schema": "Invalid parameter JSON Schema",
  "Invalid headers JSON": "Invalid headers JSON",
  "http tools must provide a parameter JSON Schema (must include properties; cannot be empty)":
    "http tools must provide a parameter JSON Schema (must include properties; cannot be empty)",
  "Custom tool created": "Custom tool created",
  Saved: "Saved",
  Deleted: "Deleted",
  "Delete failed: {message}": "Delete failed: {message}",
  "Invalid test params JSON": "Invalid test params JSON",
} satisfies Record<string, string>;

export default messages;

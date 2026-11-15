/**
 * Asset sync page translations (keys are the original zh-CN strings).
 */

const messages = {
  "Asset Sync": "Asset Sync",
  "Sync assets into the database from external data sources":
    "Sync assets into the database from external data sources",
  "Failed to read datasource status: {message}": "Failed to read datasource status: {message}",
  "Once the datasource is ready, pick a project / task to sync.":
    "Once the datasource is ready, pick a project / task to sync.",
  "ScopeSentry datasource created; fill in the URL and API key":
    "ScopeSentry datasource created; fill in the URL and API key",
  "Creation failed: {message}": "Creation failed: {message}",
  "Enter the MCP URL": "Enter the MCP URL",
  "Datasource saved and enabled": "Datasource saved and enabled",
  "Saved (enablement conditions not yet met)": "Saved (enablement conditions not yet met)",
  "Save failed: {message}": "Save failed: {message}",
  "Datasource Status": "Datasource Status",
  Refresh: "Refresh",
  "No ScopeSentry datasource created yet. Creating one adds a placeholder MCP entry (empty URL/key, disabled).":
    "No ScopeSentry datasource created yet. Creating one adds a placeholder MCP entry (empty URL/key, disabled).",
  "Create Datasource": "Create Datasource",
  "The datasource is created but not configured. Fill in the MCP URL and API Key, then enable it.":
    "The datasource is created but not configured. Fill in the MCP URL and API Key, then enable it.",
  "The datasource is configured but not enabled; saving will enable it automatically.":
    "The datasource is configured but not enabled; saving will enable it automatically.",
  "MCP URL": "MCP URL",
  "http://<host>:8082/mcp": "http://<host>:8082/mcp",
  "API Key (X-API-Key; leave blank to keep the current value)":
    "API Key (X-API-Key; leave blank to keep the current value)",
  "Save & Enable": "Save & Enable",
  "{n} tools discovered": "{n} tools discovered",
  "Checking…": "Checking…",
  "Not Created": "Not Created",
  "Not Configured": "Not Configured",
  Disabled: "Disabled",
  Connected: "Connected",
  Unreachable: "Unreachable",
  "Failed to load the list: {message}": "Failed to load the list: {message}",
  "Select at least one {target}": "Select at least one {target}",
  Project: "Project",
  Tasks: "Tasks",
  "Select at least one asset type": "Select at least one asset type",
  "Sync complete; {n} assets imported": "Sync complete; {n} assets imported",
  "Sync failed: {message}": "Sync failed: {message}",
  "Loading…": "Loading…",
  "No data": "No data",
  "Select Data to Sync": "Select Data to Sync",
  "By Project": "By Project",
  "By Task": "By Task",
  "Sync assets:": "Sync assets:",
  Subdomain: "Subdomain",
  Service: "Service",
  "Create a company per project and write its asset scope": "Create a company per project and write its asset scope",
  "Search project name": "Search project name",
  "Search task name": "Search task name",
  "{n} selected": "{n} selected",
  "Sync Selected": "Sync Selected",
  "Project Name": "Project Name",
  "Task Name": "Task Name",
  Tag: "Tag",
  "Asset Count": "Asset Count",
  Status: "Status",
  Time: "Time",
  Previous: "Previous",
  "Page {n}": "Page {n}",
  Next: "Next",
  "Created/updated companies: ": "Created/updated companies: ",
  "…and {n} more errors": "…and {n} more errors",
} satisfies Record<string, string>;

export default messages;

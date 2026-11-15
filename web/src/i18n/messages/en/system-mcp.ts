/** MCP page vocabulary (source keys are the original zh-CN strings). */
const mcp = {
  "Transport method": "Transport method",
  "Parameters (space-separated)": "Parameters (space-separated)",
  "Remote URL": "Remote URL",
  "{tools.length} tools": "{tools.length} tools",
  "Loading…": "Loading…",
  "No tools found, click to refresh and retrieve.": "No tools found, click to refresh and retrieve.",
  "External MCP tool server · Visible by agent authorization":
    "External MCP tool server · Visible by agent authorization",
  "Add MCP": "Add MCP",
  "Visibility (granted per Agent)": "Visibility (granted per Agent)",
  '{editing ? editing.name : "Add MCP server"}': '{editing ? editing.name : "Add MCP server"}',
} satisfies Record<string, string>;

/** Do NOT edit `src/i18n/messages/index.ts` - registry updated centrally. */
export default mcp;

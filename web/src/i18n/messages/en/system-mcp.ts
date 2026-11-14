/** MCP page vocabulary (source keys are the original zh-CN strings). */
const mcp = {
  传输方式: "Transport method",

  "参数（空格分隔）": "Parameters (space-separated)",
  "远程 URL": "Remote URL",
  "{tools.length} 个工具": "{tools.length} tools",
  "加载中…": "Loading…",
  "尚未发现工具，点击刷新重新获取。": "No tools found, click to refresh and retrieve.",
  "外部 MCP 工具服务器 · 按 Agent 授权可见": "External MCP tool server · Visible by agent authorization",
  "添加 MCP": "Add MCP",
  "可见性（按 Agent 授权）": "Visibility (by agent authorization)",
  '{editing ? editing.name : "添加 MCP 服务器"}': '{editing ? editing.name : "Add MCP server"}',
} satisfies Record<string, string>;

/** Do NOT edit `src/i18n/messages/index.ts` - registry updated centrally. */
export default mcp;

/** Vokabur MCP (kunci = string zh-CN asli). */
const mcp = {
  传输方式: "Metode transport",

  "参数（空格分隔）": "Parameter (dipisahkan spasi)",
  "远程 URL": "URL jauh",
  "{tools.length} 个工具": "{tools.length} tools",
  "加载中…": "Memuat…",
  "尚未发现工具，点击刷新重新获取。": "Belum ditemukan alat, klik refresh untuk mengambil ulang.",
  "外部 MCP 工具服务器 · 按 Agent 授权可见": "Eksternal MCP tool server · Terlihat oleh otorisasi agent",
  "添加 MCP": "Tambah MCP",
  "可见性（按 Agent 授权）": "Visibilitas (by agent authorization)",
  '{editing ? editing.name : "添加 MCP 服务器"}': '{editing ? editing.name : "Tambah MCP server"}',
} satisfies Record<string, string>;

/** Do NOT edit `src/i18n/messages/index.ts` - registry updated centrally. */
export default mcp;

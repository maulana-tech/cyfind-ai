/** Vokabur MCP (kunci = string zh-CN asli). */
const mcp = {
  "Transport method": "Metode transport",
  "Parameters (space-separated)": "Parameter (dipisahkan spasi)",
  "Remote URL": "URL jauh",
  "{tools.length} tools": "{tools.length} tools",
  "Loading…": "Memuat…",
  "No tools found, click to refresh and retrieve.": "Belum ditemukan alat, klik refresh untuk mengambil ulang.",
  "External MCP tool server · Visible by agent authorization":
    "Eksternal MCP tool server · Terlihat oleh otorisasi agent",
  "Add MCP": "Tambah MCP",
  "Visibility (granted per Agent)": "Visibilitas (by agent authorization)",
  '{editing ? editing.name : "Add MCP server"}': '{editing ? editing.name : "Tambah MCP server"}',
} satisfies Record<string, string>;

/** Do NOT edit `src/i18n/messages/index.ts` - registry updated centrally. */
export default mcp;

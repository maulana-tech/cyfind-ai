/** Vokabur agent (kunci = string zh-CN asli). */
const agents = {
  "工具 {agent.tool_count ?? 0}": "Tool {agent.tool_count ?? 0}",
  "删除 Agent「{agent.name}」？": "Hapus Agent「{agent.name}」?",
  "新建自定义 Agent": "Buat Agent kustom",
  "小写字母开头，仅含小写字母/数字/下划线": "Mulai dengan huruf kecil, hanya berisi huruf kecil/angka/garis bawah",
  "Agent 清单": "Daftar Agent",
  "共 {agents.length} 个": "Total {agents.length}",
  "（暂无 Agent）": "(Tidak ada Agent)",
  '{editing.description || "提示词、配置、可见资源与工具绑定"}':
    '{editing.description || "Prompt, config, visible resources and tools binding"}',
} satisfies Record<string, string>;

/** Do NOT edit `src/i18n/messages/index.ts` - registry updated centrally. */
export default agents;

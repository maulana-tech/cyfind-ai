/** Vokabur agent (kunci = string zh-CN asli). */
const agents = {
  "Tool {agent.tool_count ?? 0}": "Tool {agent.tool_count ?? 0}",
  "Delete Agent「{agent.name}」?": "Hapus Agent「{agent.name}」?",
  "Create custom Agent": "Buat Agent kustom",
  "Start with lowercase letters, only contain lowercase letters/numbers/underscores":
    "Mulai dengan huruf kecil, hanya berisi huruf kecil/angka/garis bawah",
  "Agent list": "Daftar Agent",
  "Total {agents.length}": "Total {agents.length}",
  "(no Agents yet)": "(Tidak ada Agent)",
  '{editing.description || "Prompt, config, visible resources and tools binding"}':
    '{editing.description || "Prompt, config, visible resources and tools binding"}',
} satisfies Record<string, string>;

/** Do NOT edit `src/i18n/messages/index.ts` - registry updated centrally. */
export default agents;

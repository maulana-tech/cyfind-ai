/** Agents page vocabulary (source keys are the original zh-CN strings). */
const agents = {
  "工具 {agent.tool_count ?? 0}": "Tool {agent.tool_count ?? 0}",
  "删除 Agent「{agent.name}」？": "Delete Agent「{agent.name}」?",
  "新建自定义 Agent": "Create custom Agent",
  "小写字母开头，仅含小写字母/数字/下划线":
    "Start with lowercase letters, only contain lowercase letters/numbers/underscores",
  "Agent 清单": "Agent list",
  "共 {agents.length} 个": "Total {agents.length}",
  "（暂无 Agent）": "(No Agent)",
  '{editing.description || "提示词、配置、可见资源与工具绑定"}':
    '{editing.description || "Prompt, config, visible resources and tools binding"}',
} satisfies Record<string, string>;

/** Do NOT edit `src/i18n/messages/index.ts` - registry updated centrally. */
export default agents;

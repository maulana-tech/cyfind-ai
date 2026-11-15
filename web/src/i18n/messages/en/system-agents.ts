/** Agents page vocabulary (source keys are the original zh-CN strings). */
const agents = {
  "Tool {agent.tool_count ?? 0}": "Tool {agent.tool_count ?? 0}",
  "Delete Agent「{agent.name}」?": "Delete Agent「{agent.name}」?",
  "Create custom Agent": "Create custom Agent",
  "Start with lowercase letters, only contain lowercase letters/numbers/underscores":
    "Start with lowercase letters, only contain lowercase letters/numbers/underscores",
  "Agent list": "Agent list",
  "Total {agents.length}": "Total {agents.length}",
  "(no Agents yet)": "(no Agents yet)",
  '{editing.description || "Prompt, config, visible resources and tools binding"}':
    '{editing.description || "Prompt, config, visible resources and tools binding"}',
} satisfies Record<string, string>;

/** Do NOT edit `src/i18n/messages/index.ts` - registry updated centrally. */
export default agents;

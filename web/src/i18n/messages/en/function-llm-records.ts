/** LLM Records page vocabulary (source keys are the original zh-CN strings). */
const llmRecords = {
  LLM记录: "LLM Records",

  模型: "Model",

  提供商: "Provider",

  基础URL: "Base URL",

  API密钥: "API Key",

  认证方式: "Authentication Method",

  流式传输: "Streaming",

  温度: "Temperature",

  最大令牌: "Max Tokens",

  顶部频率惩罚: "Top P",

  频率惩罚: "Frequency Penalty",

  存在惩罚: "Presence Penalty",

  停止序列: "Stop Sequence",

  思考模型: "Thinking Model",

  思考强度: "Thinking Intensity",

  "不发送（默认）": "Do Not Send (Default)",
  禁用: "Disabled",

  启用: "Enabled",

  "默认关闭。关闭时始终只用激活配置，失败即失败。": "Default disabled. Always use active config when failed.",
  "默认关闭：Agent 或任务指定了某个配置就只用它，失败即失败（不会悄悄换成别的模型）。 开启后，指定的配置失败时也会回落到下面的轮询链。":
    "Default disabled: Agent or task specified a config, used only if it fails (won't secretly switch to another model). Open, specified config fails, fall back to the polling chain below.",
  "控制是否发送 thinking 字段。不发送=不带该字段（兼容 MiniMax 等不支持 的模型）；关闭=发 disabled；开启=发 enabled。与下面的强度互相独立。":
    "Control whether to send the thinking field. Not sending=don't include the field (compatible with models like MiniMax that don't support it); disabled=send disabled; enabled=send enabled. Independent of the below intensity.",
  指定模型失败时也兜底: "Fall back when specified model fails",

  轮询顺序: "Polling Order",
} satisfies Record<string, string>;

/** Do NOT edit `src/i18n/messages/index.ts` - registry updated centrally. */
export default llmRecords;

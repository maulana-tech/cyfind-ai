/** LLM Records page vocabulary (source keys are the original zh-CN strings). */
const llmRecords = {
  "LLM Records": "LLM Records",
  Model: "Model",
  Provider: "Provider",
  "Base URL": "Base URL",
  "API Key": "API Key",
  "Authentication Method": "Authentication Method",
  Streaming: "Streaming",
  Temperature: "Temperature",
  "Max Tokens": "Max Tokens",
  "Top P": "Top P",
  "Frequency Penalty": "Frequency Penalty",
  "Presence Penalty": "Presence Penalty",
  "Stop Sequence": "Stop Sequence",
  "Thinking Model": "Thinking Model",
  "Thinking Intensity": "Thinking Intensity",
  "Don't send (default)": "Don't send (default)",
  Disable: "Disable",
  Enabled: "Enabled",
  "Off by default. When off, only the active profile is used and failures stand.":
    "Off by default. When off, only the active profile is used and failures stand.",
  "Off by default: when an agent or task pins a profile, only it is used and failures stand (no silent model swap). When on, a pinned profile that fails also falls back to the pool chain below.":
    "Off by default: when an agent or task pins a profile, only it is used and failures stand (no silent model swap). When on, a pinned profile that fails also falls back to the pool chain below.",
  "Controls whether the thinking field is sent. Don't send = omit the field (for models that don't support it, e.g. MiniMax); Off sends disabled; On sends enabled. Independent of the effort level below.":
    "Controls whether the thinking field is sent. Don't send = omit the field (for models that don't support it, e.g. MiniMax); Off sends disabled; On sends enabled. Independent of the effort level below.",
  "Fall back when a specified profile fails": "Fall back when a specified profile fails",
  "Pool order": "Pool order",
} satisfies Record<string, string>;

/** Do NOT edit `src/i18n/messages/index.ts` - registry updated centrally. */
export default llmRecords;

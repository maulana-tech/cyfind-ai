/** Kosakata halaman LLM Records (kunci = string zh-CN asli). */
const llmRecords = {
  LLM记录: "Catatan LLM",
  模型: "Model",
  提供商: "Penawar",
  基础URL: "URL Dasar",
  API密钥: "Kunci API",
  认证方式: "Metode Otentikasi",
  流式传输: "Aliran",
  温度: "Suhu",
  最大令牌: "Token Maksimal",
  顶部频率惩罚: "Hukuman Frekuensi Atas",
  频率惩罚: "Hukulan Frekuensi",
  存在惩罚: "Hukuman Keberadaan",
  停止序列: "Sekuenshi Berhenti",
  思考模型: "Model Pensiapan",
  思考强度: "Intensitas Pensiapan",
  "不发送（默认）": "Tidak Mengirim (Default)",
  禁用: "Nonaktifkan",
  启用: "Aktifkan",
  "默认关闭。关闭时始终只用激活配置，失败即失败。": "Default disabled. Selalu gunakan konfigurasi aktif saat gagal.",
  "默认关闭：Agent 或任务指定了某个配置就只用它，失败即失败（不会悄悄换成别的模型）。 开启后，指定的配置失败时也会回落到下面的轮询链。":
    "Default disabled: Agent or task specified a config, used only if it fails (won't secretly switch to another model). Open, specified config fails, fall back to the polling chain below.",
  "控制是否发送 thinking 字段。不发送=不带该字段（兼容 MiniMax 等不支持 的模型）；关闭=发 disabled；开启=发 enabled。与下面的强度互相独立。":
    "Control whether to send the thinking field. Not sending=don't include the field (compatible with models like MiniMax that don't support it); disabled=send disabled; enabled=send enabled. Independent of the below intensity.",
  指定模型失败时也兜底: "Gagal saat model ditentukan juga ditangani",
  轮询顺序: "Urutan Polling",
  不参与轮询: "Tidak turutik polling",
  MAX_TOKENS_FIELDS: "MAX_TOKENS_FIELDS",
  NONE: "NONE",
  none: "none",
  "max_tokens（默认）": "max_tokens (Default)",
  max_tokens: "max_tokens",
};

export default llmRecords;

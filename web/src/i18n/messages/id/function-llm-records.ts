/** Kosakata halaman LLM Records (kunci = string zh-CN asli). */
const llmRecords = {
  "LLM Records": "Catatan LLM",
  Model: "Model",
  Provider: "Penawar",
  "Base URL": "URL Dasar",
  "API Key": "Kunci API",
  "Authentication Method": "Metode Otentikasi",
  Streaming: "Aliran",
  Temperature: "Suhu",
  "Max Tokens": "Token Maksimal",
  "Top P": "Hukuman Frekuensi Atas",
  "Frequency Penalty": "Hukulan Frekuensi",
  "Presence Penalty": "Hukuman Keberadaan",
  "Stop Sequence": "Sekuenshi Berhenti",
  "Thinking Model": "Model Pensiapan",
  "Thinking Intensity": "Intensitas Pensiapan",
  "Don't send (default)": "Tidak Mengirim (Default)",
  Disable: "Nonaktifkan",
  Enabled: "Aktifkan",
  "Off by default. When off, only the active profile is used and failures stand.":
    "Default disabled. Selalu gunakan konfigurasi aktif saat gagal.",
  "Off by default: when an agent or task pins a profile, only it is used and failures stand (no silent model swap). When on, a pinned profile that fails also falls back to the pool chain below.":
    "Default disabled: Agent or task specified a config, used only if it fails (won't secretly switch to another model). Open, specified config fails, fall back to the polling chain below.",
  "Controls whether the thinking field is sent. Don't send = omit the field (for models that don't support it, e.g. MiniMax); Off sends disabled; On sends enabled. Independent of the effort level below.":
    "Control whether to send the thinking field. Not sending=don't include the field (compatible with models like MiniMax that don't support it); disabled=send disabled; enabled=send enabled. Independent of the below intensity.",
  "Fall back when a specified profile fails": "Gagal saat model ditentukan juga ditangani",
  "Pool order": "Urutan Polling",
  "Excluded from pool": "Tidak turutik polling",
  "max_tokens (default)": "max_tokens (Default)",
};

export default llmRecords;

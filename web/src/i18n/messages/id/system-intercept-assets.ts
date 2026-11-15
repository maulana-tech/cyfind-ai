/**
 * System → Asset Intercept (intercept aset), kunci sumber = string zh-CN asli.
 */

const messages = {
  "Domain (exact)": "Domain (persis)",
  "IP (exact)": "IP (persis)",
  "URL (exact)": "URL (persis)",
  "Domain (fuzzy)": "Domain (fuzzy)",
  "IP (fuzzy)": "IP (fuzzy)",
  "URL (fuzzy)": "URL (fuzzy)",
  "CIDR range": "Rentang CIDR",
  "Exact match": "Kecocokan persis",
  "Fuzzy match": "Kecocokan fuzzy",
  Range: "Rentang",
  "Match content is required": "Isi pencocokan wajib diisi",
  "Invalid CIDR format; expected something like 192.168.0.0/16":
    "Format CIDR tidak valid; seharusnya seperti 192.168.0.0/16",
  "Failed to load asset intercept rules": "Gagal memuat aturan intercept aset",
  "Rule updated": "Aturan diperbarui",
  "Rule created": "Aturan dibuat",
  "Rule deleted": "Aturan dihapus",
  "Delete asset intercept rule “{pattern}”?": "Hapus aturan intercept aset “{pattern}”?",
  "Asset Intercept": "Intercept Aset",
  "Global asset blocklist: matching domains / IPs / URLs / ranges are intercepted and no action is taken against them":
    "Daftar blokir aset global: domain / IP / URL / rentang yang cocok akan diblokir dan tidak ada tindakan apa pun yang dijalankan terhadapnya",
  "Supports exact and fuzzy matching for domains / IPs / URLs, plus CIDR ranges; built-in fuzzy blocking of government (.gov / .gov.cn) and education (.edu / .edu.cn) sites is on by default":
    "Mendukung kecocokan persis dan fuzzy untuk domain / IP / URL, serta rentang CIDR; pemblokiran fuzzy bawaan untuk situs pemerintah (.gov / .gov.cn) dan pendidikan (.edu / .edu.cn) aktif secara bawaan",
  "New rule": "Aturan baru",
  "Loading…": "Memuat…",
  "No asset intercept rules yet": "Belum ada aturan intercept aset",
  "Create the first rule": "Buat aturan pertama",
  Type: "Jenis",
  "Match content": "Isi pencocokan",
  Note: "Catatan",
  Enabled: "Aktif",
  "Built-in": "Bawaan",
  "[Built-in] Government sites (.gov)": "[Bawaan] Situs pemerintah (.gov)",
  "[Built-in] Government sites (.gov.cn)": "[Bawaan] Situs pemerintah (.gov.cn)",
  "[Built-in] Education sites (.edu)": "[Bawaan] Situs pendidikan (.edu)",
  "[Built-in] Education sites (.edu.cn)": "[Bawaan] Situs pendidikan (.edu.cn)",
  "Edit asset intercept rule": "Edit aturan intercept aset",
  "New asset intercept rule": "Aturan intercept aset baru",
  "Target assets matching this rule are intercepted globally":
    "Aset target yang cocok dengan aturan ini diblokir secara global",
  "Match type": "Jenis pencocokan",
  "CIDR range, e.g. 192.168.0.0/16": "Rentang CIDR, mis. 192.168.0.0/16",
  "Fuzzy match: hits when the target contains this content": "Kecocokan fuzzy: cocok jika target mengandung isi ini",
  "Exact match: the target must equal this content exactly":
    "Kecocokan persis: target harus sama persis dengan isi ini",
  "Note (optional)": "Catatan (opsional)",
  "Describe what this rule is for": "Jelaskan kegunaan aturan ini",
  "Enable this rule": "Aktifkan aturan ini",
  Cancel: "Batal",
  "Saving…": "Menyimpan…",
  Save: "Simpan",
} satisfies Record<string, string>;

export default messages;

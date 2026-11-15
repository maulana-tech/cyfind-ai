/**
 * System tools catalog page translations (keys are the original zh-CN strings).
 */

const messages = {
  Tools: "Alat",
  "Descriptions/bindings for system tools, plus custom tools (command/script/http)":
    "Deskripsi/ikatan tool sistem, serta tool kustom (command/script/http)",
  "Search tool name, description, agent…": "Cari nama tool, deskripsi, agent…",
  "System tools": "Tool sistem",
  "Custom tools": "Tool kustom",
  "{a} / {b} matches — click a card to edit description, parameter defaults, and agent bindings":
    "{a} / {b} cocok — klik kartu untuk mengubah deskripsi, nilai default parameter, dan ikatan Agent",
  "{n} in total — click a card to edit description, parameter defaults, and agent bindings":
    "{n} total — klik kartu untuk mengubah deskripsi, nilai default parameter, dan ikatan Agent",
  "No matching system tools": "Tidak ada tool sistem yang cocok",
  "(no system tools yet — waiting for the backend seed)": "(belum ada tool sistem — menunggu seed dari backend)",
  "shell/command/script/http — {a} / {b} matches, click a card to edit":
    "shell/command/script/http — {a} / {b} cocok, klik kartu untuk mengubah",
  "shell (bash declaration) / command (shell command) / script (Python) / http (API) — {n} in total, click a card to edit":
    "shell (deklarasi bash) / command (perintah shell) / script (Python) / http (API) — {n} total, klik kartu untuk mengubah",
  "New custom tool": "Tool kustom baru",
  "No matching custom tools": "Tidak ada tool kustom yang cocok",
  "(no custom tools yet — click “New custom tool” at the top right)":
    "(belum ada tool kustom — klik “Tool kustom baru” di kanan atas)",
  "Edit description, parameter defaults, and agent bindings":
    "Ubah deskripsi, nilai default parameter, dan ikatan Agent",
  "Saved tool “{key}”": "Tool “{key}” disimpan",
  "Save failed: {message}": "Gagal menyimpan: {message}",
  "Restored “{key}” to code defaults": "“{key}” dipulihkan ke default kode",
  "Restore failed: {message}": "Gagal memulihkan: {message}",
  "This tool requires ": "Tool ini memerlukan ",
  "Traffic capture": "Traffic capture",
  ". Enable traffic capture in System Settings first, then bind it to agents and turn it on.":
    ". Aktifkan traffic capture di System Settings terlebih dahulu, lalu ikat ke Agent dan nyalakan.",
  "Bind agents (decides which agents get this tool)": "Ikat Agent (menentukan Agent mana yang menerima tool ini)",
  "(no agents)": "(tanpa Agent)",
  Enabled: "Aktif",
  "Tool description (sent to the model)": "Deskripsi tool (dikirim ke model)",
  "Parameters (name / type / required are read-only; description and default are editable)":
    "Parameter (nama / jenis / wajib hanya-baca; deskripsi dan default bisa diubah)",
  "(no parameters)": "(tanpa parameter)",
  Required: "Wajib",
  "items sub-field": "sub-field items",
  Description: "Deskripsi",
  "Default value": "Nilai default",
  "(empty = no default)": "(kosong = tanpa default)",
  "Scalars only": "Hanya skalar",
  Save: "Simpan",
  "Restore defaults": "Pulihkan bawaan",
  System: "Sistem",
  "Custom · {kind}": "Kustom · {kind}",
  Disabled: "Dinonaktifkan",
  "Called {n} times in total": "Total {n} panggilan",
  "Calls {n}": "{n} panggilan",
  "(no description)": "(tanpa deskripsi)",
  "(no agents bound)": "(belum terikat ke Agent)",
  "Edit {key}": "Ubah {key}",
  "shell = bash environment declaration (name + description only; tells the model it can call bash). command/script/http need an execution spec.":
    "shell = deklarasi lingkungan bash (hanya nama + deskripsi; memberi tahu model bahwa bash bisa dipanggil). command/script/http perlu spesifikasi eksekusi.",
  "e.g. nmap_scan": "mis. nmap_scan",
  "Description (sent to the model)": "Deskripsi (dikirim ke model)",
  Type: "Jenis",
  "shell (bash environment declaration)": "shell (deklarasi lingkungan bash)",
  "command (shell command template)": "command (template perintah shell)",
  "script (Python script)": "script (skrip Python)",
  "http (API request)": "http (permintaan API)",
  "For well-known tools like nmap, sqlmap, ffuf — the model already knows how to use them; just declare that they can be called from bash. The name + description are appended to the Bash tool description.":
    "Untuk tool terkenal seperti nmap, sqlmap, ffuf — model sudah tahu cara pakainya; cukup deklarasikan bahwa tool bisa dipanggil dari bash. Nama + deskripsi ditambahkan ke deskripsi tool Bash.",
  "Command template (placeholders {param}, e.g. nmap -p {ports} {target})":
    "Template perintah (placeholder {param}, mis. nmap -p {ports} {target})",
  'Python body (params via stdin JSON / os.environ["TOOL_X"])':
    'Isi Python (parameter via stdin JSON / os.environ["TOOL_X"])',
  "URL (may contain {param})": "URL (boleh mengandung {param})",
  "Headers (JSON, may contain {param})": "Headers (JSON, boleh mengandung {param})",
  "Body (may contain {param})": "Body (boleh mengandung {param})",
  "Proxy URL (empty = direct)": "URL proxy (kosong = langsung)",
  "Use recording proxy": "Gunakan proxy rekaman",
  "Timeout (ms, empty = default)": "Timeout (ms, kosong = bawaan)",
  "Parameter JSON Schema": "JSON Schema parameter",
  "(required for http tools; must include properties)": "(wajib untuk tool http; harus memuat properties)",
  "(empty = auto-wrap with {args})": "(kosong = bungkus otomatis dengan {args})",
  "Bind agents": "Ikat Agent",
  "deferred (only enable for large sets of rarely used tools)":
    "deferred (hanya aktifkan untuk banyak tool yang jarang dipakai)",
  "Test run (uses the current form; nothing is saved)":
    "Tes jalankan (pakai formulir saat ini; tidak ada yang disimpan)",
  'Sample params JSON, e.g. {"target":"example.com"}': 'Contoh JSON params, mis. {"target":"example.com"}',
  "Running…": "Berjalan…",
  "Test run": "Tes jalankan",
  "(no output)": "(tanpa output)",
  Create: "Buat",
  Delete: "Hapus",
  "key must start with a lowercase letter and use only lowercase letters, digits, and underscores":
    "key harus diawali huruf kecil dan hanya berisi huruf kecil, angka, dan garis bawah",
  "Invalid parameter JSON Schema": "JSON Schema parameter tidak valid",
  "Invalid headers JSON": "JSON headers tidak valid",
  "http tools must provide a parameter JSON Schema (must include properties; cannot be empty)":
    "Tool http harus memiliki JSON Schema parameter (harus memuat properties; tidak boleh kosong)",
  "Custom tool created": "Tool kustom dibuat",
  Saved: "Tersimpan",
  Deleted: "Dihapus",
  "Delete failed: {message}": "Gagal menghapus: {message}",
  "Invalid test params JSON": "JSON params tes tidak valid",
} satisfies Record<string, string>;

export default messages;

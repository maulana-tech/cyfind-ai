/**
 * Agent editor drawer (agent-editor.tsx): konfigurasi, prompt, wrap-up,
 * visibilitas MCP/Skill, binding tool, dan trigger agent kustom.
 */

const messages = {
  "Save failed: {error}": "Gagal menyimpan: {error}",
  "Restore failed: {error}": "Gagal memulihkan: {error}",
  "Render error: {error}": "Kesalahan render: {error}",
  "Preview failed: {error}": "Pratinjau gagal: {error}",
  "Saved as version v{version}": "Tersimpan sebagai versi v{version}",
  "Restored to the built-in default (v{version})": "Dipulihkan ke default bawaan sistem (v{version})",
  "Restored to the built-in default": "Dipulihkan ke default bawaan sistem",
  "Wrap-up configuration saved (applies to the next run)":
    "Konfigurasi wrap-up tersimpan (berlaku untuk eksekusi berikutnya)",
  "Cleared; the built-in default will be used": "Dikosongkan; default bawaan sistem akan dipakai",
  "Task-timeout wrap-up configuration saved (applies to the next run)":
    "Konfigurasi wrap-up timeout tugas tersimpan (berlaku untuk eksekusi berikutnya)",
  'Loaded v{version} into the editor; click "Save as New Version" when done':
    'v{version} dimuat ke editor; klik "Simpan sebagai Versi Baru" setelah selesai',
  "Run configuration saved (applied immediately)": "Konfigurasi eksekusi tersimpan (langsung berlaku)",
  "Agent not found: {key}": "Agent tidak ditemukan: {key}",
  "Configuration & Prompt": "Konfigurasi & Prompt",
  "Preview Render": "Pratinjau Render",
  "Render Preview": "Pratinjau Render",
  "All {{.Var}} placeholders have been replaced by the backend with example values.":
    "Semua {{.Var}} telah diganti oleh backend dengan nilai contoh.",
  "Save as New Version": "Simpan sebagai Versi Baru",
  "Restore defaults": "Pulihkan Bawaan",
  "Load into Editor": "Muat ke Editor",
  "Compare with Current Version": "Bandingkan dengan Versi Saat Ini",
  "Version diff: v{old} → v{new} (current)": "Perbandingan versi: v{old} → v{new} (saat ini)",
  "- Removed": "- Dihapus",
  "+ Added": "+ Ditambahkan",
  "Version History": "Riwayat Versi",
  Current: "Saat ini",
  "(No saved versions; using the built-in default)": "(Belum ada versi tersimpan; memakai default bawaan sistem)",
  "(No note)": "(Tanpa catatan)",
  "(Empty)": "(Kosong)",
  "Default Model (LLM Profile)": "Model Bawaan (Profil LLM)",
  "Follow task / globally active profile": "Ikuti tugas / profil aktif global",
  " · Default": " · Bawaan",
  'Bind a fixed LLM profile to this Agent (applies when you click "Save Configuration"). Priority: Agent binding > task/session setting > global active profile.':
    'Ikat profil LLM tetap untuk Agent ini (berlaku setelah klik "Simpan Konfigurasi"). Prioritas: ikatan Agent > pengaturan tugas/sesi > profil aktif global.',
  "Max turns (0 = unlimited)": "Jumlah iterasi maksimum (0 = tanpa batas)",
  "Run time (seconds, 0 = unlimited)": "Durasi eksekusi (detik, 0 = tanpa batas)",
  "Save config": "Simpan Konfigurasi",
  "Web search": "Pencarian Web",
  "When enabled for this Agent (applies after saving above), web_search can query the internet":
    "Setelah diaktifkan untuk Agent ini (berlaku setelah menyimpan di atas), web_search dapat mencari di internet",
  "Enable Web Search in System Settings and configure the backend first":
    "Aktifkan Pencarian Web di Pengaturan Sistem dan konfigurasikan backend terlebih dahulu",
  "Interactive Shell": "Shell Interaktif",
  "When enabled for this Agent (applies after saving above), persistent PTY session tools (shell_open/send/read/close/list) can drive interactive programs like msfconsole/ssh/REPL":
    "Setelah diaktifkan untuk Agent ini (berlaku setelah menyimpan di atas), tool sesi PTY persisten (shell_open/send/read/close/list) dapat menjalankan program interaktif seperti msfconsole/ssh/REPL",
  "Variables (click to insert a placeholder; replaced with runtime data at render time)":
    "Variabel (klik untuk menyisipkan placeholder; diganti dengan data runtime saat render)",
  "Example: {example}": "Contoh: {example}",
  "(No variables)": "(Tidak ada variabel)",
  "Leave empty to use the built-in default prompt": "Kosongkan untuk memakai prompt default bawaan sistem",
  'MCP "{name}" is no longer visible to this agent': 'MCP "{name}" tidak lagi terlihat oleh agent ini',
  'MCP "{name}" is now visible to this agent': 'MCP "{name}" kini terlihat oleh agent ini',
  'Skill "{name}" is no longer visible to this agent': 'Skill "{name}" tidak lagi terlihat oleh agent ini',
  'Skill "{name}" is now visible to this agent': 'Skill "{name}" kini terlihat oleh agent ini',
  'Unbound tool "{key}"': 'Tool "{key}" dilepas',
  'Bound tool "{key}"': 'Tool "{key}" terikat',
  "Failed to save tool binding: {error}": "Gagal menyimpan ikatan tool: {error}",
  "Check the MCP servers this Agent can see.": "Pilih server MCP yang dapat dilihat Agent ini.",
  "(No MCP servers)": "(Tidak ada MCP)",
  "Check the Skills this Agent can see.": "Pilih Skill yang dapat dilihat Agent ini.",
  "(No Skills)": "(Tidak ada Skill)",
  "Check the built-in tools bound to this Agent.": "Pilih tool bawaan yang terikat ke Agent ini.",
  Traffic: "Traffic",
  Disabled: "Dinonaktifkan",
  "Traffic capture must be enabled": "Perekaman traffic harus diaktifkan",
  "(No tools)": "(Tidak ada tool)",
  "Wrap-up Prompt": "Prompt Wrap-up",
  "When this Agent is terminated due to": "Saat Agent ini dihentikan karena ",
  "Timed Out": "waktu habis",
  OR: " atau ",
  "step exhaustion": "langkah habis",
  ', the system injects this "wrap-up prompt" to run one wrap-up turn: first persist anything identified but not yet saved, then output a brief summary (to avoid an unfinished run). Leave empty to use the built-in default.':
    ', sistem menyuntikkan "prompt wrap-up" ini untuk menjalankan satu putaran wrap-up: pertama simpan hal yang sudah terdeteksi tapi belum masuk basis data, lalu keluarkan ringkasan singkat (menghindari run yang menggantung). Kosongkan untuk memakai default bawaan sistem.',
  "Wrap-up Prompt Body": "Isi Prompt Wrap-up",
  Custom: "Kustom",
  "Using built-in default": "Memakai bawaan sistem",
  "Leave empty to use the built-in default wrap-up prompt":
    "Kosongkan untuk memakai prompt wrap-up default bawaan sistem",
  "Wrap-up turns (max turns for the wrap-up phase itself; 0 = built-in default of {turns} turns)":
    "Jumlah putaran wrap-up (maks putaran fase wrap-up itu sendiri; 0 = default bawaan sistem {turns} putaran)",
  Save: "Simpan",
  "Built-in default (read-only, for reference)": "Bawaan bawaan sistem (hanya baca, sebagai referensi)",
  "Task-timeout wrap-up": "Wrap-up timeout tugas",
  " (this is a ": " (ini mekanisme ",
  "separate mechanism": "terpisah",
  " from the per-run wrap-up above): injected when the ": " dari wrap-up per-run di atas): disuntikkan saat ",
  "whole task": "seluruh tugas",
  " reaches its timeout limit and is about to end. Its semantics often differ from the per-run wrap-up (e.g. planner: per-run says “keep going, keep planning”, task timeout says “stop now, make a final call”). Leave empty to use the built-in default.":
    " mencapai batas timeout dan akan selesai. Semantiknya sering berlawanan dengan wrap-up per-run (mis. planner: per-run bilang “jangan berhenti, terus rencanakan”, timeout tugas bilang “berhenti sekarang, buat keputusan akhir”). Kosongkan untuk memakai default bawaan sistem.",
  "Task-timeout Wrap-up Prompt Body": "Isi Prompt Wrap-up Timeout Tugas",
  "Leave empty to use the built-in default task-timeout wrap-up prompt":
    "Kosongkan untuk memakai prompt wrap-up timeout tugas default bawaan sistem",
  "Wrap-up turns (0 = built-in default of {turns} turns)":
    "Jumlah putaran wrap-up (0 = default bawaan sistem {turns} putaran)",
  Triggers: "Trigger",
  "Failed to save behavior policy: {error}": "Gagal menyimpan kebijakan: {error}",
  "Select at least one trigger condition": "Pilih setidaknya satu kondisi pemicu",
  "Tool-call triggers require at least one tool": "Pemicu panggilan tool memerlukan setidaknya satu tool",
  "Changes saved": "Perubahan tersimpan",
  "Trigger added": "Trigger ditambahkan",
  "Failed to add: {error}": "Gagal menambahkan: {error}",
  "Delete failed: {error}": "Gagal menghapus: {error}",
  "Every {sec}s": "Setiap {sec}s",
  "Finding discovered": "Finding ditemukan",
  "Goal met": "Target tercapai",
  "Task Timed Out": "Timeout tugas",
  "Tool call ({n})": "Panggilan tool ({n})",
  "Task created": "Tugas dibuat",
  "(No conditions)": "(Tanpa kondisi)",
  "Triggers make this custom Agent run automatically; each trigger ":
    "Trigger membuat Agent kustom ini berjalan otomatis; setiap pemicu ",
  "starts a new conversation run": "memulai sesi percakapan baru",
  ' (visible on the Chat page). You can select multiple conditions; the system appends "why this fired + related task/finding/goal" to your base message.':
    ' (terlihat di halaman Chat). Anda dapat memilih banyak kondisi; sistem menambahkan "alasan pemicu + tugas/finding/target terkait" ke pesan dasar Anda.',
  "Post-trigger behavior (controls how triggered runs are queued and merged)":
    "Perilaku pasca-pemicu (menentukan antrean dan penggabungan eksekusi pemicu)",
  "Run Mode": "Mode Eksekusi",
  "Serial (queued, one at a time)": "Serial (berantre, satu per satu)",
  "Parallel (concurrent sessions)": "Paralel (sesi konkuren)",
  "Merge Mode": "Mode Gabung",
  "Merge by task": "Gabung per tugas",
  "Merge all into one": "Gabungkan semua",
  "No merging": "Tanpa penggabungan",
  "Max concurrency (0 = unlimited)": "Konkurensi maks (0 = tanpa batas)",
  "Parallel: each trigger immediately opens its own session and runs concurrently, with no merging; triggers beyond max concurrency queue for a free slot.":
    "Paralel: setiap pemicu langsung membuka sesinya sendiri dan berjalan konkuren, tanpa digabung; pemicu yang melebihi konkurensi maks mengantre menunggu slot kosong.",
  "Serial · merge by task: one run at a time per agent; queued events for the same task are merged into one session.":
    "Serial · gabung per tugas: satu perjalanan per agent; peristiwa untuk tugas yang sama di antrean digabung menjadi satu sesi.",
  "Serial · merge all: one run at a time per agent; when dequeuing, all currently queued triggers are merged into one session.":
    "Serial · gabung semua: satu perjalanan per agent; saat mengambil dari antrean, semua pemicu yang sedang mengantre digabung menjadi satu sesi.",
  "Serial · no merging: one run at a time per agent; each trigger gets its own session.":
    "Serial · tanpa penggabungan: satu perjalanan per agent; setiap pemicu mendapat sesinya sendiri.",
  'Edit trigger #{id} (click "Save Changes" when done)': 'Edit trigger #{id} (klik "Simpan Perubahan" setelah selesai)',
  "New trigger (each condition can have its own user message)":
    "Trigger baru (setiap kondisi dapat memiliki pesan pengguna sendiri)",
  "Timed trigger": "Pemicu terjadwal",
  Every: "Setiap",
  seconds: "detik",
  "Message sent to the agent on each timed trigger, e.g. inspect all tasks":
    "Pesan yang dikirim ke agent pada setiap pemicu terjadwal, mis. periksa semua tugas",
  "Trigger on finding discovered": "Pemicu saat finding ditemukan",
  "Message sent to the agent when a finding is discovered (the system attaches the task and finding details)":
    "Pesan yang dikirim ke agent saat finding ditemukan (sistem melampirkan detail tugas dan finding)",
  "Trigger on goal met": "Pemicu saat target tercapai",
  "Message sent to the agent when a goal is met (the system attaches the task and the met goal)":
    "Pesan yang dikirim ke agent saat target tercapai (sistem melampirkan tugas dan target yang tercapai)",
  "Trigger on task timeout": "Pemicu saat timeout tugas",
  "Message sent to the agent when a task times out (the system attaches the task ID and goal)":
    "Pesan yang dikirim ke agent saat tugas timeout (sistem melampirkan ID tugas dan target)",
  "Trigger on tool call": "Pemicu saat tool dipanggil",
  "Select the tools to watch (at least one); during task execution, every ":
    "Pilih tool yang dipantau (setidaknya satu); selama eksekusi tugas, setiap ",
  "tool call completion": "penyelesaian panggilan tool",
  " for these tools fires the trigger. {n} selected.": " pada tool ini memicu trigger. {n} dipilih.",
  "(Tool list is empty)": "(Daftar tool kosong)",
  "Message sent to the agent when a tool is called (the system attaches task info, tool arguments and return content)":
    "Pesan yang dikirim ke agent saat tool dipanggil (sistem melampirkan info tugas, argumen tool, dan isi hasil)",
  "Trigger on task created": "Pemicu saat tugas dibuat",
  "Message sent to the agent when a task is created (the system attaches the task ID and goal)":
    "Pesan yang dikirim ke agent saat tugas dibuat (sistem melampirkan ID tugas dan target)",
  "Save changes": "Simpan Perubahan",
  "Add Trigger": "Tambah Trigger",
  "Cancel Edit": "Batal Edit",
  "Existing Triggers": "Trigger yang Ada",
  "(None yet)": "(Belum ada)",
  "Timed: {message}": "Terjadwal: {message}",
  "finding：{message}": "Finding: {message}",
  "Goal: {message}": "Target: {message}",
  "Timeout: {message}": "Timeout: {message}",
  "Task created: {message}": "Tugas dibuat: {message}",
  "Tools:": "Tool:",
  "(none selected)": "(tidak dipilih)",
  "Message: {message}": "Pesan: {message}",
  Edit: "Edit",
  Delete: "Hapus",
} satisfies Record<string, string>;

export default messages;

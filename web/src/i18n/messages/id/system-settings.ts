/**
 * Terjemahan halaman pengaturan sistem (system/settings)
 * (kunci adalah string zh-CN asli).
 */

const messages = {
  "Concurrency must be an integer greater than 0": "Kongurensi harus bilangan bulat lebih besar dari 0",
  "Saved the worker agent count (applies to tasks started later)":
    "Jumlah agent worker disimpan (berlaku untuk tugas yang dimulai nanti)",
  "Save failed: {message}": "Gagal menyimpan: {message}",
  "Python interpreter configuration saved": "Konfigurasi interpreter Python disimpan",
  "Enabled Agent auto traffic binding": "Pengikatan traffic otomatis Agent diaktifkan",
  "Disabled Agent auto traffic binding": "Pengikatan traffic otomatis Agent dinonaktifkan",
  "Enabled noa context compaction (applies to runs started later)":
    "Kompaksi konteks noa diaktifkan (berlaku untuk run yang dimulai nanti)",
  "Disabled noa context compaction (built-in compaction restored)":
    "Kompaksi konteks noa dinonaktifkan (kompaksi bawaan dipulihkan)",
  "Web search configuration saved": "Konfigurasi pencarian web disimpan",
  "Brave API Key saved": "Brave API Key disimpan",
  "Tavily API Key saved": "Tavily API Key disimpan",
  "Egress proxy saved": "Proxy egress disimpan",
  "Egress proxy cleared (switched to a direct connection)": "Proxy egress dihapus (dialihkan ke koneksi langsung)",
  "Global proxy saved": "Proxy global disimpan",
  "Global proxy cleared (switched to a direct connection)": "Proxy global dihapus (dialihkan ke koneksi langsung)",
  "Search test succeeded · {backend} returned {count} results":
    "Tes pencarian berhasil · {backend} mengembalikan {count} hasil",
  "Search test failed: {message}": "Tes pencarian gagal: {message}",
  "unknown error": "kesalahan tidak diketahui",
  "System Settings": "Pengaturan Sistem",
  "Global runtime switches": "Saklar runtime global",
  "Traffic capture": "Penangkapan traffic",
  "When on, all Agents' HTTP traffic is fully persisted through the recording proxy, and the traffic_search / traffic_get tools plus proxy configuration are injected into Agents (the prompt includes proxy instructions).":
    "Saat aktif, seluruh HTTP traffic Agent disimpan penuh lewat proxy pencatat, dan perkakas traffic_search / traffic_get serta konfigurasi proxy disuntikkan ke Agent (prompt memuat petunjuk proxy).",
  "Off (the default): no traffic is recorded — Agents": "Nonaktif (bawaan): tidak ada traffic yang direkam — Agent",
  "won't": "tidak akan",
  " receive proxy configuration or traffic tools, and prompts ":
    " menerima konfigurasi proxy atau perkakas traffic, dan prompt ",
  "doesn't include": "tidak memuat",
  " proxy-related content. Toggling rebuilds Agents immediately to take effect.":
    " konten terkait proxy. Mengubahnya langsung membangun ulang Agent agar berlaku.",
  "On · Recording traffic and injecting the proxy": "Aktif · Merekam traffic dan menyuntikkan proxy",
  "Off · Not recording, no proxy injection": "Nonaktif · Tidak merekam, tanpa injeksi proxy",
  "Agent auto traffic binding": "Pengikatan traffic otomatis Agent",
  "Off by default. When on, the report Agent triggered by filing a finding cross-checks existing HTTP requests/responses, links the matching traffic, then writes the report.":
    "Nonaktif secara bawaan. Saat aktif, Agent laporan yang dipicu saat temuan dicocokkan dengan request/respons HTTP yang sudah ada, menautkan traffic yang sesuai, lalu menulis laporan.",
  "Reviewing packets and extra tool calls increases Token consumption.":
    "Memeriksa paket dan pemanggilan tool tambahan menambah konsumsi Token.",
  "Reporting still works for TCP, uncaptured, or unmatched traffic. This switch doesn't affect traffic capture, manual binding, or viewing saved evidence. It applies to the next Agent round; turning it off immediately rejects new auto-bindings.":
    "Pelaporan tetap berjalan untuk traffic TCP, yang tidak terekam, atau yang tidak cocok. Saklar ini tidak memengaruhi penangkapan traffic, pengikatan manual, atau tampilan bukti tersimpan. Berlaku untuk ronde Agent berikutnya; saat nonaktif, pengikatan otomatis baru langsung ditolak.",
  "On · Increases Token consumption": "Aktif · Menambah konsumsi Token",
  "Off · Manual binding still available": "Nonaktif · Pengikatan manual tetap tersedia",
  "Global proxy": "Proxy global",
  "All Agents' ": "Semua Agent ",
  "target traffic": "traffic target",
  " exits through this proxy (hiding the source IP / via a jump host). Supports ":
    " keluar lewat proxy ini (menyembunyikan IP sumber / lewat jump host). Mendukung ",
  ", and can use": ", dan bisa memakai",
  " authentication. Leave empty for a direct connection.": " autentikasi. Kosongkan untuk koneksi langsung.",
  "When ": "Saat ",
  " is on, it serves as the ": " aktif, proxy ini menjadi ",
  "upstream of the recording proxy": "upstream bagi proxy pencatat",
  " (traffic is still fully persisted, then exits through this proxy); with capture off, it is injected directly into Agents' bash / WebFetch egress. Independent of the web search proxy and the LLM proxy.":
    " (traffic tetap tersimpan penuh, lalu keluar lewat proxy ini); saat penangkapan nonaktif, disuntikkan langsung ke egress bash / WebFetch Agent. Tidak tergantung pada proxy pencarian web maupun proxy LLM.",
  Tip: "Tips",
  ": socks5, when ": ": socks5, saat ",
  "capture is off": "penangkapan nonaktif",
  ", depends on each command-line tool's ": ", bergantung pada dukungan setiap tool command-line terhadap ",
  " support (curl works; some tools may ignore it). If you mainly use socks5, enable traffic capture — that path is dialed by the MITM itself, so tools are unaware of it and it works reliably.":
    " (curl bisa, sebagian tool mungkin mengabaikannya). Jika terutama memakai socks5, aktifkan penangkapan traffic — jalur ini di-dial langsung oleh MITM, jadi tool tidak menyadarinya dan tetap stabil.",
  "Proxy address": "Alamat proxy",
  "socks5://user:pass@host:1080 or http://host:port (leave empty = direct)":
    "socks5://user:pass@host:1080 atau http://host:port (kosongkan = langsung)",
  Save: "Simpan",
  "Configured · All target traffic exits through this proxy":
    "Terkonfigurasi · Semua traffic target keluar lewat proxy ini",
  "Not configured · Target traffic connects directly": "Tidak terkonfigurasi · Traffic target tersambung langsung",
  "Operation constraints injection": "Injeksi batasan operasi",
  "When on, each task's ": "Saat aktif, ",
  "operation constraints": "batasan operasi",
  " (the allow/deny entries maintained under “Operation constraints” in the task overview) are appended to the corresponding Agent's system prompt to frame exploration boundaries (e.g. “only test the current port”, “no brute forcing”).":
    " (entri allow/deny yang dirawat di “Batasan operasi” pada ringkasan tugas) disisipkan ke system prompt Agent yang bersangkutan untuk membatasi area eksplorasi (misal “hanya uji port ini”, “dilarang brute force”).",
  "Injection can be controlled separately for the ": "Penyuntikan bisa dikendalikan terpisah untuk ",
  planner: "planner",
  " and the ": " dan ",
  worker: "worker",
  "; both are on by default. Toggling takes effect immediately (read on the next turn) — no Agent rebuild needed. When off, the Agent no longer sees the constraints.":
    "; keduanya aktif secara bawaan. Efeknya langsung saat berganti (dibaca pada giliran berikutnya) — tanpa perlu membangun ulang Agent. Saat nonaktif, Agent tidak lagi melihat batasan.",
  "Inject into the planner": "Suntikkan ke planner",
  " · On": " · Aktif",
  " · Off": " · Nonaktif",
  "Inject into the worker": "Suntikkan ke worker",
  "Experimental features": "Fitur eksperimental",
  "Mechanisms still being validated, off by default. They may change Agent behavior or affect stability — enable them only after understanding the impact.":
    "Mekanisme yang masih dalam validasi, nonaktif secara bawaan. Bisa mengubah perilaku Agent atau memengaruhi stabilitas — aktifkan setelah memahami dampaknya.",
  "noa context compaction": "kompaksi konteks noa",
  ": the model proactively compresses long conversation history (norma v0.4.0). When enabled, the four Agent types on the platform (":
    ": model mengompres riwayat percakapan panjang secara proaktif (norma v0.4.0). Saat diaktifkan, empat jenis Agent di platform (",
  "Planner / Worker / Main Agent / Chat": "Planner / Worker / Agent utama / Chat",
  ") switch to noa to take over context handling instead of built-in compaction; the original text is archived under the task's working directory for traceability. Toggling takes effect immediately (for runs started later) with no Agent rebuild; turning it off restores built-in compaction right away.":
    ") beralih ke noa untuk mengelola konteks menggantikan kompresi bawaan; teks asli diarsipkan di direktori kerja tugas untuk penelusuran. Efeknya langsung (untuk run yang dimulai nanti) tanpa membangun ulang Agent; saat nonaktif, kompresi bawaan langsung dipulihkan.",
  "Master switch on · Can be enabled per Agent": "Saklar utama aktif · Bisa diaktifkan per Agent",
  "Off · Agents can't enable web search": "Nonaktif · Agent tidak bisa mengaktifkan pencarian web",
  "Web search": "Pencarian web",
  "This is the web search ": "Ini adalah ",
  "master switch + source configuration": "saklar utama + konfigurasi sumber",
  ". Only once it's on can you choose in ": " untuk pencarian web. Setelah diaktifkan, barulah bisa memilih di ",
  "each Agent's configuration": "konfigurasi tiap Agent",
  " whether to separately enable ": " apakah mengaktifkan ",
  " (returns only titles/links/snippets — it doesn't fetch page content; fetching is handled by WebFetch). Web search ":
    " (hanya judul/tautan/ringkasan — tidak mengambil isi halaman; pengambilan ditangani WebFetch). Pencarian web ",
  "doesn't use": "tidak lewat",
  " the recording proxy; it's independent of traffic capture.": " proxy pencatat; terlepas dari penangkapan traffic.",
  "Available sources: ": "Sumber tersedia: ",
  "DuckDuckGo（ddgs）": "DuckDuckGo (ddgs)",
  " (no Key required), ": " (tanpa perlu Key), ",
  "Brave (free)": "Brave (gratis)",
  " (requires a Brave API Key),": " (perlu isi Brave API Key),",
  " (requires a Tavily API Key) or ": " (perlu isi Tavily API Key) atau ",
  " (reuses your current LLM configuration). When the master switch is off, per-Agent web search switches are unavailable.":
    " (memakai ulang konfigurasi LLM aktif). Saat saklar utama nonaktif, saklar pencarian web tiap Agent tidak tersedia.",
  "Search source": "Sumber pencarian",
  "Select a source": "Pilih sumber",
  "DuckDuckGo (ddgs · free, no Key)": "DuckDuckGo (ddgs · gratis, tanpa Key)",
  "Brave (free · needs Key)": "Brave (gratis · butuh Key)",
  "Tavily (needs Key)": "Tavily (butuh Key)",
  "DeepSeek (official)": "DeepSeek (resmi)",
  "DeepSeek official web search": "Pencarian web resmi DeepSeek",
  "This source directly reuses the ": "Sumber ini langsung memakai ",
  "currently active LLM configuration": "konfigurasi LLM yang aktif saat ini",
  ". Therefore it ": ". Karena itu, ",
  "only supports official DeepSeek models": "hanya mendukung model resmi DeepSeek",
  ", and that configuration ": ", dan konfigurasi itu ",
  "must use the anthropic protocol": "harus memakai protokol anthropic",
  "— DeepSeek's OpenAI-protocol endpoint doesn't support server-side search. This source may stop working after you switch LLM configurations.":
    "— titik akhir protokol OpenAI DeepSeek tidak mendukung pencarian di sisi server. Sumber ini bisa berhenti bekerja setelah Anda mengganti konfigurasi LLM.",
  "Unlike other sources, searches are ": "Berbeda dengan sumber lain, pencarian ",
  "run on DeepSeek's servers": "dijalankan di server DeepSeek",
  ": each search consumes an extra model call (in Token cost), and search requests ":
    ": setiap pencarian menghabiskan satu panggilan model tambahan (biaya Token), dan permintaan pencarian ",
  "bypass the egress proxy above": "melewati proxy egress di atas",
  ", and are ": ", dan ",
  "not recorded in traffic logs": "tidak tercatat dalam jejak traffic",
  "; returned results ": "; hasil yang dikembalikan ",
  "contain only titles and links": "hanya berisi judul dan tautan",
  " (no snippets) — WebFetch fetches the full text when needed.":
    " (tanpa ringkasan) — WebFetch mengambil isi halaman saat diperlukan.",
  "You're responsible for confirming the conditions above — the system won't block you; use the “Test search” button below to actually run a query and verify.":
    "Anda sendiri yang memastikan kondisi di atas — sistem tidak memblokirnya; gunakan tombol “Uji pencarian” di bawah untuk menjalankan pencarian sungguhan sebagai verifikasi.",
  Configured: "Terkonfigurasi",
  "Configured (leave blank to keep)": "Terkonfigurasi (kosongkan untuk mempertahankan)",
  "Enter the Brave API Key": "Masukkan Brave API Key",
  "Brave is selected but no Key is configured yet — the search tool stays off until you save a Key.":
    "Brave dipilih tetapi belum ada Key yang dikonfigurasi — alat pencarian tetap mati sampai Anda menyimpan Key.",
  "The free tier allows about 2,000 searches/month. Get a Key at https://brave.com/search/api/.":
    "Kuota gratis sekitar 2.000 pencarian/bulan. Dapatkan Key di https://brave.com/search/api/.",
  "Enter the Tavily API Key (tvly-…)": "Masukkan Tavily API Key (tvly-…)",
  "Tavily is selected but no Key is configured yet — the search tool stays off until you save a Key.":
    "Tavily dipilih tetapi belum ada Key yang dikonfigurasi — alat pencarian tetap mati sampai Anda menyimpan Key.",
  "Sign up at https://tavily.com to get an API Key.": "Daftar di https://tavily.com untuk mendapatkan API Key.",
  "Egress proxy (optional)": "Proxy egress (opsional)",
  "http://host:port or socks5://host:port (leave empty = direct)":
    "http://host:port atau socks5://host:port (kosongkan = langsung)",
  "A separate egress proxy used only to reach search endpoints (VPN/SOCKS, etc.). Unrelated to the traffic-recording MITM proxy; use it when the direct route can't connect.":
    "Proxy egress terpisah, hanya untuk mengakses endpoint pencarian (VPN/SOCKS, dll.). Tidak berkaitan dengan MITM proxy perekam traffic; pakai saat jalur langsung tidak tersambung.",
  "Runs a real search for “test” with the current settings (source + proxy + Key) to verify it works.":
    "Menjalankan pencarian sungguhan untuk “test” dengan pengaturan saat ini (sumber + proxy + Key) untuk memverifikasinya.",
  "Testing…": "Menguji…",
  "Test search": "Uji pencarian",
  "Custom scripts · Python interpreter": "Script kustom · Interpreter Python",
  "Custom ": "Kustom ",
  " script-type tools run Python with it. It's auto-detected at startup (python3 preferred); here you can enter an absolute path to a venv or specific version — leave empty to auto-detect at runtime.":
    " type tool menjalankan Python dengannya. Deteksi otomatis saat startup (python3 lebih dulu); di sini Anda bisa mengisi path absolut ke venv atau versi tertentu — kosongkan agar dideteksi otomatis saat runtime.",
  "/usr/bin/python3 (leave empty = auto-detect)": "/usr/bin/python3 (kosongkan = deteksi otomatis)",
  "Detect again": "Deteksi ulang",
  "Worker concurrency · work agent count": "Kongurensi kerja · jumlah work agent",
  "How many work agents run concurrently per task (default 3). Higher values probe more in parallel but consume more. Changes apply ":
    "Jumlah work agent yang berjalan paralel per tugas (bawaan 3). Angka lebih besar berarti lebih banyak probe paralel dan konsumsi lebih tinggi. Perubahan berlaku ",
  "to tasks started later": "untuk tugas yang dimulai nanti",
  " — running tasks are unaffected.": " — tugas yang berjalan tidak terpengaruh.",
  "Chat input send key": "Tombol kirim kotak chat",
  "Shared by the chat page and the task-detail main Agent input; it takes effect immediately with no saving needed.":
    "Dipakai bersama oleh kotak input chat utama di halaman percakapan dan detail tugas; langsung berlaku tanpa perlu menyimpan.",
  "This preference is ": "Preferensi ini ",
  "stored only in this browser": "hanya tersimpan di browser ini",
  ", is not synced with your account, and must be re-set after switching browsers or clearing site data.":
    ", tidak disinkronkan dengan akun, dan harus diatur ulang setelah ganti browser atau membersihkan data situs.",
  "Send mode": "Mode pengiriman",
  "Enter to send, Shift+Enter for newline": "Enter untuk kirim, Shift+Enter untuk baris baru",
  "Ctrl+Enter to send, Enter for newline": "Ctrl+Enter untuk kirim, Enter untuk baris baru",
} satisfies Record<string, string>;

export default messages;

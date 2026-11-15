/**
 * System → LLM page: model profiles, pool/failover sheet, profile editor drawer.
 */

const messages = {
  "Format / model / rate-limit settings shared by all agents. Click a card to edit; the star marks the active profile.":
    "Pengaturan format / model / batas laju yang dibagikan ke semua agen. Klik kartu untuk mengedit; bintang menandai profil aktif.",
  "Model profiles": "Profil model",
  "Retry & backoff": "Percobaan ulang & backoff",
  "Pool settings": "Pengaturan pool",
  On: "Aktif",
  New: "Baru",
  Save: "Simpan",
  "No profiles yet": "Belum ada profil",
  'No model profiles yet — click "New" in the top-right to create the first one.':
    'Belum ada profil model — klik "Baru" di kanan atas untuk membuat yang pertama.',
  Active: "Aktif",
  "Set active": "Jadikan aktif",
  "Delete profile": "Hapus profil",
  Priority: "Prioritas",
  "Priority {n}": "Prioritas {n}",
  "Proxy {proxy}": "Proksi {proxy}",
  Thinking: "Berpikir",
  "Thinking {effort}": "Berpikir {effort}",
  off: "mati",
  "Excluded from pool": "Tidak ikut pool",
  Healthy: "Sehat",
  Tripped: "Terputus",
  "Tripped · {cooldown}": "Terputus · {cooldown}",
  "Degraded · {fails} failures": "Bermasalah · gagal {fails} kali",
  "Key not configured": "Key belum dikonfigurasi",
  "No API key set — calls will fail": "API key belum diisi — pemanggilan akan gagal",
  "LLM pool · failover": "Pool LLM · failover",
  "When enabled, ": "Bila diaktifkan, ",
  "agents with no specified model": "agen tanpa model yang ditentukan",
  " automatically switch to the next profile when the current one is unavailable (insufficient balance / invalid key / rate limited / service error).":
    " beralih otomatis ke profil berikutnya saat profil saat ini tidak tersedia (saldo kurang / key tidak berlaku / dibatasi laju / galat layanan).",
  "Enable pool": "Aktifkan pool",
  "Off by default. When off, only the active profile is used and failures stand.":
    "Nonaktif secara bawaan. Saat nonaktif, hanya profil aktif yang dipakai dan kegagalan tetap kegagalan.",
  "LLM pool toggle": "Sakelar pool LLM",
  "Fall back when a specified profile fails": "Jatuh bila profil yang ditentukan gagal",
  "Off by default: when an agent or task pins a profile, only it is used and failures stand (no silent model swap). When on, a pinned profile that fails also falls back to the pool chain below.":
    "Bawaan nonaktif: saat agen atau tugas menetapkan suatu profil, hanya profil itu yang dipakai dan kegagalan tetap kegagalan (tanpa tukar diam-diam). Bila diaktifkan, profil terikat yang gagal juga jatuh ke rantai pool di bawah.",
  "Fall back on pinned-profile failure toggle": "Sakelar jatuh saat profil terikat gagal",
  "Pool order": "Urutan pool",
  "Reset all": "Pulihkan semua",
  "Only {n} usable profile right now — the pool won't kick in; you need at least 2 profiles with an API key that participate in the pool.":
    "Saat ini hanya {n} profil yang dapat dipakai — pool tidak akan berlaku; minimal perlu 2 profil dengan API key terisi yang ikut pool.",
  "Cooldown {cooldown}": "Pendinginan {cooldown}",
  "{n} consecutive failures": "{n} kegagalan berturut-turut",
  "Reset now": "Pulihkan sekarang",
  "Reset now: clears the trip so the next call retries this profile":
    "Pulihkan sekarang: hapus pemutusan agar panggilan berikutnya mencoba profil ini lagi",
  "The active profile is always first; the rest follow by priority (set per profile). A failed profile cools down (60s → 5min → 30min), is skipped during cooldown, and rejoins automatically once recovered. Profiles whose context window can't fit the current request are skipped too. Agents and tasks with a pinned model don't join the pool by default.":
    "Profil aktif selalu di urutan pertama; sisanya mengikuti prioritas dari tinggi ke rendah (diatur di tiap profil). Profil yang gagal masuk pendinginan (60s → 5min → 30min), dilewati selama pendinginan, lalu otomatis kembali begitu pulih. Profil yang jendela konteksnya tidak muat untuk permintaan saat ini juga dilewati. Agen dan tugas yang menetapkan model secara bawaan tidak ikut pool.",
  "LLM pool enabled": "Pool LLM diaktifkan",
  "LLM pool disabled": "Pool LLM dinonaktifkan",
  "Fallback setting updated": "Pengaturan fallback diperbarui",
  "Failed to update settings: {message}": "Gagal memperbarui pengaturan: {message}",
  "Profile recovered": "Profil dipulihkan",
  "All profiles recovered": "Semua profil dipulihkan",
  "Restore failed: {message}": "Gagal memulihkan: {message}",
  "New model profile": "Profil model baru",
  "Edit: {name}": "Edit: {name}",
  'New profiles aren\'t activated automatically — click "Set active" on the card to enable it.':
    'Profil baru tidak otomatis diaktifkan — klik "Jadikan aktif" pada kartu untuk mengaktifkannya.',
  "Click save after editing; changes to the active profile take effect for all agents immediately.":
    "Klik simpan setelah mengedit; perubahan pada profil aktif langsung berlaku untuk semua agen.",
  Name: "Nama",
  "e.g. OpenAI production": "mis. OpenAI produksi",
  Format: "Format",
  "Select a format": "Pilih format",
  Model: "Model",
  "Load available models from the API": "Muat model yang tersedia dari API",
  "Base URL (optional)": "Base URL (opsional)",
  "Proxy (optional)": "Proksi (opsional)",
  "Only outbound LLM requests use this proxy. Supports http/https/socks5 with optional credentials (e.g. socks5://user:pass@host:port; URL-encode special characters in the password). Leave empty to connect directly.":
    "Hanya permintaan LLM keluar yang memakai proksi ini. Mendukung http/https/socks5 dengan kredensial opsional (mis. socks5://user:pass@host:port; encode URL untuk karakter khusus pada kata sandi). Kosongkan untuk tersambung langsung.",
  "Custom session header (optional)": "Header sesi kustom (opsional)",
  "e.g. x-session-id (leave empty to disable)": "mis. x-session-id (kosongkan untuk menonaktifkan)",
  "Once set, every request carries this HTTP header, auto-filled with the ":
    "Bila nama header diisi, setiap permintaan membawa header HTTP ini, nilainya terisi otomatis dengan ",
  "current session id": "session id percakapan saat ini",
  " (e.g. conv-12 for chats, exp3-worker-i87 for workers). For gateways doing prompt caching / sticky routing by the session-id header: stable across turns within a session, distinct across sessions. Leave empty to disable.":
    " (mis. conv-12 untuk percakapan, exp3-worker-i87 untuk worker). Untuk gateway yang melakukan prompt caching / sticky routing berdasarkan header session-id: stabil antar giliran dalam sesi yang sama, berbeda antar sesi. Kosongkan untuk menonaktifkan.",
  "Set ({hint}), leave empty to keep": "Sudah diatur ({hint}), kosongkan untuk mempertahankan",
  "Rate limit / second": "Batas laju / detik",
  "Rate limit / minute": "Batas laju / menit",
  "Context window (K)": "Jendela konteks (K)",
  "0 = unlimited, shared across all agents. Context window is in K (thousand tokens); 0 = the 200K default, max 1000 (1M); setting it too high prevents compression from triggering.":
    "0 = tanpa batas, dibagikan ke semua agen. Satuan jendela konteks K (ribu token); 0 = bawaan 200K, maksimum 1000 (1M); terlalu tinggi membuat kompresi tidak pernah terpicu.",
  "Pool priority": "Prioritas pool",
  "Higher numbers are tried first; the active profile is always first regardless of this value. Profiles with equal priority take turns leading, spreading usage naturally.":
    "Angka lebih besar dicoba lebih dulu; profil aktif selalu di urutan pertama terlepas dari nilai ini. Profil dengan prioritas sama bergantian memimpin, sehingga kuota terbagi secara alami.",
  "When on, this profile is never a failover target (agents/tasks can still pin it explicitly). Suited for expensive profiles reserved for one agent that you don't want burned by others' failures.":
    "Bila aktif, profil ini tidak pernah menjadi target failover (agen/tugas tetap bisa menetapkannya secara eksplisit). Cocok untuk profil mahal yang khusus untuk satu agen dan tidak ingin terbakar oleh kegagalan agen lain.",
  "Streaming output · streaming": "Keluaran streaming · streaming",
  "On (default) streams via SSE with live progress and token counts while running. Off uses true non-streaming (stream:false, full response in one shot) — working around buggy gateway SSE implementations (empty frames / dropped thinking deltas), at the cost of losing live progress.":
    "Aktif (bawaan) memakai SSE streaming dengan progres langsung dan hitungan token selama berjalan. Nonaktif memakai non-streaming sungguhan (stream:false, respons lengkap sekaligus) — menyiasati implementasi SSE sebagian gateway yang bermasalah (frame kosong / delta thinking terhilang), dengan harga hilangnya progres langsung.",
  "Streaming output": "Keluaran streaming",
  "Output limit · max tokens": "Batas keluaran · max tokens",
  "Max tokens generated per reply, sent with every request. 0 (default) = don't send the field, letting the server decide. This is separate from the context window above: that's the model's total capacity, used only locally for the compression threshold. Too small a value truncates reasoning models during thinking, before a single word of the answer.":
    "Token maksimum per balasan, dikirim bersama setiap permintaan. 0 (bawaan) = jangan kirim field ini, biarkan server yang menentukan. Ini berbeda dari jendela konteks di atas: itu kapasitas total model, hanya dipakai lokal untuk ambang kompresi. Terlalu kecil memotong model penalaran saat fase berpikir, bahkan sebelum satu kata jawaban muncul.",
  "Limit field name": "Nama field batas",
  "Which key carries the limit. max_tokens is the default and nearly every compatible gateway only accepts it; OpenAI's official reasoning models (o-series / GPT-5) instead only accept max_completion_tokens and reject max_tokens with unsupported_parameter.":
    "Field mana yang membawa batasan. max_tokens adalah bawaan dan hampir semua gateway kompatibel hanya menerimanya; model penalaran resmi OpenAI (seri o / GPT-5) justru hanya menerima max_completion_tokens dan menolak max_tokens dengan unsupported_parameter.",
  "Only selectable for the openai format. Anthropic's field is always max_tokens.":
    "Hanya dapat dipilih untuk format openai. Nama field Anthropic selalu max_tokens.",
  "Only selectable for the openai format. The Responses API field is always max_output_tokens.":
    "Hanya dapat dipilih untuk format openai. Nama field Responses API selalu max_output_tokens.",
  "Thinking toggle · thinking.type": "Sakelar berpikir · thinking.type",
  "Controls whether the thinking field is sent. Don't send = omit the field (for models that don't support it, e.g. MiniMax); Off sends disabled; On sends enabled. Independent of the effort level below.":
    "Mengontrol apakah field thinking dikirim. Jangan kirim = tanpa field ini (kompatibel dengan model yang tidak mendukung, mis. MiniMax); Nonaktif mengirim disabled; Aktif mengirim enabled. Independen dari tingkat effort di bawah.",
  "Reasoning effort · reasoning_effort": "Tingkat effort berpikir · reasoning_effort",
  "A standalone effort level (OpenAI reasoning_effort / Anthropic output_config.effort). Some APIs activate reasoning via the effort alone with no thinking field, so it can be set on its own without the toggle above.":
    "Tingkat effort mandiri (OpenAI reasoning_effort / Anthropic output_config.effort). Beberapa API mengaktifkan penalaran hanya lewat effort tanpa field thinking, jadi bisa diatur terpisah tanpa mengirim sakelar berpikir.",
  "Don't send (default)": "Jangan kirim (bawaan)",
  Off: "Nonaktif",
  "When ": "Aktif",
  "max_tokens (default)": "max_tokens (bawaan)",
  "Test connection": "Uji koneksi",
  "Testing…": "Menguji…",
  "Enter a name and a model": "Isi nama dan model",
  'Created: {name} (click "Set active" on the card to enable)':
    'Dibuat: {name} (klik "Jadikan aktif" pada kartu untuk mengaktifkan)',
  "Saved — the active profile takes effect immediately, no restart needed":
    "Tersimpan — profil aktif langsung berlaku, tanpa perlu mulai ulang",
  Saved: "Tersimpan",
  "Save failed: {message}": "Gagal menyimpan: {message}",
  "Loaded {n} models": "{n} model dimuat",
  "Failed to load models: {error}": "Gagal memuat model: {error}",
  "no models returned": "tidak ada model yang dikembalikan",
  "Error loading models: {message}": "Galat saat memuat model: {message}",
  "Connected · {latency}ms · {model}": "Tersambung · {latency}ms · {model}",
  "Reply: {reply}": "Balasan: {reply}",
  "Connection failed: {error}": "Koneksi gagal: {error}",
  unknown: "tidak diketahui",
  "Test error: {message}": "Galat saat menguji: {message}",
  "Activated: {name}": "Diaktifkan: {name}",
  "Failed to activate: {message}": "Gagal mengaktifkan: {message}",
  "Can't delete the currently active profile": "Tidak dapat menghapus profil yang sedang aktif",
  "Deleted: {name}": "Dihapus: {name}",
  "Delete failed: {message}": "Gagal menghapus: {message}",
} satisfies Record<string, string>;

export default messages;

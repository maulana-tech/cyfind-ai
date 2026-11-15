/**
 * System → LLM page → tab "Percobaan ulang & backoff" + field override percobaan per profil.
 * Kunci = string zh-CN di _components/retry.tsx (kunci t() literal dan nilai data
 * modul RETRY_LAYERS berbahasa Zh yang diterjemahkan di lokasi render).
 */

const messages = {
  Triggers: "Pemicu",
  "：": ":",
  "Not this layer": "Tidak lewat lapisan ini",
  "default {n}": "bawaan {n}",
  "Interval ms": "Interval ms",
  "default backoff": "backoff bawaan",
  "fixed {ms}": "tetap {ms}",
  "Leave empty to use the default; {hint}.": "Kosongkan untuk memakai bawaan; {hint}.",
  "Retry overrides": "Override percobaan ulang",
  'Applies only to this profile, overriding the global defaults in "Retry & backoff". Leave a field empty to follow the global value; attempts = -1 turns this layer off; an interval replaces exponential backoff with a fixed one. The breaker and intent rerun are process-wide and can only be changed on the global page.':
    'Berlaku hanya untuk profil ini, menimpa bawaan global di "Percobaan ulang & backoff". Kosongkan sebuah kolom untuk mengikuti nilai global; jumlah = -1 mematikan lapisan ini; interval mengganti backoff eksponensial dengan interval tetap. Pemutus daya dan rerun intent bersifat level proses dan hanya bisa diubah di halaman global.',
  "Failed to load the retry policy: {message}": "Gagal memuat kebijakan percobaan ulang: {message}",
  "Saved — takes effect immediately (the in-flight round of calls still uses the old settings)":
    "Tersimpan — langsung berlaku (gelombang panggilan yang sedang berjalan tetap memakai pengaturan lama)",
  "Save failed: {message}": "Gagal menyimpan: {message}",
  "Loading retry policy…": "Memuat kebijakan percobaan ulang…",
  "A failed model call passes through five retry layers, inner to outer:":
    "Kegagalan satu pemanggilan model melewati lima lapisan percobaan, dari dalam ke luar:",
  " connection → empty response → same-provider safety window → pool breaker → intent rerun":
    " koneksi → respons kosong → jendela aman provider yang sama → pemutus pool → rerun intent",
  ". An outer layer only runs once the inner ones are exhausted, so the attempt counts are ":
    ". Lapisan luar hanya berjalan setelah lapisan dalam habis, jadi jumlah percobaannya bersifat ",
  multiplicative: "pengali",
  " — max out every layer and a single blip can burn dozens of requests. Leave everything empty to keep the current defaults, identical to the behavior without this page. The first three layers can be overridden per model profile.":
    " — maksimalkan tiap lapisan dan satu gangguan kecil bisa membakar puluhan permintaan. Biarkan semua kosong untuk memakai bawaan saat ini, persis seperti perilaku tanpa halaman ini. Tiga lapisan pertama bisa di-override per profil model.",
  Save: "Simpan",
  "Reset all to defaults": "Kembalikan semua ke bawaan",
  "Connection retry": "Percobaan ulang koneksi",
  "SDK · before the 200 arrives": "SDK · sebelum 200 diterima",
  "Can't connect or no 200 yet: connection reset / read-write timeout / DNS failure and other network-level errors, plus HTTP 408, 429, 500, 502, 503, 504.":
    "Tidak bisa tersambung atau belum menerima 200: galat tingkat jaringan seperti koneksi direset / timeout baca-tulis / DNS gagal, serta HTTP 408, 429, 500, 502, 503, 504.",
  "Every other status code (400 / 401 / 403 / 404 / 413 / 422 …) is a deterministic rejection — resending fails the same way, so it's raised immediately.":
    "Semua kode status lain (400 / 401 / 403 / 404 / 413 / 422 …) adalah penolakan deterministik — kirim ulang tetap gagal, langsung diteruskan ke atas.",
  "Resends the same request as-is. Once the stream has started (the 200 already arrived), a mid-stream drop is no longer this layer's business.":
    "Mengirim ulang permintaan yang sama apa adanya. Setelah aliran dimulai (200 sudah diterima), putusnya di tengah bukan lagi urusan lapisan ini.",
  Attempts: "Jumlah percobaan",
  "0.5s→1s→2s exponential (capped at 8s)": "0.5s→1s→2s eksponensial (maks 8s)",
  "-1 = never retry, the failure is raised immediately":
    "-1 = tidak pernah mengulang, kegagalan langsung diteruskan ke atas",
  "Empty-response retry": "Percobaan ulang respons kosong",
  "SDK · openai format only": "SDK · hanya format openai",
  "HTTP 200 with a normal stop finish_reason, but the response has no content block at all — empty gateway frames, dropped thinking deltas and sampling hiccups all look like this.":
    "HTTP 200 dengan finish_reason stop yang normal, tetapi seluruh respons tidak punya blok konten sama sekali — frame gateway kosong, delta thinking terhilang, dan gangguan sampling semuanya tampak seperti ini.",
  "No content because of max_tokens truncation doesn't count (that's fixed by raising the output limit; resending just hits it again).":
    "Tidak dihitung bila kosong karena dipotong max_tokens (itu harus diperbaiki dengan menaikkan batas keluaran; mengirim ulang hanya menabraknya lagi).",
  "Resends the whole prompt, so it's expensive on long contexts — don't set the attempts too high.":
    "Mengirim ulang seluruh prompt, jadi mahal pada konteks panjang — jangan menetapkan jumlah percobaan terlalu besar.",
  "-1 = hand the empty response back as-is": "-1 = serahkan respons kosong apa adanya",
  "Same-provider safety-window retry": "Percobaan ulang jendela aman provider yang sama",
  "This app · before any output is delivered": "Aplikasi ini · sebelum keluaran diserahkan",
  "Something goes wrong after the stream is established (the 200 arrived): the connection drops mid-stream, the provider reports overloaded, or an in-stream 429 / 5xx error event — and not a single token has been delivered to the caller yet.":
    "Ada masalah setelah aliran terbentuk (200 sudah diterima): koneksi terputus di tengah, provider overloaded, atau peristiwa galat 429 / 5xx di dalam aliran — dan belum satu token pun diserahkan ke pemanggil.",
  "Quota exhausted (402 / insufficient_quota, handed to the pool to switch profiles), context too long (413 / context length, handed to compression) and deterministic rejections (400 / 401 / 403 / 404 / 422) are never retried.":
    "Kuota habis (402 / insufficient_quota, diserahkan ke pool untuk berganti profil), konteks terlalu panjang (413 / context length, diserahkan ke kompresi), dan penolakan deterministik (400 / 401 / 403 / 404 / 422) tidak pernah diulang.",
  "Replays the same request on the same profile. Since no output has been delivered yet, the replay can't duplicate model output or tool executions.":
    "Memutar ulang permintaan yang sama pada profil yang sama. Karena belum ada keluaran yang diserahkan, pemutaran ulang tidak menggandakan keluaran model atau eksekusi alat.",
  "0.5s→1s exponential (capped at 4s)": "0.5s→1s eksponensial (maks 4s)",
  "-1 = a dropped stream goes straight to the outer intent-rerun layer":
    "-1 = aliran yang putus langsung diserahkan ke lapisan rerun intent di luar",
  "Pool circuit breaker": "Pemutus daya pool",
  "This app · process-wide, one global copy": "Aplikasi ini · level proses, satu salinan global",
  "Trips when transient failures (429, 5xx, network errors) accumulate to the threshold; deterministic failures — insufficient balance (402), invalid key (401 / 403), missing model (404) — ignore the threshold and trip on the first one.":
    "Memutus saat kegagalan sesaat (429, 5xx, galat jaringan) menumpuk sampai ambang; kegagalan deterministik — saldo kurang (402), key tidak berlaku (401 / 403), model tidak ada (404) — mengabaikan ambang dan langsung memutus pada percobaan pertama.",
  "One success resets the counter, so a flaky profile never accumulates its way into a trip.":
    "Satu keberhasilan langsung mereset hitungannya, jadi profil yang kadang bermasalah tidak pernah menumpuk sampai terputus.",
  "Once tripped, the breaker enters cooldown and the pool skips this profile for its duration. State is persisted, so a restart doesn't lose it.":
    "Setelah terputus, sistem masuk masa pendinginan dan pool melewati profil ini selama masa itu. Status disimpan di basis data, jadi tidak hilang saat restart.",
  "Failures before tripping": "Kegagalan berturut sebelum terputus",
  "1min→5min→30min ladder": "1min→5min→30min bertingkat",
  "-1 = transient failures never trip the breaker (deterministic failures still do)":
    "-1 = kegagalan sesaat tidak pernah memutus (kegagalan deterministik tetap memutus)",
  "Intent rerun": "Rerun intent",
  "Nothing above caught it: the worker ends in model_error — every inner retry was exhausted — or the stream broke after it had started delivering output (replaying is unsafe then, so the whole thing starts over).":
    "Tidak ada lapisan sebelumnya yang menangkapnya: worker berakhir dengan model_error — semua percobaan lapisan dalam habis — atau aliran terputus setelah mulai menyerahkan keluaran (waktu itu pemutaran ulang tidak aman, jadi harus diulang dari awal).",
  "Quota exhaustion is already handled by the pool switching profiles, so no rerun here; the step yields immediately when the task is paused / stopped / wrapping up, without consuming backoff time.":
    "Kuota habis sudah ditangani oleh pool yang berganti profil, jadi tidak ada rerun di sini; langkah langsung mengalah saat tugas dijeda / dihentikan / masuk tahap penutupan, tanpa memakai waktu backoff.",
  "Runs the whole intent again from scratch. It's the outermost layer, so one rerun multiplies the attempt counts of every layer inside it.":
    "Menjalankan seluruh intent lagi dari awal. Ini lapisan terluar, sehingga satu rerun mengalikan jumlah percobaan semua lapisan di dalamnya.",
  "Rerun attempts": "Jumlah rerun",
  "Fixed 3s": "Tetap 3s",
  "-1 = no rerun, the intent is judged blocked right away": "-1 = tanpa rerun, intent langsung dinilai blocked",
} satisfies Record<string, string>;

export default messages;

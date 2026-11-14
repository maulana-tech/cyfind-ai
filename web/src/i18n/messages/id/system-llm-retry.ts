/**
 * System → LLM page → tab "Percobaan ulang & backoff" + field override percobaan per profil.
 * Kunci = string zh-CN di _components/retry.tsx (kunci t() literal dan nilai data
 * modul RETRY_LAYERS berbahasa Zh yang diterjemahkan di lokasi render).
 */

const messages = {
  // ── RetryRuleFields ──
  触发: "Pemicu",

  "：": ":",
  不走这层: "Tidak lewat lapisan ini",

  "默认 {n}": "bawaan {n}",
  "间隔 ms": "Interval ms",
  默认退避: "backoff bawaan",

  "固定 {ms}": "tetap {ms}",
  "留空 = 用默认；{hint}。": "Kosongkan untuk memakai bawaan; {hint}.",

  // ── ProfileRetryFields ──
  重试覆盖: "Override percobaan ulang",

  "只对这个配置生效，覆盖「重试与退避」里的全局默认。每格留空 = 跟随全局；次数填 -1 = 关掉这层重试； 间隔填了就用固定间隔取代指数退避。熔断与意图重跑是进程级的，只能在全局那页调。":
    'Berlaku hanya untuk profil ini, menimpa bawaan global di "Percobaan ulang & backoff". Kosongkan sebuah kolom untuk mengikuti nilai global; jumlah = -1 mematikan lapisan ini; interval mengganti backoff eksponensial dengan interval tetap. Pemutus daya dan rerun intent bersifat level proses dan hanya bisa diubah di halaman global.',

  // ── RetryPolicyPanel ──
  "读取重试策略失败：{message}": "Gagal memuat kebijakan percobaan ulang: {message}",
  "已保存，即时生效（正在跑的这一轮调用仍用旧参数）":
    "Tersimpan — langsung berlaku (gelombang panggilan yang sedang berjalan tetap memakai pengaturan lama)",
  "保存失败：{message}": "Gagal menyimpan: {message}",
  "读取重试策略…": "Memuat kebijakan percobaan ulang…",
  "一次模型调用的失败会依次经过五层重试，由内到外：":
    "Kegagalan satu pemanggilan model melewati lima lapisan percobaan, dari dalam ke luar:",
  " 建连 → 空响应 → 同 provider 安全窗口 → 轮询熔断 → 意图重跑":
    " koneksi → respons kosong → jendela aman provider yang sama → pemutus pool → rerun intent",
  "。内层用尽才轮到外层，所以次数是":
    ". Lapisan luar hanya berjalan setelah lapisan dalam habis, jadi jumlah percobaannya bersifat ",
  相乘: "pengali",

  "的——把每层都拉满，一次抖动能烧掉几十次请求。 全部留空即当前默认值，与没有这页时的行为完全一致。前三层可以在每个模型配置里单独覆盖。":
    " — maksimalkan tiap lapisan dan satu gangguan kecil bisa membakar puluhan permintaan. Biarkan semua kosong untuk memakai bawaan saat ini, persis seperti perilaku tanpa halaman ini. Tiga lapisan pertama bisa di-override per profil model.",
  保存: "Simpan",

  全部恢复默认: "Kembalikan semua ke bawaan",

  // ── RETRY_LAYERS (data modul zh, diterjemahkan di sini) ──
  建连重试: "Percobaan ulang koneksi",

  "SDK · 拿到 200 之前": "SDK · sebelum 200 diterima",
  "连不上或还没拿到 200：连接重置 / 读写超时 / DNS 失败等网络层错误，以及 HTTP 408、429、500、502、503、504。":
    "Tidak bisa tersambung atau belum menerima 200: galat tingkat jaringan seperti koneksi direset / timeout baca-tulis / DNS gagal, serta HTTP 408, 429, 500, 502, 503, 504.",
  "其余状态码（400 / 401 / 403 / 404 / 413 / 422 等）都是确定性拒绝，重发也一样失败，直接上抛。":
    "Semua kode status lain (400 / 401 / 403 / 404 / 413 / 422 …) adalah penolakan deterministik — kirim ulang tetap gagal, langsung diteruskan ke atas.",
  "原样重发同一个请求。流一旦开始（已经拿到 200），中途断开就不归这层管了。":
    "Mengirim ulang permintaan yang sama apa adanya. Setelah aliran dimulai (200 sudah diterima), putusnya di tengah bukan lagi urusan lapisan ini.",
  重试次数: "Jumlah percobaan",

  "0.5s→1s→2s 指数（封顶 8s）": "0.5s→1s→2s eksponensial (maks 8s)",
  "-1 = 一次都不重试，失败立刻上抛": "-1 = tidak pernah mengulang, kegagalan langsung diteruskan ke atas",

  空响应重试: "Percobaan ulang respons kosong",

  "SDK · 仅 openai 格式": "SDK · hanya format openai",
  "HTTP 200、finish_reason 是正常 stop，但整条响应一个内容块都没有——网关空帧、思考字段丢帧、采样打嗝都会长这样。":
    "HTTP 200 dengan finish_reason stop yang normal, tetapi seluruh respons tidak punya blok konten sama sekali — frame gateway kosong, delta thinking terhilang, dan gangguan sampling semuanya tampak seperti ini.",
  "因 max_tokens 截断而没有内容的不算（那要靠调高输出上限解决，重发只会再撞一次）。":
    "Tidak dihitung bila kosong karena dipotong max_tokens (itu harus diperbaiki dengan menaikkan batas keluaran; mengirim ulang hanya menabraknya lagi).",
  "重发整个 prompt，所以在长上下文上比较贵，次数不宜给大。":
    "Mengirim ulang seluruh prompt, jadi mahal pada konteks panjang — jangan menetapkan jumlah percobaan terlalu besar.",
  "-1 = 空响应直接原样交出": "-1 = serahkan respons kosong apa adanya",

  "同 provider 安全窗口重试": "Percobaan ulang jendela aman provider yang sama",
  "本项目 · 未交付输出前": "Aplikasi ini · sebelum keluaran diserahkan",
  "流已经建立（拿到 200）之后才出问题：连接中途断开、供应商 overloaded、流内的 429 / 5xx 错误事件——且一个 token 都还没交给调用方。":
    "Ada masalah setelah aliran terbentuk (200 sudah diterima): koneksi terputus di tengah, provider overloaded, atau peristiwa galat 429 / 5xx di dalam aliran — dan belum satu token pun diserahkan ke pemanggil.",
  "额度耗尽（402 / insufficient_quota，交给轮询换配置）、上下文过长（413 / context length，交给压缩）、400 / 401 / 403 / 404 / 422 确定性拒绝，都不重试。":
    "Kuota habis (402 / insufficient_quota, diserahkan ke pool untuk berganti profil), konteks terlalu panjang (413 / context length, diserahkan ke kompresi), dan penolakan deterministik (400 / 401 / 403 / 404 / 422) tidak pernah diulang.",
  "在同一个配置上重放同一个请求。因为还没交付任何输出，重放不会重复模型输出或工具执行。":
    "Memutar ulang permintaan yang sama pada profil yang sama. Karena belum ada keluaran yang diserahkan, pemutaran ulang tidak menggandakan keluaran model atau eksekusi alat.",
  "0.5s→1s 指数（封顶 4s）": "0.5s→1s eksponensial (maks 4s)",
  "-1 = 断流直接交给外层的意图重跑": "-1 = aliran yang putus langsung diserahkan ke lapisan rerun intent di luar",

  轮询熔断: "Pemutus daya pool",

  "本项目 · 进程级，全局一份": "Aplikasi ini · level proses, satu salinan global",
  "瞬时失败（429、5xx、网络错误）连续累计到阈值时熔断；余额不足（402）、密钥失效（401 / 403）、模型不存在（404）这类确定性失败不看阈值，第一次就熔断。":
    "Memutus saat kegagalan sesaat (429, 5xx, galat jaringan) menumpuk sampai ambang; kegagalan deterministik — saldo kurang (402), key tidak berlaku (401 / 403), model tidak ada (404) — mengabaikan ambang dan langsung memutus pada percobaan pertama.",
  "成功一次即清零，所以偶尔抽风的配置不会被慢慢攒到熔断。":
    "Satu keberhasilan langsung mereset hitungannya, jadi profil yang kadang bermasalah tidak pernah menumpuk sampai terputus.",
  "熔断后进入冷却，冷却期内轮询直接跳过这个配置。状态落库，重启不丢。":
    "Setelah terputus, sistem masuk masa pendinginan dan pool melewati profil ini selama masa itu. Status disimpan di basis data, jadi tidak hilang saat restart.",
  连续失败几次熔断: "Kegagalan berturut sebelum terputus",

  "1min→5min→30min 梯度": "1min→5min→30min bertingkat",
  "-1 = 瞬时失败永不熔断（确定性失败仍然熔断）":
    "-1 = kegagalan sesaat tidak pernah memutus (kegagalan deterministik tetap memutus)",

  意图重跑: "Rerun intent",

  "前面几层都没兜住：worker 以 model_error 收场——内层重试全部用尽，或者流已经开始交付输出后才断掉（那时重放不安全，只能整条重来）。":
    "Tidak ada lapisan sebelumnya yang menangkapnya: worker berakhir dengan model_error — semua percobaan lapisan dalam habis — atau aliran terputus setelah mulai menyerahkan keluaran (waktu itu pemutaran ulang tidak aman, jadi harus diulang dari awal).",
  "额度耗尽已经由轮询换配置处理，不在这里重跑；任务被暂停 / 终止 / 进入收尾时立即让位，不占用退避时间。":
    "Kuota habis sudah ditangani oleh pool yang berganti profil, jadi tidak ada rerun di sini; langkah langsung mengalah saat tugas dijeda / dihentikan / masuk tahap penutupan, tanpa memakai waktu backoff.",
  "整条意图从头再跑一遍。它是最外层，一次重跑意味着里面几层的次数会再乘一遍。":
    "Menjalankan seluruh intent lagi dari awal. Ini lapisan terluar, sehingga satu rerun mengalikan jumlah percobaan semua lapisan di dalamnya.",
  重跑次数: "Jumlah rerun",

  "固定 3s": "Tetap 3s",
  "-1 = 不重跑，该意图直接判为 blocked": "-1 = tanpa rerun, intent langsung dinilai blocked",
} satisfies Record<string, string>;

export default messages;

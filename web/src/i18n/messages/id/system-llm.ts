/**
 * System → LLM page: model profiles, pool/failover sheet, profile editor drawer.
 */

const messages = {
  "全 Agent 共享的格式 / 模型 / 限速配置。点击卡片编辑，星标为当前激活配置。":
    "Pengaturan format / model / batas laju yang dibagikan ke semua agen. Klik kartu untuk mengedit; bintang menandai profil aktif.",
  模型配置: "Profil model",

  重试与退避: "Percobaan ulang & backoff",

  轮询配置: "Pengaturan pool",

  已开启: "Aktif",

  新建: "Baru",

  保存: "Simpan",

  暂无配置: "Belum ada profil",

  "还没有模型配置，点击右上角「新建」创建第一个。":
    'Belum ada profil model — klik "Baru" di kanan atas untuk membuat yang pertama.',
  已激活: "Aktif",

  设为激活: "Jadikan aktif",

  激活中: "Aktif",

  删除配置: "Hapus profil",

  优先级: "Prioritas",

  "优先级 {n}": "Prioritas {n}",
  "代理 {proxy}": "Proksi {proxy}",
  思考: "Berpikir",

  "思考 {effort}": "Berpikir {effort}",
  关: "mati",

  不参与轮询: "Tidak ikut pool",

  正常: "Sehat",

  已熔断: "Terputus",

  "已熔断 · {cooldown}": "Terputus · {cooldown}",
  "异常 · 失败 {fails} 次": "Bermasalah · gagal {fails} kali",
  "未配置 Key": "Key belum dikonfigurasi",
  "未填 API Key，无法调用": "API key belum diisi — pemanggilan akan gagal",

  // ── Pool sheet ──
  "LLM 轮询 · 故障转移": "Pool LLM · failover",
  "开启后，": "Bila diaktifkan, ",
  未指定模型: "agen tanpa model yang ditentukan",

  "的 Agent 在当前配置不可用（余额不足 / Key 失效 / 限流 / 服务异常）时自动切到下一个配置。":
    " beralih otomatis ke profil berikutnya saat profil saat ini tidak tersedia (saldo kurang / key tidak berlaku / dibatasi laju / galat layanan).",
  启用轮询: "Aktifkan pool",

  "默认关闭。关闭时始终只用激活配置，失败即失败。":
    "Nonaktif secara bawaan. Saat nonaktif, hanya profil aktif yang dipakai dan kegagalan tetap kegagalan.",
  "LLM 轮询开关": "Sakelar pool LLM",
  指定模型失败时也兜底: "Jatuh bila profil yang ditentukan gagal",

  "默认关闭：Agent 或任务指定了某个配置就只用它，失败即失败（不会悄悄换成别的模型）。 开启后，指定的配置失败时也会回落到下面的轮询链。":
    "Bawaan nonaktif: saat agen atau tugas menetapkan suatu profil, hanya profil itu yang dipakai dan kegagalan tetap kegagalan (tanpa tukar diam-diam). Bila diaktifkan, profil terikat yang gagal juga jatuh ke rantai pool di bawah.",
  绑定配置失败兜底开关: "Sakelar jatuh saat profil terikat gagal",

  轮询顺序: "Urutan pool",

  全部恢复: "Pulihkan semua",

  "当前只有 {n} 个可用配置，轮询不会生效——至少需要 2 个已填 API Key 且参与轮询的配置。":
    "Saat ini hanya {n} profil yang dapat dipakai — pool tidak akan berlaku; minimal perlu 2 profil dengan API key terisi yang ikut pool.",
  激活: "Aktif",

  "冷却 {cooldown}": "Pendinginan {cooldown}",
  "连续失败 {n} 次": "{n} kegagalan berturut-turut",
  立即恢复: "Pulihkan sekarang",

  "立即恢复：清除熔断，下次调用重试该配置":
    "Pulihkan sekarang: hapus pemutusan agar panggilan berikutnya mencoba profil ini lagi",
  "激活配置恒为第 1 顺位，其余按优先级从高到低（在各配置里设置）。某个配置失败后进入冷却 （60s → 5min → 30min），冷却期内被跳过，恢复后自动切回。上下文窗口装不下当前请求的配置会被跳过。 指定了模型的 Agent 与任务默认不参与轮询。":
    "Profil aktif selalu di urutan pertama; sisanya mengikuti prioritas dari tinggi ke rendah (diatur di tiap profil). Profil yang gagal masuk pendinginan (60s → 5min → 30min), dilewati selama pendinginan, lalu otomatis kembali begitu pulih. Profil yang jendela konteksnya tidak muat untuk permintaan saat ini juga dilewati. Agen dan tugas yang menetapkan model secara bawaan tidak ikut pool.",
  "已开启 LLM 轮询": "Pool LLM diaktifkan",
  "已关闭 LLM 轮询": "Pool LLM dinonaktifkan",
  已更新兜底设置: "Pengaturan fallback diperbarui",

  "设置失败：{message}": "Gagal memperbarui pengaturan: {message}",
  已恢复该配置: "Profil dipulihkan",

  已恢复全部配置: "Semua profil dipulihkan",

  "恢复失败：{message}": "Gagal memulihkan: {message}",

  // ── Profile editor ──
  新建模型配置: "Profil model baru",

  "编辑：{name}": "Edit: {name}",
  "新建后不会自动激活，请在卡片上「设为激活」以启用。":
    'Profil baru tidak otomatis diaktifkan — klik "Jadikan aktif" pada kartu untuk mengaktifkannya.',
  "修改后点击保存；激活配置保存后对全部 Agent 立即生效。":
    "Klik simpan setelah mengedit; perubahan pada profil aktif langsung berlaku untuk semua agen.",
  名称: "Nama",

  "例如：OpenAI 生产": "mis. OpenAI produksi",
  格式: "Format",

  选择格式: "Pilih format",

  模型: "Model",

  "从 API 加载可用模型": "Muat model yang tersedia dari API",
  "Base URL（可选）": "Base URL (opsional)",
  "代理（可选）": "Proksi (opsional)",
  "仅 LLM 出站请求走此代理，支持 http/https/socks5，可带账号密码（如 socks5://user:pass@host:port，密码含特殊字符需 URL 编码）；留空表示不使用代理（直连）。":
    "Hanya permintaan LLM keluar yang memakai proksi ini. Mendukung http/https/socks5 dengan kredensial opsional (mis. socks5://user:pass@host:port; encode URL untuk karakter khusus pada kata sandi). Kosongkan untuk tersambung langsung.",
  "自定义会话头（可选）": "Header sesi kustom (opsional)",
  "如 x-session-id（留空=不发送）": "mis. x-session-id (kosongkan untuk menonaktifkan)",
  "填写头名后，每次请求都会带上这个 HTTP 头，头值自动填为 ":
    "Bila nama header diisi, setiap permintaan membawa header HTTP ini, nilainya terisi otomatis dengan ",
  "当前会话的 session id": "session id percakapan saat ini",
  "（chat 会话如 conv-12、worker 如 exp3-worker-i87）。用于按 session-id 头做提示缓存 / 粘性路由的网关；同一会话多轮稳定、不同会话互不相同。留空则不发送。":
    " (mis. conv-12 untuk percakapan, exp3-worker-i87 untuk worker). Untuk gateway yang melakukan prompt caching / sticky routing berdasarkan header session-id: stabil antar giliran dalam sesi yang sama, berbeda antar sesi. Kosongkan untuk menonaktifkan.",
  "已设置（{hint}），留空保持不变": "Sudah diatur ({hint}), kosongkan untuk mempertahankan",
  每秒限速: "Batas laju / detik",

  每分钟限速: "Batas laju / menit",

  "上下文窗口(K)": "Jendela konteks (K)",
  "限速 0 = 不限，全 Agent 共享。上下文窗口单位 K（千 token），0 = 默认 200K，上限 1000（即 1M）；设太高会导致压缩不触发。":
    "0 = tanpa batas, dibagikan ke semua agen. Satuan jendela konteks K (ribu token); 0 = bawaan 200K, maksimum 1000 (1M); terlalu tinggi membuat kompresi tidak pernah terpicu.",
  轮询优先级: "Prioritas pool",

  "数字越大越先被选中；激活配置恒为第 1 顺位，与本值无关。相同优先级的配置会轮流打头，天然分摊额度。":
    "Angka lebih besar dicoba lebih dulu; profil aktif selalu di urutan pertama terlepas dari nilai ini. Profil dengan prioritas sama bergantian memimpin, sehingga kuota terbagi secara alami.",
  "开启后不会被当作故障转移目标（仍可被 Agent / 任务显式指定使用）。 适合「只给某个 Agent 专用、不希望别人失败时烧掉」的昂贵配置。":
    "Bila aktif, profil ini tidak pernah menjadi target failover (agen/tugas tetap bisa menetapkannya secara eksplisit). Cocok untuk profil mahal yang khusus untuk satu agen dan tidak ingin terbakar oleh kegagalan agen lain.",
  "流式输出 · streaming": "Keluaran streaming · streaming",
  "开启（默认）走流式 SSE，有运行中实时进度与实时 token 计数。 关闭则走真·非流式（stream:false， 一次性返回完整响应）——可绕开部分网关糟糕的 SSE 实现（空帧 / 思考字段丢帧）， 代价是失去运行中的实时进度。":
    "Aktif (bawaan) memakai SSE streaming dengan progres langsung dan hitungan token selama berjalan. Nonaktif memakai non-streaming sungguhan (stream:false, respons lengkap sekaligus) — menyiasati implementasi SSE sebagian gateway yang bermasalah (frame kosong / delta thinking terhilang), dengan harga hilangnya progres langsung.",
  流式输出: "Keluaran streaming",

  "输出上限 · max tokens": "Batas keluaran · max tokens",
  "单次回复最多生成多少 token，随每次请求发出。0（默认）= 不发送该字段，由服务端默认值决定。 这与上面的「上下文窗口」是两回事：那是模型总容量，只在本地用来算压缩阈值。 设太小会让推理模型在思考阶段就被截断，一个字答案都出不来。":
    "Token maksimum per balasan, dikirim bersama setiap permintaan. 0 (bawaan) = jangan kirim field ini, biarkan server yang menentukan. Ini berbeda dari jendela konteks di atas: itu kapasitas total model, hanya dipakai lokal untuk ambang kompresi. Terlalu kecil memotong model penalaran saat fase berpikir, bahkan sebelum satu kata jawaban muncul.",
  上限字段名: "Nama field batas",

  "上限发哪个键。max_tokens 是默认，绝大多数兼容网关只认它；OpenAI 官方推理模型（o 系列 / GPT-5）反过来只认 max_completion_tokens，收到 max_tokens 会直接报 unsupported_parameter。":
    "Field mana yang membawa batasan. max_tokens adalah bawaan dan hampir semua gateway kompatibel hanya menerimanya; model penalaran resmi OpenAI (seri o / GPT-5) justru hanya menerima max_completion_tokens dan menolak max_tokens dengan unsupported_parameter.",
  "仅 openai 格式可选。Anthropic 的字段名固定为 max_tokens。":
    "Hanya dapat dipilih untuk format openai. Nama field Anthropic selalu max_tokens.",
  "仅 openai 格式可选。Responses API 的字段名固定为 max_output_tokens。":
    "Hanya dapat dipilih untuk format openai. Nama field Responses API selalu max_output_tokens.",
  "思考开关 · thinking.type": "Sakelar berpikir · thinking.type",
  "控制是否发送 thinking 字段。不发送=不带该字段（兼容 MiniMax 等不支持 的模型）；关闭=发 disabled；开启=发 enabled。与下面的强度互相独立。":
    "Mengontrol apakah field thinking dikirim. Jangan kirim = tanpa field ini (kompatibel dengan model yang tidak mendukung, mis. MiniMax); Nonaktif mengirim disabled; Aktif mengirim enabled. Independen dari tingkat effort di bawah.",
  "思考强度 · reasoning_effort": "Tingkat effort berpikir · reasoning_effort",
  "独立的强度档位（OpenAI reasoning_effort / Anthropic output_config.effort）。 有些接口没有 thinking 字段、只靠强度即可激活思考，故可单独设置、不发送思考开关。":
    "Tingkat effort mandiri (OpenAI reasoning_effort / Anthropic output_config.effort). Beberapa API mengaktifkan penalaran hanya lewat effort tanpa field thinking, jadi bisa diatur terpisah tanpa mengirim sakelar berpikir.",
  "不发送（默认）": "Jangan kirim (bawaan)",
  "关闭::state": "Nonaktif",
  开启: "Aktif",

  "max_tokens（默认）": "max_tokens (bawaan)",
  测试连接: "Uji koneksi",

  "测试中…": "Menguji…",
  请填写名称与模型: "Isi nama dan model",

  "已新建：{name}（在卡片上「设为激活」以启用）": 'Dibuat: {name} (klik "Jadikan aktif" pada kartu untuk mengaktifkan)',
  "已保存，激活配置即时生效，无需重启": "Tersimpan — profil aktif langsung berlaku, tanpa perlu mulai ulang",
  已保存: "Tersimpan",

  "保存失败：{message}": "Gagal menyimpan: {message}",
  "已加载 {n} 个模型": "{n} model dimuat",
  "加载模型失败：{error}": "Gagal memuat model: {error}",
  未获取到模型: "tidak ada model yang dikembalikan",

  "加载模型出错：{message}": "Galat saat memuat model: {message}",
  "连接成功 · {latency}ms · {model}": "Tersambung · {latency}ms · {model}",
  "回复：{reply}": "Balasan: {reply}",
  "连接失败：{error}": "Koneksi gagal: {error}",
  未知: "tidak diketahui",

  "测试出错：{message}": "Galat saat menguji: {message}",
  "已激活：{name}": "Diaktifkan: {name}",
  "激活失败：{message}": "Gagal mengaktifkan: {message}",
  无法删除当前激活的配置: "Tidak dapat menghapus profil yang sedang aktif",

  "已删除：{name}": "Dihapus: {name}",
  "删除失败：{message}": "Gagal menghapus: {message}",
} satisfies Record<string, string>;

export default messages;

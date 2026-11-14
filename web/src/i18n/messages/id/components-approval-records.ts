/**
 * Halaman approval records (approval-records.tsx): antrean approval intercept,
 * tabel riwayat, panel detail, dan konteks review model.
 */

const messages = {
  // Origin / status / match cell
  "对话 #{id}": "Chat #{id}",
  "任务 {id}": "Tugas {id}",
  "定位审批 #{id} 的来源：{label}": "Lokasi sumber approval #{id}: {label}",
  无法定位对应执行: "Tidak dapat menemukan eksekusi terkait",

  待审批: "Menunggu approval",

  已允许: "Diizinkan",

  已拒绝: "Ditolak",

  已超时: "Waktu habis",

  模型判定: "Keputusan model",

  规则判定: "Keputusan aturan",

  规则未记录或已删除: "Aturan tidak tercatat atau sudah dihapus",

  未记录理由: "Alasan tidak tercatat",

  // CodeBlock
  已复制: "Disalin",

  "复制失败，请手动选择内容复制": "Gagal menyalin; silakan pilih teks dan salin manual",
  "复制{label}": "Salin {label}",
  未记录: "Tidak tercatat",

  "内容已截断，以上为保存的片段。": "Konten dipotong; kutipan tersimpan ditampilkan di atas.",

  // Model review context
  模型审查上下文: "Konteks Review Model",

  "以下为本次实际发送给审查模型的输入快照。背景仅用于理解当前动作，裁决依据为审查策略。":
    "Berikut cuplikan input yang benar-benar dikirim ke model review kali ini. Latar belakang hanya untuk memahami aksi; kebijakan review menjadi dasar keputusan.",
  "此记录使用旧版输入，保留当时实际发送的内容。":
    "Rekaman ini memakai format input lama dan menyimpan apa yang benar-benar dikirim saat itu.",
  当前待审查调用: "Panggilan yang Sedang Direview",

  "背景 · 用户消息": "Latar · Pesan Pengguna",
  "背景 · Worker 意图摘要（旧版）": "Latar · Ringkasan Intent Worker (lama)",
  "取自当前用户消息。": "Diambil dari pesan pengguna saat ini.",
  "这是旧版发送的 Worker 意图摘要；新版 Worker 审查不再发送此内容。":
    "Ini ringkasan intent Worker versi lama; review Worker versi baru tidak lagi mengirimkannya.",
  "本次审查未附带背景消息。": "Review kali ini tidak menyertakan pesan latar belakang.",
  "当前轮输入（旧版）": "Input Putaran Saat Ini (lama)",
  "任务描述（旧版）": "Deskripsi Tugas (lama)",
  "任务目标（旧版）": "Target Tugas (lama)",
  "任务操作约束（旧版）": "Kendala Aksi Tugas (lama)",
  "Worker 意图（旧版）": "Intent Worker (lama)",
  工作目录: "Direktori Kerja",

  "本次审查未发送历史调用或执行结果。": "Review kali ini tidak mengirim riwayat panggilan atau hasil eksekusi.",
  "当时提供给模型的历史调用（旧版）": "Riwayat Panggilan yang Diberikan ke Model Saat Itu (lama)",
  成功: "Berhasil",

  "失败（可能有部分副作用）": "Gagal (mungkin ada efek samping sebagian)",
  历史调用参数: "Argumen Panggilan Historis",

  历史执行结果: "Hasil Eksekusi Historis",

  "本次未提供可配对的历史工具执行记录。": "Tidak ada catatan eksekusi tool historis yang dapat dipasangkan.",
  "历史为有限窗口，部分内容已截断。": "Riwayat berupa jendela terbatas; sebagian konten dipotong.",
  "查看完整模型审查输入 JSON": "Lihat JSON Lengkap Input Review Model",
  模型审查输入: "Input Review Model",

  // Decision actions
  允许: "Izinkan",

  拒绝: "Tolak",

  转人工审批: "Eskalasi ke approval manual",

  // Detail panel
  详情加载失败: "Gagal memuat detail",

  "详情加载失败：{error}": "Gagal memuat detail: {error}",
  " · 工具请求": " · Permintaan Tool",
  查看命令内容: "Lihat Isi Perintah",

  命令内容: "Isi Perintah",

  "执行结果：": "Hasil eksekusi: ",
  "加载中…": "Memuat…",
  审查状态: "Status Review",

  审批裁决: "Keputusan Approval",

  未记录审批理由: "Alasan approval tidak tercatat",

  "最终动作：": "Aksi akhir: ",
  来源: "Sumber",

  申请时间: "Diajukan pada",

  决定时间: "Diputuskan pada",

  规则快照: "Cuplikan Aturan",

  审批模型配置: "Profil Model Approval",

  重试详情: "Coba Lagi Detail",

  "此记录未保存审批详情快照，无法还原当时的上下文、模型初判和执行输出。":
    "Rekaman ini tidak menyimpan cuplikan detail approval; konteks, keputusan model, dan hasil eksekusi saat itu tidak dapat dipulihkan.",
  收起上下文: "Tutup Konteks",

  查看上下文与执行结果: "Lihat Konteks & Hasil Eksekusi",

  "此历史记录仅保存审查输入指纹，未保存输入原文，无法还原当时发给模型的上下文。这不代表审查时没有上下文；新产生的模型裁决会保留输入快照。":
    "Rekaman historis ini hanya menyimpan sidik jari input review, bukan teks aslinya, sehingga konteks yang dikirim ke model tidak dapat dipulihkan. Ini tidak berarti tidak ada konteks saat review; keputusan model baru tetap menyimpan cuplikan input.",
  "此记录没有保存模型审查输入，可能由规则直接裁决、模型调用前发生异常或产生于旧版本。":
    "Rekaman ini tidak menyimpan input review model; bisa jadi diputuskan langsung oleh aturan, terjadi kesalahan sebelum pemanggilan model, atau berasal dari versi lama.",
  查看会话审计片段: "Lihat Kutipan Audit Sesi",

  "查看会话审计片段（未发送模型）": "Lihat Kutipan Audit Sesi (tidak dikirim ke model)",
  "会话当前轮输入（审计片段）": "Input Putaran Saat Ini (kutipan audit)",
  可见会话上下文: "Konteks Sesi yang Terlihat",

  "保存于 {time} 的会话记录片段。模型实际使用的内容以“模型审查输入”为准。":
    'Kutipan rekaman sesi yang disimpan pada {time}. Konten yang benar-benar dipakai model mengacu ke "Input Review Model".',
  "仅保存最近的上下文，部分内容已截断。": "Hanya konteks terbaru yang disimpan; sebagian konten dipotong.",
  " · 异常": " · Galat",
  未记录可关联的上下文: "Konteks yang dapat dikorelasikan tidak tercatat",

  模型初判: "Keputusan Awal Model",

  规则初判: "Keputusan Awal Aturan",

  模型异常回退: "Fallback Model (galat)",

  执行输出: "Output Eksekusi",

  "工具未执行。": "Tool tidak dieksekusi.",
  尚无执行输出: "Belum ada output eksekusi",

  "存在相同参数的并发调用，无法唯一关联工具调用；本记录不展示推测的执行结果。":
    "Ada panggilan konkuren dengan argumen identik sehingga panggilan tool tidak dapat dikorelasikan secara unik; rekaman ini tidak menampilkan hasil eksekusi yang bersifat dugaan.",
  "未记录可唯一关联的工具调用 ID。": "ID panggilan tool yang dapat dikorelasikan secara unik tidak tercatat.",
  "工具调用 ID：": "ID panggilan tool: ",
  "参数摘要 SHA-256：": "Ringkasan argumen SHA-256: ",
  "审查配置指纹 SHA-256：": "Sidik jari konfigurasi review SHA-256: ",
  "模型审查输入 SHA-256：": "Input review model SHA-256: ",
  "结果记录时间：": "Hasil direkam pada: ",

  // Context labels (data map values translated at render)
  用户消息: "Pesan Pengguna",

  "Agent 消息": "Pesan Agent",
  工具请求: "Permintaan Tool",

  工具输出: "Output Tool",

  // Execution status labels (data map values translated at render)
  尚未执行: "Belum dieksekusi",

  未执行: "Tidak dieksekusi",

  "已允许，等待执行结果": "Diizinkan; menunggu hasil eksekusi",
  执行成功: "Eksekusi berhasil",

  执行失败: "Eksekusi gagal",

  执行结果未知: "Hasil eksekusi tidak diketahui",

  未关联执行结果: "Tidak ada hasil eksekusi terkait",

  // Table
  展开详情: "Perluas detail",

  工具: "Tool",

  匹配规则: "Aturan yang Cocok",

  参数: "Argumen",

  状态: "Status",

  "收起审批 #{id}": "Tutup approval #{id}",
  "展开审批 #{id}": "Perluas approval #{id}",
  "审批详情 #{id}": "Detail approval #{id}",

  // Page shell
  加载失败: "Gagal memuat",

  已允许执行: "Eksekusi diizinkan",

  已拒绝执行: "Eksekusi ditolak",

  "规则 #{id}": "Aturan #{id}",
  拦截审批: "Approval Intercept",

  审批记录: "Approval Records",

  "{n} 待审批": "{n} menunggu",
  刷新: "Muat Ulang",

  "展开记录查看工具请求和审批裁决，以及当时的上下文与执行结果。":
    "Perluas rekaman untuk melihat permintaan tool, keputusan approval, serta konteks dan hasil eksekusi saat itu.",
  审批记录筛选: "Filter approval records",

  审批状态: "Status Approval",

  全部状态: "Semua status",

  全部来源: "Semua sumber",

  判定来源: "Sumber Keputusan",

  来源未知: "Sumber tidak diketahui",

  清除筛选: "Hapus Filter",

  "记录加载失败：{error}。请点击刷新重试。": "Gagal memuat rekaman: {error}. Klik Muat Ulang untuk mencoba lagi.",
  "待审批加载失败：{error}。请点击刷新重试。":
    "Gagal memuat antrean approval: {error}. Klik Muat Ulang untuk mencoba lagi.",
  "待处理（{n}）": "Belum diproses ({n})",
  展开后允许或拒绝: "perluas untuk mengizinkan atau menolak",

  待处理审批: "Approval belum diproses",

  筛选结果: "Hasil filter",

  全部记录: "Semua rekaman",

  没有符合筛选条件的审批记录: "Tidak ada approval record yang cocok dengan filter",

  暂无审批记录: "Belum ada approval record",

  "请调整审批状态或判定来源，或清除筛选查看全部记录。":
    "Sesuaikan status approval atau sumber keputusan, atau hapus filter untuk melihat semua rekaman.",
  "规则或模型作出审批决定后，记录将显示在这里。":
    "Rekaman akan muncul di sini setelah aturan atau model membuat keputusan approval.",
  审批记录列表: "Daftar approval records",
} satisfies Record<string, string>;

export default messages;

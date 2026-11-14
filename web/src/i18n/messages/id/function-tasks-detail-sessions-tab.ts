/**
 * Terjemahan tab Sesi di detail tugas (daftar sesi, transkrip, kontrol worker).
 */

const messages = {
  未命名配置: "Profil tanpa nama",

  "主 Agent": "Main Agent",
  "规划 Planner": "Planner",
  系统审计: "Audit Sistem",

  入: "In",

  缓: "Cache",

  出: "Out",

  input: "input",
  cache: "cache",
  output: "output",
  "主 Agent · 会话 #{n}": "Main Agent · Sesi #{n}",
  "规划 Planner · 态势研判": "Planner · Penilaian Situasi",
  "系统事件 · LLM 故障转移": "Peristiwa Sistem · Failover LLM",
  "来源 #{n}": "Sumber #{n}",
  实时: "Live",

  "删除该意图（需填写原因，可选假删除/真删除）": "Hapus intent ini (alasan wajib diisi; pilih soft atau hard delete)",
  "当前资产：{label}": "Aset saat ini: {label}",
  "来源任务 #{n}": "Dari tugas #{n}",
  "上传失败：{message}": "Unggahan gagal: {message}",
  "新建会话失败：{message}": "Gagal membuat sesi baru: {message}",
  请填写删除原因: "Isi alasan penghapusan",

  "Worker #{id} 发消息": "Kirim pesan ke Worker #{id}",
  "Worker #{id} 已暂停": "Worker #{id} dijeda",
  "Worker #{id} 已恢复，等待重新领取": "Worker #{id} dilanjutkan, menunggu untuk diambil ulang",
  "（含 {intents} 意图 / {facts} 事实 / {findings} 漏洞）":
    " ({intents} intent / {facts} fakta / {findings} temuan disertakan)",
  "Worker #{id} 及其独占下游已彻底删除{extra}": "Worker #{id} dan turunan eksklusifnya dihapus permanen{extra}",
  "Worker #{id} 已删除（原因已记录，规划者将据此重新规划）":
    "Worker #{id} dihapus (alasan dicatat; planner akan merencanakan ulang)",
  "Worker 操作失败：{message}": "Aksi Worker gagal: {message}",
  加载失败: "Gagal memuat",

  "加载失败：{error}": "Gagal memuat: {error}",
  "发送失败：{message}": "Gagal mengirim: {message}",
  请稍后重试: "Coba lagi nanti",

  "消息不能超过 {max} 个字符": "Pesan maksimal {max} karakter",
  "消息已发送给 Worker #{id}，已立即继续执行": "Pesan dikirim ke Worker #{id}; eksekusi langsung dilanjutkan",
  会话列表: "Daftar Sesi",

  实时连接正常: "Koneksi live normal",

  "实时连接中断，正在自动重连（历史仍可见）":
    "Koneksi live terputus — menyambung ulang otomatis (riwayat tetap terlihat)",
  重连中: "Menyambung ulang",

  任务总计: "Total tugas",

  "输入 {input} · 输出 {output} · 缓存读取 {cacheRead} · 缓存写入 {cacheWrite}":
    "Input {input} · Output {output} · Baca cache {cacheRead} · Tulis cache {cacheWrite}",
  "新建主 Agent 会话（清空上下文，任务状态保留）": "Sesi Main Agent baru (konteks dikosongkan; status tugas tetap)",
  "新建主 Agent 会话": "Sesi Main Agent baru",
  新建: "Baru",

  "加载更早的 Worker": "Muat Worker lebih awal",
  "暂无运行中的 Worker 会话。": "Tidak ada sesi Worker yang berjalan.",
  "Worker 执行会话": "Sesi Eksekusi Worker",
  "当前配置：{label}": "Profil saat ini: {label}",
  模型不可用: "Model tidak tersedia",

  "没有可用的 LLM 配置": "Tidak ada profil LLM yang tersedia",
  "来源任务 #{id} · 只读历史": "Dari tugas #{id} · riwayat baca-saja",
  向上滚动加载更早历史: "Gulir ke atas untuk memuat riwayat lebih awal",

  "↑ 更早历史": "↑ Riwayat lebih awal",
  "运行时长（首步 → 末步）": "Durasi berjalan (langkah pertama → terakhir)",
  可交互: "Interaktif",

  此意图已被用户删除: "Intent ini dihapus oleh pengguna",

  "（已停止执行，规划者已收到通知；意图与产出保留，可在下方查看历史）":
    " (eksekusi dihentikan, planner sudah diberi tahu; intent dan keluarannya tetap ada — riwayat dapat dilihat di bawah)",
  "删除原因：": "Alasan penghapusan: ",
  "加载更早历史…": "Memuat riwayat lebih awal…",
  "加载活动流…": "Memuat aliran aktivitas…",
  重试: "Coba lagi",

  "还没有对话。在下方给主 Agent 发消息，引导探索方向或介入流程。":
    "Belum ada percakapan. Kirim pesan ke Main Agent di bawah untuk mengarahkan eksplorasi atau campur tangan.",
  "暂无活动记录。": "Belum ada aktivitas.",
  移除: "Hapus",

  "给主 Agent 发消息": "Kirim pesan ke Main Agent",
  "主 Agent 正在运行，可输入 /btw 提问…": "Main Agent sedang berjalan — ketik /btw untuk bertanya…",
  "给主 Agent 发消息，@ 引用漏洞、资产等…": "Kirim pesan ke Main Agent; @ untuk mereferensikan temuan, aset, …",
  上传文件: "Unggah file",

  发送旁路问题: "Kirim pertanyaan sampingan",

  停止当前执行: "Hentikan eksekusi saat ini",

  发送消息: "Kirim pesan",

  "给 Worker #{id} 发消息": "Kirim pesan ke Worker #{id}",
  "给 Worker #{id} 发消息，@ 引用记录，调整执行方向…":
    "Kirim pesan ke Worker #{id}; @ untuk mereferensikan catatan dan mengarahkan eksekusi…",
  "暂停当前 Worker": "Jeda Worker saat ini",
  "不发消息，直接继续执行": "Lanjutkan tanpa mengirim pesan",
  直接继续执行: "Lanjutkan sekarang",

  直接继续: "Lanjutkan",

  "删除 Worker #{id}？": "Hapus Worker #{id}?",
  真删除: "Hard Delete",

  "会物理移除该意图，以及": " akan menghapus intent ini secara permanen beserta node turunan yang ",
  仅由它支撑: "hanya ditopang olehnya",

  "的下游节点（级联到叶子，避免留下孤立数据）；共享节点、目标和任务根事实会保留。":
    " (dihapus berjenjang sampai ke daun agar tidak ada data yatim); node bersama, tujuan, dan fakta akar tugas tetap dipertahankan.",
  "此操作不可恢复。": "Tindakan ini tidak dapat dibatalkan.",
  "规划者会收到删除通知并据此重新规划。": "Planner menerima notifikasi dan akan merencanakan ulang.",
  假删除: "Soft Delete",

  "会把该意图置为「已删除」并记录删除原因，意图节点、执行记录、已登记的事实和漏洞":
    " menandai intent sebagai “Dihapus” dan mencatat alasannya; node intent, catatan eksekusi, serta fakta dan temuan yang terdaftar",
  都会保留: "tetap dipertahankan",

  "。规划者会收到「该意图由用户删除 + 原因」并据此重新规划。":
    ". Planner menerima “intent dihapus oleh pengguna + alasan” dan merencanakan ulang.",
  "保留数据，可追溯": "Data tetap ada, bisa ditelusuri",
  "级联移除，不可恢复": "Penghapusan berjenjang, tidak dapat dibatalkan",
  "删除原因（必填）": "Alasan penghapusan (wajib)",
  "说明为什么删除这条意图，例如：方向判断错误 / 目标已失效 / 与其他意图重复…":
    "Jelaskan alasan penghapusan intent ini, mis. salah arah / tujuan sudah tidak berlaku / duplikat dari intent lain…",
  返回: "Kembali",

  彻底删除: "Hapus permanen",

  确认删除: "Konfirmasi hapus",

  "开启新会话？": "Mulai sesi baru?",
  "当前会话会被归档（可随时切回），主 Agent 将以干净的上下文继续。任务的图谱、资产、目标不受影响。":
    "Sesi saat ini diarsipkan (bisa berpindah kapan saja) dan Main Agent melanjutkan dengan konteks bersih. Graf, aset, dan tujuan tugas tidak terpengaruh.",
  取消: "Batal",

  "开启中…": "Memulai…",
  开启新会话: "Mulai sesi baru",
} satisfies Record<string, string>;

export default messages;

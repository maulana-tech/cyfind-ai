/**
 * Terjemahan halaman perpustakaan Skill (system/skills)
 * (kunci adalah string zh-CN asli).
 */

const messages = {
  从未调用: "Belum pernah dipanggil",

  "暂无 Skill，点击左侧「新建」或「上传压缩包」开始":
    "Belum ada Skill — klik “Skill baru” atau “Unggah ZIP” di kiri untuk memulai",
  "Skill 总数": "Total Skill",
  "{n} 个被调用过": "{n} pernah dipanggil",
  累计调用: "Total panggilan",

  未使用: "Tidak dipakai",

  "从未被任何 agent 加载": "Belum pernah dimuat oleh agent mana pun",

  全部用过: "Semua sudah dipakai",

  未命中调用: "Panggilan tak ditemukan",

  "{n} 个不存在的 skill": "{n} skill yang tidak ada",
  无: "Tidak ada",

  技能库总览: "Ringkasan Perpustakaan Skill",

  "选择左侧的 Skill 查看详情与调用记录，或从这里快速了解整体使用情况。":
    "Pilih Skill di kiri untuk melihat detail dan riwayat panggilan, atau pahami pemakaian secara umum di sini.",
  调用排行: "Peringkat panggilan",

  "还没有任何 Skill 调用记录。": "Belum ada catatan panggilan Skill.",
  "{n} 次": "{n} kali",
  最近调用: "Panggilan terbaru",

  "暂无记录。": "Belum ada catatan.",
  "未使用的 Skill": "Skill yang tidak dipakai",
  "（{n}）": "({n})",
  "所有 Skill 都被调用过。": "Semua Skill sudah dipanggil.",
  "已安装 Skill：{name}（{files} 个文件）": "Skill terpasang: {name} ({files} file)",
  "是否覆盖同名 Skill？": "Timpa Skill dengan nama yang sama?",

  "上传失败：{message}": "Unggahan gagal: {message}",
  读取文件失败: "Gagal membaca file",

  "已创建文件夹：{path}": "Folder dibuat: {path}",
  "已创建文件：{path}": "File dibuat: {path}",
  "创建失败：{message}": "Pembuatan gagal: {message}",
  "已删除：{path}": "Dihapus: {path}",
  "删除失败：{message}": "Penghapusan gagal: {message}",
  "已删除 Skill：{name}": "Skill dihapus: {name}",
  已保存: "Tersimpan",

  "保存失败：{message}": "Gagal menyimpan: {message}",
  "关联「{name}」": "Menautkan “{name}”",
  "取消关联「{name}」": "Melepas tautan “{name}”",
  "操作失败：{message}": "Operasi gagal: {message}",
  "授予「{name}」可见": "Memberi visibilitas ke “{name}”",
  "取消「{name}」可见": "Mencabut visibilitas “{name}”",
  "请填写 name": "Harap isi name",

  "description 为必填项": "description wajib diisi",

  "已创建 Skill": "Skill dibuat",

  新建文件: "File baru",

  新建文件夹: "Folder baru",

  删除文件夹: "Hapus folder",

  删除文件: "Hapus file",

  "删除 Skill": "Hapus Skill",
  "技能库 · agentskills.io 规范 · 按 Agent 授权可见":
    "Perpustakaan Skill · spesifikasi agentskills.io · visibilitas diberikan per Agent",
  "{n} 个未命中调用": "{n} panggilan tak ditemukan",
  "Agent 点名调用、但技能库里不存在的 skill。按被点名次数排序。":
    "Skill yang diminta Agent tetapi tidak ada di perpustakaan. Diurutkan berdasarkan jumlah permintaan.",
  "新建 Skill": "Skill baru",
  "上传包含 SKILL.md 的 .zip 压缩包": "Unggah arsip .zip berisi SKILL.md",
  "上传中…": "Mengunggah…",
  上传压缩包: "Unggah ZIP",

  "被调用 {n} 次 · 最近 {time}": "Dipanggil {n} kali · terakhir {time}",
  "暂无 Skill，点击「新建」开始": "Belum ada Skill — klik “Skill baru” untuk memulai",
  调用统计: "Statistik panggilan",

  总调用次数: "Total panggilan",

  覆盖任务数: "Jumlah tugas tercakup",

  "调用方：": "Dipanggil oleh: ",
  "加载调用明细…": "Memuat detail panggilan…",

  "最近 {n} 次调用": "{n} panggilan terakhir",
  "任务 #{id}": "Tugas #{id}",
  对话会话: "Sesi percakapan",

  "还没有调用记录。": "Belum ada catatan panggilan.",
  "关联 MCP": "MCP tertaut",
  "（加载 Skill 时才披露/解锁其工具）": "(perkakas baru diungkap/dibuka saat Skill dimuat)",
  "暂无 MCP，可在「MCP」页添加。": "Belum ada MCP — tambahkan di halaman “MCP”.",
  "可见性（按 Agent 授权）": "Visibilitas (diberikan per Agent)",
  "（暂无 Agent）": "(belum ada Agent)",
  "保存中…": "Menyimpan…",
  保存: "Simpan",

  "加载中…": "Memuat…",
  "删除 Skill「{name}」？": "Hapus Skill “{name}”?",
  "删除文件夹「{path}」？": "Hapus folder “{path}”?",
  "删除文件「{path}」？": "Hapus file “{path}”?",
  "将删除该 Skill 的全部文件、MCP 关联与可见性配置。此操作不可撤销。":
    "Ini menghapus semua file Skill, tautan MCP, dan pengaturan visibilitasnya. Tindakan ini tidak dapat dibatalkan.",
  "将一并删除该文件夹下的所有文件。此操作不可撤销。":
    "Semua file di folder ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.",
  "此操作不可撤销。": "Tindakan ini tidak dapat dibatalkan.",
  取消: "Batal",

  "删除中…": "Menghapus…",
  删除: "Hapus",

  基本信息: "Dasar",

  可见性: "Visibilitas",

  名称: "Nama",

  "小写字母 / 数字 / 连字符，1–64 字符": "Huruf kecil / angka / tanda hubung, 1–64 karakter",
  描述: "Deskripsi",

  "这个 skill 做什么、何时使用。": "Apa yang dilakukan skill ini dan kapan sebaiknya dipakai.",
  "需要 sqlmap、python3": "butuh sqlmap, python3",
  正文: "Isi",

  "（留空自动生成骨架）": "(kosongkan untuk membuat kerangka otomatis)",
  "## 执行方法\n\n1. 先探测错误\n2. 区分盲注类型\n\n脚本放 scripts/ 目录。":
    "## Metode\n\n1. Deteksi error dulu\n2. Bedakan jenis blind injection\n\nSimpan script di direktori scripts/.",
  "加载 Skill 时才披露并解锁所选 MCP 的工具。": "Perkakas MCP yang dipilih baru diungkap dan dibuka saat Skill dimuat.",
  "选中的 Agent 创建后即可见此 Skill。": "Agent yang dipilih akan melihat Skill ini setelah dibuat.",
  "创建中…": "Membuat…",
  创建: "Buat",
} satisfies Record<string, string>;

export default messages;

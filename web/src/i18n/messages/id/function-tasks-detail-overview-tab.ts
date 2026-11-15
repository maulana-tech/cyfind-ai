/**
 * Terjemahan tab Ikhtisar di detail tugas (tujuan, batasan, cakupan, token, heartbeat).
 */

const messages = {
  "企业 #{id}": "Perusahaan #{id}",
  公司: "Perusahaan",

  根域名: "Domain root",

  子域名: "Subdomain",

  网段: "Rentang jaringan",

  关键词: "Kata kunci",

  自动: "Otomatis",

  手动: "Manual",

  添加失败: "Gagal menambahkan",

  保存失败: "Gagal menyimpan",

  任务描述与目标: "Deskripsi & tujuan tugas",

  描述: "Deskripsi",

  目标: "Tujuan",

  目标管理: "Manajemen tujuan",

  "（最终可核验的目标，共 {n} 条；新增/修改会通知规划者并复活任务）":
    " ({n} tujuan terverifikasi; menambah atau mengubah memberi tahu planner dan menghidupkan kembali tugas)",
  "新增目标，如『拿到管理员账号的越权访问』": "Tambah tujuan, mis. “dapatkan akses escalasi ke akun admin”",
  "漏洞类(可选)": "Kelas kerentanan (opsional)",
  添加: "Tambah",

  "暂无目标，添加后规划者会据此派发探索意图并判定达成。":
    "Belum ada tujuan. Setelah ditambahkan, planner mengirim intent eksplorasi darinya dan menilai pencapaiannya.",
  操作约束: "Batasan operasi",

  "（框定 planner/worker 的探索边界，共 {n} 条；改动下一轮规划生效）":
    " ({n} batasan lingkup eksplorasi planner/worker; perubahan berlaku pada rencana berikutnya)",
  禁止: "Tolak",

  允许: "Izinkan",

  "一条操作约束，如『仅测当前端口，不扫其他端口』":
    "Satu batasan operasi, mis. “hanya uji port ini, jangan pindai port lain”",
  "暂无操作约束。建任务时会自动从描述/目标抽取；也可在此手动增删改，用来框定「允许/禁止做哪些操作」。":
    "Belum ada batasan operasi. Batasan diekstrak dari deskripsi/tujuan saat tugas dibuat; Anda juga bisa menambah, mengubah, dan menghapusnya di sini untuk membatasi apa yang diizinkan atau ditolak.",
  资产测试覆盖度: "Cakupan pengujian aset",

  "（粗估，仅供参考）": " (perkiraan kasar, hanya untuk referensi)",
  "已测 {tested} / 范围内 {denominator}": "{tested} teruji / {denominator} dalam lingkup",
  "LLM Token 用量": "Penggunaan token LLM",
  "（按模型统计，共 {n} 次调用）": " (per model, total {n} panggilan)",
  "（按模型统计）": " (per model)",
  输入: "Input",

  输出: "Output",

  缓存读: "Baca cache",

  缓存命中率: "Rasio cache hit",

  模型: "Model",

  调用: "Panggilan",

  命中率: "Rasio hit",

  "暂无 LLM 用量（任务尚未产生调用，或记录仍在写入）。":
    "Belum ada penggunaan LLM (tugas belum melakukan panggilan, atau catatan masih ditulis).",
  测试范围: "Lingkup pengujian",

  "（覆盖度分母 + 授权边界，共 {n} 条）": " ({n} entri: penyebut cakupan + batas otorisasi)",
  "公司名或 id": "Nama perusahaan atau id",
  "如 10.0.0.1 或 10.0.0.0/24": "mis. 10.0.0.1 atau 10.0.0.0/24",
  "如 京ICP备12345678号-1": "mis. 京ICP备12345678号-1",
  "如 企业名称关键词": "mis. kata kunci nama perusahaan",
  "如 example.com": "mis. example.com",
  继承: "Warisi",

  "暂无测试范围，添加后可作为资产覆盖度的分母。":
    "Belum ada lingkup pengujian. Entri di sini menjadi penyebut cakupan aset.",
  心跳: "Heartbeat",

  引擎态: "Status engine",

  "运行中 Worker": "Worker berjalan",
  最近活动: "Aktivitas terakhir",

  "目标 {met}/{total}": "Tujuan {met}/{total}",
  完成时间: "Waktu selesai",

  进行中意图: "Intent berjalan",

  暂无进行中意图: "Tidak ada intent berjalan",

  需要关注: "Perlu perhatian",

  确认漏洞: "Temuan terkonfirmasi",

  "frontier 待领": "Frontier belum diambil",
  被拦意图: "Intent terblokir",

  最近发现: "Temuan terbaru",

  暂无发现: "Belum ada temuan",

  "被拦/出错意图": "Intent terblokir/gagal",
  "（共 {n} 条，可重跑）": " (total {n}; bisa dijalankan ulang)",
  全部重跑: "Jalankan ulang semua",

  重跑: "Jalankan ulang",

  "仅显示前 20 条，点「全部重跑」处理剩余 {n} 条。":
    "Hanya 20 pertama yang ditampilkan; klik “Jalankan ulang semua” untuk menangani sisa {n}.",
  待领意图: "Intent belum diambil",

  "frontier 开放": "frontier terbuka",
  确认发现: "Temuan terkonfirmasi",

  本任务: "tugas ini",

  意图总数: "Total intent",

  本任务全部意图: "semua intent pada tugas ini",

  "域名(全等)": "Domain (persis)",
  "IP(全等)": "IP (persis)",
  "URL(全等)": "URL (persis)",
  "域名(模糊)": "Domain (kabur)",
  "IP(模糊)": "IP (kabur)",
  "URL(模糊)": "URL (kabur)",
  "CIDR 网段": "Rentang CIDR",
  "任务级资产拦截 / 允许": "Blokir / izin aset tingkat tugas",
  "（仅本任务生效，不进全局；先拦截后允许，共 {n} 条）":
    " ({n} aturan; hanya untuk tugas ini, bukan global — blokir diperiksa sebelum izin)",
  "备注(可选)": "Catatan (opsional)",
  "暂无任务级规则。「拦截」命中即禁止测试；「允许」为白名单——配置后本任务只允许命中允许规则的资产（未配置则不启用白名单）。":
    "Belum ada aturan tingkat tugas. Kecocokan “Blokir” melarang pengujian; “Izinkan” adalah whitelist — setelah dikonfigurasi, hanya aset yang cocok dengan aturan izin yang boleh diuji (tidak ada whitelist aktif sebelum itu).",
  // Overview exploration-graph preview
  探索图谱: "Grafik eksplorasi",
  "（{n} 个节点 · {e} 条关系；完整交互视图见「探索」标签页）":
    "({n} node · {e} relasi — buka tab Explore untuk tampilan interaktif penuh)",
  "等待探索开始……": "Menunggu eksplorasi dimulai…",
} satisfies Record<string, string>;

export default messages;

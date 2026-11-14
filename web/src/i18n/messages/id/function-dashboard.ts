/**
 * Dashboard overview page translations (keys are the original zh-CN strings).
 */

const messages = {
  总览: "Ringkasan",

  "系统全局状态 · 实时刷新": "Status sistem global · pembaruan langsung",
  活跃任务: "Tugas aktif",

  "探索 {n}": "Menjelajah {n}",
  "暂停 {n}": "Dijeda {n}",
  "完成 {n}": "Selesai {n}",
  暂无任务: "Belum ada tugas",

  确认发现: "Temuan terkonfirmasi",

  "严重 {n}": "Kritis {n}",
  "高危 {n}": "Tinggi {n}",
  "中危 {n}": "Sedang {n}",
  "低危 {n}": "Rendah {n}",
  资产节点: "Node aset",

  跨任务共享: "Dibagikan antar tugas",

  流量交互: "Pertukaran traffic",

  录制中: "Merekam",

  捕获未开启: "Penangkapan tidak aktif",

  "Token 用量": "Penggunaan Token",
  "入 {in}（含缓存 {cache}）· 出 {out}": "Masuk {in} (termasuk cache {cache}) · Keluar {out}",
  "LLM Token 消耗": "Konsumsi Token LLM",
  旧版: "Lama",

  新版: "Baru",

  "新版：来自 llm_usage 计量账本，逐次调用精确、含中断消耗；仅覆盖启用后的数据":
    "Baru: dari ledger llm_usage — akurat per panggilan, termasuk run terganggu; hanya mencakup data setelah diaktifkan",
  "旧版：来自 activity 统计（含历史任务），中断消耗不计、无法精确到模型":
    "Lama: dari statistik activity (termasuk tugas historis); run terganggu tidak dihitung dan tidak bisa dirinci per model",
  全部: "Semua",

  默认: "Bawaan",

  "合计 (输入+输出)": "Total (input+output)",
  "{n} 个任务": "{n} tugas",
  "输入(未命中)": "Input (cache miss)",
  缓存命中: "Cache hit",

  输入: "Input",

  输出: "Output",

  缓存读: "Baca cache",

  缓存命中率: "Rasio cache hit",

  "7天": "7 hari",
  "30天": "30 hari",
  "3月": "3 bulan",
  "6月": "6 bulan",
  一年: "1 tahun",

  暂无数据: "Belum ada data",

  活动流: "Feed aktivitas",

  "{n} 条事件": "{n} event",
  查看任务: "Lihat tugas",

  暂无活动记录: "Belum ada aktivitas",

  发现: "Temuan",

  暂无发现: "Belum ada temuan",

  任务: "Tugas",

  状态: "Status",

  引擎: "Engine",

  目标进度: "Progres tujuan",

  在途: "In flight",

  最近活动: "Aktivitas terakhir",

  按类型: "Per jenis",

  资产分布: "Distribusi aset",

  暂无资产数据: "Belum ada data aset",

  根域名: "Root domain",

  子域名: "Subdomain",

  应用: "Aplikasi",

  服务: "Layanan",

  端点: "Endpoint",

  "共 {n} 节点": "{n} total node",
  "{n} 次请求": "{n} permintaan",
  流量状态码: "Kode status traffic",

  暂无流量数据: "Belum ada data traffic",

  最近请求: "Permintaan terakhir",

  系统状态: "Status sistem",

  "LLM 配置": "Konfigurasi LLM",
  已配置: "Terkonfigurasi",

  未配置: "Belum dikonfigurasi",

  流量捕获: "Traffic capture",

  开启: "Aktif",

  "关闭::state": "Nonaktif",
  激活模型: "Model aktif",

  "待审批 ({n})": "Menunggu persetujuan ({n})",
  "还有 {n} 条…": "{n} lagi…",
  无待审批拦截: "Tidak ada intercept menunggu persetujuan",

  "{s}s 前": "{s} dtk lalu",
  "{m}m 前": "{m} mnt lalu",
  "{h}h 前": "{h} jam lalu",
  "{d}d 前": "{d} hari lalu",
} satisfies Record<string, string>;

export default messages;

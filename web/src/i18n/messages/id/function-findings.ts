/**
 * Terjemahan halaman daftar temuan (kunci adalah string zh-CN asli).
 */

const messages = {
  // header & views
  发现: "Temuan",
  跨任务漏洞汇总: "Kumpulan temuan lintas tugas",
  全部发现: "Semua temuan",
  按任务分组: "Per tugas",
  按资产: "Per aset",
  发现总数: "Total temuan",
  // filters
  检索漏洞内容: "Cari isi temuan",
  "按{label}等级筛选": "Filter menurut {label}",
  状态: "Status",
  全部状态: "Semua status",
  全部: "Semua",
  漏洞类型: "Jenis kerentanan",
  全部类型: "Semua jenis",
  任务: "Tugas",
  全部任务: "Semua tugas",
  "未关联 / 任务已删除": "Tidak terkait / tugas dihapus",
  "任务 #{id}（已删除）": "Tugas #{id} (dihapus)",
  "任务 #{id}": "Tugas #{id}",
  "{name}（任务 #{id}）": "{name} (Tugas #{id})",
  按严重度: "Berdasarkan severity",
  按时间: "Berdasarkan waktu",
  "已选 {n} 条": "{n} dipilih",
  导出: "Ekspor",
  // selection / counts
  选择当前页全部: "Pilih semua di halaman ini",
  选择本组当前页全部: "Pilih semua di halaman ini untuk grup",
  全部资产: "Semua aset",
  "共 {n} 条": "{n} entri",
  "没有匹配的发现。": "Tidak ada temuan yang cocok.",
  来源任务不可用: "Tugas sumber tidak tersedia",
  "查看任务 #{id}": "Lihat tugas #{id}",
  // toasts
  "加载复测状态失败：{message}": "Gagal memuat status uji ulang: {message}",
  已开始下载导出文件: "Unduhan ekspor telah dimulai",
  "导出失败：{message}": "Ekspor gagal: {message}",
  "资产树加载失败：{message}": "Gagal memuat pohon aset: {message}",
  "已标记为「{label}」": "Ditandai sebagai “{label}”",
  "更新失败：{message}": "Pembaruan gagal: {message}",
  已保存: "Tersimpan",
  "保存失败：{message}": "Gagal menyimpan: {message}",
  已删除漏洞: "Temuan dihapus",
  "删除失败：{message}": "Penghapusan gagal: {message}",
  "深入意图 #{id} 已进入任务队列": "Intent pendalaman #{id} masuk antrean",
  "已创建高优先级 Worker 意图 #{id}": "Intent Worker prioritas tinggi #{id} dibuat",
  "提交失败：{message}": "Pengiriman gagal: {message}",
  // deepen dialog
  深入利用漏洞: "Pendalaman eksploitasi",
  "将在原任务 #{id} 中创建优先级 10 的 Worker 意图，基于当前漏洞开展二次验证：":
    "Worker intent prioritas 10 akan dibuat pada tugas asli #{id} untuk verifikasi ulang temuan saat ini: ",
  利用描述: "Deskripsi eksploitasi",
  "描述需要验证的利用路径、边界条件、目标或期望证据":
    "Jelaskan jalur eksploitasi, kondisi batas, target, atau bukti yang diharapkan untuk diverifikasi",
  "新意图会继承该漏洞的资产锚点。": "Intent baru mewarisi jangkar aset temuan ini.",
  取消: "Batal",
  创建深入意图: "Buat intent pendalaman",
  // export dialog
  导出发现: "Ekspor temuan",
  "选择导出范围与格式,生成后浏览器会自动下载。":
    "Pilih cakupan dan format ekspor; browser mengunduh file saat sudah siap.",
  导出范围: "Cakupan ekspor",
  "导出当前筛选结果（共 {n} 条）": "Ekspor hasil filter saat ini ({n} entri)",
  导出全部: "Ekspor semua",
  "导出勾选的 {n} 条": "Ekspor {n} yang dicentang",
  导出格式: "Format ekspor",
  "Markdown 汇总报告（单个 .md 文件）": "Laporan ringkasan Markdown (satu file .md)",
  "Markdown 分文件（一漏洞一 .md,打包 .zip）": "Markdown per temuan (satu .md tiap temuan, dikemas .zip)",
  "CSV 表格（.csv）": "Tabel CSV (.csv)",
  "JSON（.json）": "JSON (.json)",
  "导出中…": "Mengekspor…",

  // asset tree (function/findings/_components/asset-tree)
  "当前筛选下没有关联到资产的发现。": "Tidak ada temuan yang terkait aset pada filter saat ini.",
  "没有匹配的资产。": "Tidak ada aset yang cocok.",
  过滤资产: "Filter aset",
  刷新资产树: "Segarkan pohon aset",
  "资产过多，已隐藏": "Terlalu banyak aset, disembunyikan",
  "层级（计数仍已计入上层）。用筛选或过滤框收窄可看到完整层级。":
    "level (jumlah tetap dihitung ke level atas). Persempit dengan filter atau kotak filter untuk melihat hierarki lengkap.",
  折叠: "Ciutkan",
  展开: "Perluas",
  "共 {n} 条发现": "{n} temuan",
} satisfies Record<string, string>;

export default messages;

/**
 * Terjemahan halaman sinkronisasi aset (kunci adalah string zh-CN asli).
 */

const messages = {
  资产同步: "Sinkronisasi Aset",

  从外部数据源同步资产入库: "Sinkronkan aset dari sumber data eksternal ke basis data",

  "读取数据源状态失败：{message}": "Gagal membaca status sumber data: {message}",
  "数据源就绪后即可选择项目 / 任务进行同步。": "Setelah sumber data siap, pilih proyek / tugas untuk disinkronkan.",
  "已创建 ScopeSentry 数据源，请填写地址与密钥": "Sumber data ScopeSentry dibuat; isi URL dan API key",
  "创建失败：{message}": "Pembuatan gagal: {message}",
  "请填写 MCP 地址": "Isi URL MCP",
  已保存并启用数据源: "Sumber data disimpan dan diaktifkan",

  "已保存（尚未满足启用条件）": "Disimpan (syarat pengaktifan belum terpenuhi)",
  "保存失败：{message}": "Gagal menyimpan: {message}",
  数据源状态: "Status Sumber Data",

  刷新: "Muat ulang",

  "尚未创建 ScopeSentry 数据源。创建后会新增一个占位 MCP（地址/密钥为空、未启用）。":
    "Sumber data ScopeSentry belum dibuat. Pembuatan akan menambahkan entri MCP placeholder (URL/kunci kosong, nonaktif).",
  创建数据源: "Buat Sumber Data",

  "数据源已创建但未配置，请填写 MCP 地址与 API Key 后启用。":
    "Sumber data sudah dibuat tetapi belum dikonfigurasi. Isi URL MCP dan API Key, lalu aktifkan.",
  "数据源已配置但未启用，保存后将自动启用。":
    "Sumber data sudah dikonfigurasi tetapi belum aktif; menyimpan akan mengaktifkannya otomatis.",
  "MCP 地址": "URL MCP",
  "http://<主机>:8082/mcp": "http://<host>:8082/mcp",
  "API Key（X-API-Key，留空保留原值）": "API Key (X-API-Key; kosongkan untuk mempertahankan nilai saat ini)",
  保存并启用: "Simpan & Aktifkan",

  "已发现 {n} 个工具": "{n} tool ditemukan",
  "检测中…": "Memeriksa…",
  未创建: "Belum Dibuat",

  未配置: "Belum Dikonfigurasi",

  未启用: "Belum Aktif",

  已连接: "Terhubung",

  不可达: "Tidak Terjangkau",

  "加载列表失败：{message}": "Gagal memuat daftar: {message}",
  "请至少选择一个{target}": "Pilih setidaknya satu {target}",
  项目: "Proyek",

  任务: "Tugas",

  请至少选择一种资产类型: "Pilih setidaknya satu jenis aset",

  "同步完成，共入库 {n} 条资产": "Sinkronisasi selesai; {n} aset diimpor",
  "同步失败：{message}": "Sinkronisasi gagal: {message}",
  "加载中…": "Memuat…",
  无数据: "Tidak ada data",

  选择数据同步: "Pilih Data untuk Disinkronkan",

  项目维度: "Per Proyek",

  任务维度: "Per Tugas",

  "同步资产：": "Sinkronkan aset:",
  子域名: "Subdomain",

  服务: "Layanan",

  按项目建立企业并写入资产范围: "Buat perusahaan per proyek dan tulis cakupan asetnya",

  搜索项目名: "Cari nama proyek",

  搜索任务名: "Cari nama tugas",

  "已选 {n}": "{n} dipilih",
  同步选中: "Sinkronkan Terpilih",

  项目名: "Nama Proyek",

  任务名: "Nama Tugas",

  标签: "Tag",

  资产数: "Jumlah Aset",

  状态: "Status",

  时间: "Waktu",

  上一页: "Sebelumnya",

  "第 {n} 页": "Halaman {n}",
  下一页: "Berikutnya",

  "新建/更新企业：": "Perusahaan baru/diperbarui: ",
  "…共 {n} 条错误": "…{n} error lainnya",
} satisfies Record<string, string>;

export default messages;

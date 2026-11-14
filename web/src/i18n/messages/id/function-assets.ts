/**
 * Terjemahan halaman inventaris aset (kunci adalah string zh-CN asli).
 */

const messages = {
  "删除失败：{message}": "Penghapusan gagal: {message}",
  "已删除 {n} 条资产": "{n} aset dihapus",
  "已删除企业，同时删除 {n} 条资产": "Perusahaan dihapus, beserta {n} aset",
  已删除企业: "Perusahaan dihapus",

  资产: "Aset",

  "共 {n} 项资产": "Total {n} aset",
  "删除已选 ({n})": "Hapus terpilih ({n})",
  刷新: "Muat ulang",

  企业: "Perusahaan",

  根域名: "Domain Utama",

  子域名: "Subdomain",

  应用: "Aplikasi",

  服务: "Layanan",

  接口: "Endpoint",

  资产数: "Jumlah Aset",

  资产范围: "Cakupan Aset",

  操作: "Aksi",

  未设置范围: "Cakupan belum diatur",

  "删除企业 {name}": "Hapus perusahaan {name}",
  "还没有企业。点击右上角「新增企业」并填写资产范围，系统会自动认领命中的资产。":
    "Belum ada perusahaan. Klik \u201cPerusahaan Baru\u201d di pojok kanan atas dan isi cakupan aset; aset yang cocok akan otomatis diambil alih.",
  域名: "Domain",

  "ICP 备案": "Catatan ICP",
  归属企业: "Perusahaan Pemilik",

  未归属: "Tidak berafiliasi",

  C段: "Segmen C",

  绑定域名: "Domain Terikat",

  开放端口: "Port Terbuka",

  解析类型: "Jenis Rekaman",

  解析值: "Nilai Rekaman",

  应用名: "Nama Aplikasi",

  分类: "Kategori",

  端口: "Port",

  状态码: "Kode Status",

  标题: "Judul",

  指纹: "Fingerprint",

  认证: "Autentikasi",

  方法: "Metode",

  完整地址: "URL Lengkap",

  参数: "Parameter",

  "删除资产 {name}": "Hapus aset {name}",
  确认删除: "Konfirmasi Hapus",

  "将永久删除 {n} 条资产记录，此操作不可撤销。":
    "Ini akan menghapus permanen {n} catatan aset. Tindakan ini tidak dapat dibatalkan.",
  取消: "Batal",

  "删除中…": "Menghapus…",
  "删除企业 · {name}": "Hapus Perusahaan · {name}",
  "此操作将永久删除该企业及其资产范围配置，不可撤销。":
    "Ini akan menghapus permanen perusahaan beserta konfigurasi cakupan asetnya. Tindakan ini tidak dapat dibatalkan.",
  同时删除该企业下的所有资产: "Hapus juga semua aset di perusahaan ini",

  "不勾选则保留资产，仅取消归属关系":
    "Jangan dicentang untuk mempertahankan aset dan hanya melepas hubungan kepemilikan",
  "暂无数据。": "Belum ada data.",
  "加载中…": "Memuat…",
  "{n} / 页": "{n} / halaman",
  请填写企业名称: "Isi nama perusahaan",

  请修正无效的资产范围: "Perbaiki baris cakupan aset yang tidak valid",

  "已创建企业，添加 {added} 条范围；{invalid} 行无效":
    "Perusahaan dibuat, {added} aturan cakupan ditambahkan; {invalid} baris tidak valid",
  "已创建企业，添加 {added} 条范围": "Perusahaan dibuat, {added} aturan cakupan ditambahkan",
  "企业已存在，请换个名称": "Perusahaan sudah ada; gunakan nama lain",
  "保存失败：{message}": "Gagal menyimpan: {message}",
  新增企业: "Perusahaan Baru",

  "配置企业及其资产范围。关键词只作为 Agent 提示，不会自动归属资产。":
    "Atur perusahaan dan cakupan asetnya. Kata kunci hanya menjadi petunjuk bagi Agent; aset tidak diambil secara otomatis.",
  企业名称: "Nama Perusahaan",

  "如 Acme Corp（名称唯一）": "mis. Acme Corp (nama harus unik)",
  "保存中…": "Menyimpan…",
  保存: "Simpan",

  "编辑资产范围 · {name}": "Edit Cakupan Aset · {name}",
  "编辑后将替换全部现有范围。ICP 精确匹配资产，企业关键词仅作为 Agent 提示。":
    "Hasil edit menggantikan seluruh cakupan yang ada. Entri ICP cocok persis dengan aset; kata kunci perusahaan hanya menjadi petunjuk bagi Agent.",
  "归属依据（可选）": "Dasar Atribusi (opsional)",
  "如 证书 / whois / ASN 佐证": "mis. bukti sertifikat / whois / ASN",
  "已保存；{n} 行无效": "Disimpan; {n} baris tidak valid",
  "范围已更新，共 {n} 条": "Cakupan diperbarui, total {n} aturan",
  编辑: "Edit",

  覆盖保存: "Timpa & Simpan",

  请填写要追加的范围: "Isi cakupan yang akan ditambahkan",

  "已追加 {n} 条范围": "{n} aturan cakupan ditambahkan",
  "追加资产范围 · {name}": "Tambah Cakupan Aset · {name}",
  "新范围会追加到现有范围。ICP 精确匹配资产，企业关键词仅作为 Agent 提示。":
    "Cakupan baru akan ditambahkan ke cakupan yang ada. Entri ICP cocok persis dengan aset; kata kunci perusahaan hanya menjadi petunjuk bagi Agent.",
  追加: "Tambah",
} satisfies Record<string, string>;

export default messages;

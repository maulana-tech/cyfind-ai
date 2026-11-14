/**
 * System → Asset Intercept (intercept aset), kunci sumber = string zh-CN asli.
 */

const messages = {
  "域名（全等）": "Domain (persis)",
  "IP（全等）": "IP (persis)",
  "URL（全等）": "URL (persis)",
  "域名（模糊）": "Domain (fuzzy)",
  "IP（模糊）": "IP (fuzzy)",
  "URL（模糊）": "URL (fuzzy)",
  "CIDR 网段": "Rentang CIDR",
  全等匹配: "Kecocokan persis",

  模糊匹配: "Kecocokan fuzzy",

  网段: "Rentang",

  匹配内容不能为空: "Isi pencocokan wajib diisi",

  "CIDR 格式无效，形如 192.168.0.0/16": "Format CIDR tidak valid; seharusnya seperti 192.168.0.0/16",
  加载资产拦截规则失败: "Gagal memuat aturan intercept aset",

  规则已更新: "Aturan diperbarui",

  规则已创建: "Aturan dibuat",

  规则已删除: "Aturan dihapus",

  "确定删除资产拦截规则「{pattern}」？": "Hapus aturan intercept aset “{pattern}”?",
  资产拦截: "Intercept Aset",

  "全局资产黑名单：命中的域名 / IP / URL / 网段将被拦截，不对其执行任何操作":
    "Daftar blokir aset global: domain / IP / URL / rentang yang cocok akan diblokir dan tidak ada tindakan apa pun yang dijalankan terhadapnya",
  "支持全等与模糊匹配的域名 / IP / URL，以及 CIDR 网段；默认内置模糊拦截政府（.gov / .gov.cn）与教育（.edu / .edu.cn）网站":
    "Mendukung kecocokan persis dan fuzzy untuk domain / IP / URL, serta rentang CIDR; pemblokiran fuzzy bawaan untuk situs pemerintah (.gov / .gov.cn) dan pendidikan (.edu / .edu.cn) aktif secara bawaan",
  新建规则: "Aturan baru",

  "加载中…": "Memuat…",
  暂无资产拦截规则: "Belum ada aturan intercept aset",

  新建第一条规则: "Buat aturan pertama",

  类型: "Jenis",

  匹配内容: "Isi pencocokan",

  备注: "Catatan",

  启用: "Aktif",

  内置: "Bawaan",

  "[内置] 政府网站 (.gov)": "[Bawaan] Situs pemerintah (.gov)",
  "[内置] 政府网站 (.gov.cn)": "[Bawaan] Situs pemerintah (.gov.cn)",
  "[内置] 教育网站 (.edu)": "[Bawaan] Situs pendidikan (.edu)",
  "[内置] 教育网站 (.edu.cn)": "[Bawaan] Situs pendidikan (.edu.cn)",
  编辑资产拦截规则: "Edit aturan intercept aset",

  新建资产拦截规则: "Aturan intercept aset baru",

  命中此规则的目标资产会被全局拦截: "Aset target yang cocok dengan aturan ini diblokir secara global",

  匹配类型: "Jenis pencocokan",

  "CIDR 网段，形如 192.168.0.0/16": "Rentang CIDR, mis. 192.168.0.0/16",
  "模糊匹配：目标包含此内容即命中": "Kecocokan fuzzy: cocok jika target mengandung isi ini",
  "全等匹配：目标需与此内容完全一致": "Kecocokan persis: target harus sama persis dengan isi ini",
  "备注（可选）": "Catatan (opsional)",
  说明这条规则的用途: "Jelaskan kegunaan aturan ini",

  启用此规则: "Aktifkan aturan ini",

  取消: "Batal",

  "保存中…": "Menyimpan…",
  保存: "Simpan",
} satisfies Record<string, string>;

export default messages;

/**
 * kosakata UI bersama (tombol, status, label umum) yang dipakai di banyak halaman.
 * Tambahkan entri di sini hanya untuk string lintas area; string khusus halaman
 * masuk ke file namespace halaman tersebut.
 */

const common = {
  保存: "Simpan",

  取消: "Batal",

  确认: "Konfirmasi",

  删除: "Hapus",

  编辑: "Edit",

  搜索: "Cari",

  重试: "Coba lagi",

  关闭: "Tutup",

  加载中: "Memuat…",

  版本: "Versi",

  切换语言: "Ganti bahasa",

  确定: "OK",

  是: "Ya",

  否: "Tidak",

  全部: "Semua",

  状态: "Status",

  名称: "Nama",

  类型: "Jenis",

  操作: "Aksi",

  时间: "Waktu",

  详情: "Detail",
} satisfies Record<string, string>;

export default common;

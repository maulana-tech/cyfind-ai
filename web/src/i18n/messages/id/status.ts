/**
 * Terjemahan label status/severity (kunci = label zh-CN dari lib/status.ts).
 * Situs render membungkusnya dengan t() saat render — file datanya tetap zh.
 */

const status = {
  // intent
  待领: "Belum Diambil",

  执行中: "Dieksekusi",

  已暂停: "Dijeda",

  已完成: "Selesai",

  执行出错: "Galat Eksekusi",

  预算耗尽: "Anggaran Habis",

  已停止: "Dihentikan",

  已删除: "Dihapus",

  // task
  已创建: "Dibuat",

  排队中: "Antre",

  运行中: "Berjalan",

  失败: "Gagal",

  已超时: "Waktu Habis",

  // severity
  严重: "Kritis",

  高危: "Tinggi",

  中危: "Sedang",

  低危: "Rendah",

  // finding
  待处理: "Tertunda",

  处理中: "Sedang Diproses",

  已确认: "Dikonfirmasi",

  已处理: "Ditangani",

  已修复: "Diperbaiki",

  误报: "False Positive",

  忽略: "Diabaikan",

  重复: "Duplikat",

  风险接受: "Risiko Diterima",

  // engine
  探索中: "Menjelajahi",

  停滞: "Mandek",

  空闲: "Idle",

  // goal
  进行中: "Aktif",

  已达成: "Tercapai",

  已放弃: "Ditinggalkan",

  // audit (aturan allow/block)
  放行: "Izinkan",

  拦截: "Blokir",

  // node eksplorasi
  观测: "Teramati",

  确认: "Dikonfirmasi",

  废弃: "Tidak Berlaku",

  // pengiriman notifikasi
  待发送: "Menunggu Kirim",

  发送中: "Mengirim",

  已送达: "Terkirim",

  已跳过: "Dilewati",
} satisfies Record<string, string>;

export default status;

/**
 * Terjemahan halaman detail temuan (kunci adalah string zh-CN asli).
 */

const messages = {
  "严重等级已改为「{label}」": "Tingkat keparahan diubah menjadi “{label}”",
  "处理状态已改为「{label}」": "Status pemrosesan diubah menjadi “{label}”",
  "更新失败：{message}": "Pembaruan gagal: {message}",
  "未找到发现 {id}": "Temuan {id} tidak ditemukan",
  "加载中…": "Memuat…",
  返回发现列表: "Kembali ke daftar temuan",
  未分类: "Tidak terklasifikasi",
  "来源任务 #{id} · 只读": "Tugas sumber #{id} · hanya-baca",
  概览: "Ikhtisar",
  链路图: "Diagram rantai",
  摘要: "Ringkasan",
  "（无摘要）": "(tanpa ringkasan)",
  "证据 / PoC": "Bukti / PoC",
  "（无证据）": "(tanpa bukti)",
  详细报告: "Laporan detail",
  已复制详细报告: "Laporan detail disalin",
  "流量证据已变更，详细报告待更新。": "Bukti lalu lintas telah berubah; laporan detail perlu diperbarui.",
  "暂无详细报告。": "Belum ada laporan detail.",
  状态: "Status",
  "漏洞 ID": "ID temuan",
  严重等级: "Tingkat keparahan",
  处理状态: "Status pemrosesan",
  漏洞类型: "Jenis kerentanan",
  涉及资产: "Aset yang terlibat",
  所属任务: "Tugas induk",
  发现时间: "Ditemukan pada",
  "—（任务已删除）": "— (tugas dihapus)",
} satisfies Record<string, string>;

export default messages;

/**
 * Terjemahan halaman detail temuan (kunci adalah string zh-CN asli).
 */

const messages = {
  "Severity changed to “{label}”": "Tingkat keparahan diubah menjadi “{label}”",
  "Processing status changed to “{label}”": "Status pemrosesan diubah menjadi “{label}”",
  "Update failed: {message}": "Pembaruan gagal: {message}",
  "Finding {id} not found": "Temuan {id} tidak ditemukan",
  "Loading…": "Memuat…",
  "Back to findings list": "Kembali ke daftar temuan",
  Uncategorized: "Tidak terklasifikasi",
  "Source task #{id} · read-only": "Tugas sumber #{id} · hanya-baca",
  Overview: "Ikhtisar",
  "Chain view": "Diagram rantai",
  Summary: "Ringkasan",
  "(no summary)": "(tanpa ringkasan)",
  "Evidence / PoC": "Bukti / PoC",
  "(no evidence)": "(tanpa bukti)",
  "Detailed report": "Laporan detail",
  "Detailed report copied": "Laporan detail disalin",
  "Traffic evidence has changed; the detailed report is out of date.":
    "Bukti lalu lintas telah berubah; laporan detail perlu diperbarui.",
  "No detailed report yet.": "Belum ada laporan detail.",
  Status: "Status",
  "Finding ID": "ID temuan",
  Severity: "Tingkat keparahan",
  "Processing status": "Status pemrosesan",
  "Vulnerability type": "Jenis kerentanan",
  "Assets involved": "Aset yang terlibat",
  "Owning task": "Tugas induk",
  "Discovered at": "Ditemukan pada",
  "— (task deleted)": "— (tugas dihapus)",
} satisfies Record<string, string>;

export default messages;

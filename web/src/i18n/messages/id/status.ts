/**
 * Terjemahan label status/severity (kunci = label zh-CN dari lib/status.ts).
 * Situs render membungkusnya dengan t() saat render — file datanya tetap zh.
 */

const status = {
  Unclaimed: "Belum Diambil",
  Executing: "Dieksekusi",
  Paused: "Dijeda",
  Completed: "Selesai",
  "Execution Error": "Galat Eksekusi",
  "Budget Exhausted": "Anggaran Habis",
  Stopped: "Dihentikan",
  Deleted: "Dihapus",
  Created: "Dibuat",
  Queued: "Antre",
  Running: "Berjalan",
  Failed: "Gagal",
  "Timed Out": "Waktu Habis",
  Critical: "Kritis",
  High: "Tinggi",
  Medium: "Sedang",
  Low: "Rendah",
  Pending: "Tertunda",
  "In Progress": "Sedang Diproses",
  Confirmed: "Dikonfirmasi",
  Handled: "Ditangani",
  Fixed: "Diperbaiki",
  "False Positive": "False Positive",
  Ignored: "Diabaikan",
  Duplicate: "Duplikat",
  "Risk Accepted": "Risiko Diterima",
  Exploring: "Menjelajahi",
  Stalled: "Mandek",
  Idle: "Idle",
  Active: "Aktif",
  Met: "Tercapai",
  Abandoned: "Ditinggalkan",
  Allow: "Izinkan",
  Block: "Blokir",
  Observed: "Teramati",
  Deprecated: "Tidak Berlaku",
  "Pending Send": "Menunggu Kirim",
  Sending: "Mengirim",
  Sent: "Terkirim",
  Skipped: "Dilewati",
} satisfies Record<string, string>;

export default status;

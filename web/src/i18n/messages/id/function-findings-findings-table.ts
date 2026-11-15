/**
 * Terjemahan tabel temuan (kunci adalah string zh-CN asli).
 */

const messages = {
  "Select all on this page": "Pilih semua di halaman ini",
  "Select all on this page of the group": "Pilih semua di halaman ini dalam grup",
  Severity: "Severity",
  "Finding name": "Nama temuan",
  Assets: "Aset",
  Status: "Status",
  "Owning task": "Tugas induk",
  Time: "Waktu",
  Actions: "Aksi",
  "Select this finding": "Pilih temuan ini",
  "View finding details": "Lihat detail temuan",
  Uncategorized: "Tidak terklasifikasi",
  "{n} traffic evidence records": "{n} bukti lalu lintas",
  "View the in-progress retest session": "Lihat sesi uji ulang yang sedang berjalan",
  Retesting: "Sedang uji ulang",
  "Retest this finding in a separate session": "Uji ulang temuan ini di sesi terpisah",
  Retest: "Uji ulang",
  Deepen: "Pendalaman",
  "Delete finding": "Hapus temuan",
  "Delete this finding?": "Hapus temuan ini?",
  "「": "“",
  "” will be permanently deleted, along with its entries in the findings list, the task's Findings tab and the exploration graph. This cannot be undone.":
    "” akan dihapus permanen, beserta catatannya di daftar temuan, tab Temuan pada tugas, dan graf eksplorasi. Tindakan ini tidak dapat dibatalkan.",
  Cancel: "Batal",
  Delete: "Hapus",
  "Readable title; leave blank to fall back to the class":
    "Judul yang mudah dibaca; biarkan kosong untuk memakai kelas",
  Class: "Kelas",
  "e.g. SQL Injection": "mis. SQL Injection",
  "Saving…": "Menyimpan…",
  Save: "Simpan",
  Evidence: "Bukti",
  "· Type: ": "· Jenis: ",
  "· Asset: ": "· Aset: ",
  "Detailed report": "Laporan detail",
  "Detailed report copied": "Laporan detail disalin",
  "Loading…": "Memuat…",
  "Failed to load the report.": "Gagal memuat laporan.",
  "No detailed report yet.": "Belum ada laporan detail.",
  "No matching findings.": "Tidak ada temuan yang cocok.",
} satisfies Record<string, string>;

export default messages;

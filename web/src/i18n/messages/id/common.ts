/**
 * kosakata UI bersama (tombol, status, label umum) yang dipakai di banyak halaman.
 * Tambahkan entri di sini hanya untuk string lintas area; string khusus halaman
 * masuk ke file namespace halaman tersebut.
 */

const common = {
  Save: "Simpan",
  Cancel: "Batal",
  Confirmed: "Konfirmasi",
  Delete: "Hapus",
  Edit: "Edit",
  Search: "Cari",
  Retry: "Coba lagi",
  Off: "Tutup",
  "Loading…": "Memuat…",
  Version: "Versi",
  "Switch language": "Ganti bahasa",
  Confirm: "OK",
  Yes: "Ya",
  No: "Tidak",
  All: "Semua",
  Status: "Status",
  Name: "Nama",
  Type: "Jenis",
  Actions: "Aksi",
  Time: "Waktu",
  Details: "Detail",
} satisfies Record<string, string>;

export default common;

/**
 * Terjemahan halaman sinkronisasi aset (kunci adalah string zh-CN asli).
 */

const messages = {
  "Asset Sync": "Sinkronisasi Aset",
  "Sync assets into the database from external data sources":
    "Sinkronkan aset dari sumber data eksternal ke basis data",
  "Failed to read datasource status: {message}": "Gagal membaca status sumber data: {message}",
  "Once the datasource is ready, pick a project / task to sync.":
    "Setelah sumber data siap, pilih proyek / tugas untuk disinkronkan.",
  "ScopeSentry datasource created; fill in the URL and API key": "Sumber data ScopeSentry dibuat; isi URL dan API key",
  "Creation failed: {message}": "Pembuatan gagal: {message}",
  "Enter the MCP URL": "Isi URL MCP",
  "Datasource saved and enabled": "Sumber data disimpan dan diaktifkan",
  "Saved (enablement conditions not yet met)": "Disimpan (syarat pengaktifan belum terpenuhi)",
  "Save failed: {message}": "Gagal menyimpan: {message}",
  "Datasource Status": "Status Sumber Data",
  Refresh: "Muat ulang",
  "No ScopeSentry datasource created yet. Creating one adds a placeholder MCP entry (empty URL/key, disabled).":
    "Sumber data ScopeSentry belum dibuat. Pembuatan akan menambahkan entri MCP placeholder (URL/kunci kosong, nonaktif).",
  "Create Datasource": "Buat Sumber Data",
  "The datasource is created but not configured. Fill in the MCP URL and API Key, then enable it.":
    "Sumber data sudah dibuat tetapi belum dikonfigurasi. Isi URL MCP dan API Key, lalu aktifkan.",
  "The datasource is configured but not enabled; saving will enable it automatically.":
    "Sumber data sudah dikonfigurasi tetapi belum aktif; menyimpan akan mengaktifkannya otomatis.",
  "MCP URL": "URL MCP",
  "http://<host>:8082/mcp": "http://<host>:8082/mcp",
  "API Key (X-API-Key; leave blank to keep the current value)":
    "API Key (X-API-Key; kosongkan untuk mempertahankan nilai saat ini)",
  "Save & Enable": "Simpan & Aktifkan",
  "{n} tools discovered": "{n} tool ditemukan",
  "Checking…": "Memeriksa…",
  "Not Created": "Belum Dibuat",
  "Not Configured": "Belum Dikonfigurasi",
  Disabled: "Belum Aktif",
  Connected: "Terhubung",
  Unreachable: "Tidak Terjangkau",
  "Failed to load the list: {message}": "Gagal memuat daftar: {message}",
  "Select at least one {target}": "Pilih setidaknya satu {target}",
  Project: "Proyek",
  Tasks: "Tugas",
  "Select at least one asset type": "Pilih setidaknya satu jenis aset",
  "Sync complete; {n} assets imported": "Sinkronisasi selesai; {n} aset diimpor",
  "Sync failed: {message}": "Sinkronisasi gagal: {message}",
  "Loading…": "Memuat…",
  "No data": "Tidak ada data",
  "Select Data to Sync": "Pilih Data untuk Disinkronkan",
  "By Project": "Per Proyek",
  "By Task": "Per Tugas",
  "Sync assets:": "Sinkronkan aset:",
  Subdomain: "Subdomain",
  Service: "Layanan",
  "Create a company per project and write its asset scope": "Buat perusahaan per proyek dan tulis cakupan asetnya",
  "Search project name": "Cari nama proyek",
  "Search task name": "Cari nama tugas",
  "{n} selected": "{n} dipilih",
  "Sync Selected": "Sinkronkan Terpilih",
  "Project Name": "Nama Proyek",
  "Task Name": "Nama Tugas",
  Tag: "Tag",
  "Asset Count": "Jumlah Aset",
  Status: "Status",
  Time: "Waktu",
  Previous: "Sebelumnya",
  "Page {n}": "Halaman {n}",
  Next: "Berikutnya",
  "Created/updated companies: ": "Perusahaan baru/diperbarui: ",
  "…and {n} more errors": "…{n} error lainnya",
} satisfies Record<string, string>;

export default messages;

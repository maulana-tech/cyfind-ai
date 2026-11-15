/**
 * Pesan error mock API handler (lib/mock/handler.ts), fase arsip, dan label
 * respons demo (kunci sumber adalah string zh-CN asli).
 */

const messages = {
  "Task not found": "Tugas tidak ditemukan",
  "Queued tasks must be paused first": "Tugas dalam antrean harus dijeda terlebih dahulu",
  "Running tasks must be paused first": "Tugas yang berjalan harus dijeda terlebih dahulu",
  "Task is already in the archive queue": "Tugas sudah berada dalam antrean arsip",
  "Task is directly inherited by unarchived task #{id} and cannot be archived yet":
    "Tugas diwarisi langsung oleh tugas yang belum diarsipkan #{id}, belum bisa diarsipkan",
  "Archive not found": "Arsip tidak ditemukan",
  "The current archive state cannot be restored": "Status arsip saat ini tidak dapat dipulihkan",
  "The current archive state cannot be permanently deleted": "Status arsip saat ini tidak dapat dihapus permanen",
  "Archive is still referenced by task #{id} and cannot be permanently deleted":
    "Arsip masih dirujuk oleh tugas #{id} dan tidak dapat dihapus permanen",
  "Waiting to archive": "Menunggu untuk diarsipkan",
  "Compressing task data": "Mengompres data tugas",
  "Archive complete": "Arsip selesai",
  "Waiting to restore": "Menunggu untuk dipulihkan",
  "Restoring task data": "Memulihkan data tugas",
  "Waiting to delete permanently": "Menunggu untuk dihapus permanen",
  "Deleting archive package": "Menghapus paket arsip",
  "task_ids must contain 1-100 entries": "task_ids must contain 1-100 entries",
  "Task category not found": "Kategori tugas tidak ditemukan",
  "Category name cannot be empty": "Nama kategori tidak boleh kosong",
  "Category name already exists": "Nama kategori sudah ada",
  "New task": "Tugas baru",
  "Fill in the template name, description, and goal": "Isi nama, deskripsi, dan tujuan template",
  "Template name already exists": "Nama template sudah ada",
  "Task state has changed": "Status tugas sudah berubah",
  "Tasks in a terminal state cannot be controlled": "Tugas dalam status akhir tidak bisa dikontrol",
  "Task is already paused": "Tugas sudah dijeda",
  "Task is not paused": "Tugas belum dijeda",
  "Unassigned assets": "Aset tidak terkait",
  "Asset not found": "Aset tidak ditemukan",
  "Task or asset not found": "Tugas atau aset tidak ditemukan",
  "Asset is not linked to the current task": "Aset tidak terkait dengan tugas saat ini",
  "Asset #{id}": "Aset #{id}",
  "Enter a valid test scope": "Masukkan ruang lingkup pengujian yang valid",
  "Scope entry {n} is invalid: {error}": "Entri ruang lingkup {n} tidak valid: {error}",
  Unrecognized: "Tidak dikenali",
  "Select assets and fill in the source description": "Pilih aset dan isi keterangan sumbernya",
  "Manually added by the user on the test assets page": "Ditambahkan manual oleh pengguna di halaman aset pengujian",
  "Company linked at task creation: {name}": "Perusahaan yang ditautkan saat pembuatan tugas: {name}",
  "Associated company does not exist or is invalid": "Perusahaan terkait tidak ada atau tidak valid",
  Company: "Perusahaan",
  "Company name cannot be empty": "Nama perusahaan tidak boleh kosong",
  "Company already exists": "Perusahaan sudah ada",
  "Company not found": "Perusahaan tidak ditemukan",
  "The company scope contains invalid rules; the original scope was not replaced":
    "Ruang lingkup perusahaan berisi aturan yang tidak valid, ruang lingkup lama tidak diganti",
  "Intent not found": "Intent tidak ditemukan",
  "Worker state has changed": "Status Worker sudah berubah",
  "request_id cannot be empty": "request_id tidak boleh kosong",
  "request_id was already used for a different Worker message": "request_id sudah dipakai untuk pesan Worker lain",
  "Only paused Workers can receive messages; pause it first":
    "Hanya Worker yang dijeda yang bisa menerima pesan, jeda dulu",
  "Message cannot be empty": "Pesan tidak boleh kosong",
  "Message cannot exceed 4000 characters": "Pesan tidak boleh melebihi 4000 karakter",
  "LLM profile not found": "Profil LLM tidak ditemukan",
  "LLM profile has no API key set": "Profil LLM belum mengatur API Key",
  "The task LLM profile chain quota is exhausted": "Kuota rantai profil LLM tugas sudah habis",
  "Global profile": "Profil global",
  "Batch operations support at most 100 IDs": "Operasi massal mendukung maksimal 100 ID",
  "Finding not found": "Temuan tidak ditemukan",
  "Retest #{id} · {name}": "Uji ulang #{id} · {name}",
  "Please retest finding #{id}": "Silakan uji ulang temuan #{id}",
  "No real verification was performed in the demo environment; the current state of the finding cannot be confirmed.":
    "Tidak ada verifikasi nyata yang dijalankan di lingkungan demo; status temuan saat ini tidak dapat dipastikan.",
  "Demo retest in progress (no requests sent to the target)":
    "Uji ulang demo sedang berlangsung (tidak ada permintaan yang dikirim ke target)",
  "Demo retest stopped": "Uji ulang demo dihentikan",
  "Evidence not found": "Bukti tidak ditemukan",
  "(demo) I have injected that suggestion as a high-priority intent; the work agent will execute it shortly.":
    "(demo) Saran tersebut sudah saya sisipkan sebagai intent prioritas tinggi; work agent akan segera mengeksekusinya.",
  "New conversation": "Percakapan baru",
  "(demo) Sample tool execution output.": "(demo) Contoh keluaran eksekusi tool.",
  "The approval was already processed or does not exist; refresh the records":
    "Persetujuan sudah diproses atau tidak ada, muat ulang catatan",
  "Invalid approval action": "Aksi persetujuan tidak valid",
  "Approval record not found": "Catatan persetujuan tidak ditemukan",
  "Invalid approval status": "Status persetujuan tidak valid",
  "Invalid decision source": "Sumber keputusan tidak valid",
  "Manually allowed execution": "Diizinkan manual",
  "Manually denied execution": "Ditolak manual",
  "The tool was not executed in demo mode.": "Tool tidak dijalankan dalam mode demo.",
  "Side questions are not supported in demo mode": "Pertanyaan sampingan tidak didukung dalam mode demo",
  "Admin functionality enumeration intent selected from earlier subdomain findings":
    "Intent enumerasi fungsionalitas admin dipilih dari temuan subdomain sebelumnya",
  "Order API testing intent selected from the API task goal":
    "Intent pengujian API pesanan dipilih dari tujuan tugas API",
  "Injected a payload via the q parameter; the response reflects the MSSQL error.":
    "Payload disuntikkan melalui parameter q; respons memantulkan kesalahan MSSQL.",
  "Own order id=1001, used as a normal baseline.": "Pesanan sendiri id=1001, digunakan sebagai pembanding normal.",
  "Changed id=1002 to read another user's order (IDOR).":
    "Mengubah id=1002 untuk membaca pesanan pengguna lain (IDOR).",
  "Fastjson @type JNDI payload that triggers the callback.": "Payload JNDI @type Fastjson yang memicu callback.",
  "Follow-up request confirming command execution.": "Permintaan lanjutan yang memastikan eksekusi perintah berhasil.",
  "Jenkins Script Console is reachable without authentication.":
    "Jenkins Script Console dapat diakses tanpa autentikasi.",
  "scriptText executes a Groovy command and returns SYSTEM.":
    "scriptText mengeksekusi perintah Groovy dan mengembalikan SYSTEM.",
  "psexec logs into domain controller DC01 as svc_deploy.":
    "psexec masuk ke domain controller DC01 sebagai svc_deploy.",
} satisfies Record<string, string>;

export default messages;

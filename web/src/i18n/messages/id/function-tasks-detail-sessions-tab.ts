/**
 * Terjemahan tab Sesi di detail tugas (daftar sesi, transkrip, kontrol worker).
 */

const messages = {
  "Unnamed profile": "Profil tanpa nama",
  "Main Agent": "Main Agent",
  Planner: "Planner",
  "System Audit": "Audit Sistem",
  In: "In",
  Cache: "Cache",
  Out: "Out",
  input: "input",
  cache: "cache",
  output: "output",
  "Main Agent · Session #{n}": "Main Agent · Sesi #{n}",
  "Planner · Situation Assessment": "Planner · Penilaian Situasi",
  "System Events · LLM Failover": "Peristiwa Sistem · Failover LLM",
  "From #{n}": "Sumber #{n}",
  Live: "Live",
  "Delete this intent (a reason is required; choose soft or hard delete)":
    "Hapus intent ini (alasan wajib diisi; pilih soft atau hard delete)",
  "Current asset: {label}": "Aset saat ini: {label}",
  "From task #{n}": "Dari tugas #{n}",
  "Upload failed: {message}": "Unggahan gagal: {message}",
  "Failed to create session: {message}": "Gagal membuat sesi baru: {message}",
  "Enter a reason for deletion": "Isi alasan penghapusan",
  "Send message to Worker #{id}": "Kirim pesan ke Worker #{id}",
  "Worker #{id} paused": "Worker #{id} dijeda",
  "Worker #{id} resumed, waiting to be picked up again": "Worker #{id} dilanjutkan, menunggu untuk diambil ulang",
  " ({intents} intents / {facts} facts / {findings} findings included)":
    " ({intents} intent / {facts} fakta / {findings} temuan disertakan)",
  "Worker #{id} and its exclusive downstream permanently deleted{extra}":
    "Worker #{id} dan turunan eksklusifnya dihapus permanen{extra}",
  "Worker #{id} deleted (reason recorded; the planner will re-plan accordingly)":
    "Worker #{id} dihapus (alasan dicatat; planner akan merencanakan ulang)",
  "Worker action failed: {message}": "Aksi Worker gagal: {message}",
  "Load failed": "Gagal memuat",
  "Load failed: {error}": "Gagal memuat: {error}",
  "Failed to send: {message}": "Gagal mengirim: {message}",
  "Please try again later": "Coba lagi nanti",
  "Messages can be at most {max} characters": "Pesan maksimal {max} karakter",
  "Message sent to Worker #{id}; execution resumed immediately":
    "Pesan dikirim ke Worker #{id}; eksekusi langsung dilanjutkan",
  Sessions: "Daftar Sesi",
  "Live connection OK": "Koneksi live normal",
  "Live connection lost — reconnecting automatically (history remains visible)":
    "Koneksi live terputus — menyambung ulang otomatis (riwayat tetap terlihat)",
  Reconnecting: "Menyambung ulang",
  "Task total": "Total tugas",
  "Input {input} · Output {output} · Cache read {cacheRead} · Cache write {cacheWrite}":
    "Input {input} · Output {output} · Baca cache {cacheRead} · Tulis cache {cacheWrite}",
  "New Main Agent session (clears context; task state is kept)":
    "Sesi Main Agent baru (konteks dikosongkan; status tugas tetap)",
  "New Main Agent session": "Sesi Main Agent baru",
  New: "Baru",
  "Load earlier Workers": "Muat Worker lebih awal",
  "No running Worker sessions.": "Tidak ada sesi Worker yang berjalan.",
  "Worker Session": "Sesi Eksekusi Worker",
  "Current profile: {label}": "Profil saat ini: {label}",
  "Model unavailable": "Model tidak tersedia",
  "No LLM profile available": "Tidak ada profil LLM yang tersedia",
  "From task #{id} · read-only history": "Dari tugas #{id} · riwayat baca-saja",
  "Scroll up to load earlier history": "Gulir ke atas untuk memuat riwayat lebih awal",
  "↑ Earlier history": "↑ Riwayat lebih awal",
  "Run duration (first → last step)": "Durasi berjalan (langkah pertama → terakhir)",
  Interactive: "Interaktif",
  "This intent was deleted by the user": "Intent ini dihapus oleh pengguna",
  " (execution stopped, the planner has been notified; the intent and its outputs are kept — history is viewable below)":
    " (eksekusi dihentikan, planner sudah diberi tahu; intent dan keluarannya tetap ada — riwayat dapat dilihat di bawah)",
  "Deletion reason: ": "Alasan penghapusan: ",
  "Loading earlier history…": "Memuat riwayat lebih awal…",
  "Loading activity stream…": "Memuat aliran aktivitas…",
  Retry: "Coba lagi",
  "No conversation yet. Message the Main Agent below to steer the exploration or step in.":
    "Belum ada percakapan. Kirim pesan ke Main Agent di bawah untuk mengarahkan eksplorasi atau campur tangan.",
  "No activity yet.": "Belum ada aktivitas.",
  Remove: "Hapus",
  "Message the Main Agent": "Kirim pesan ke Main Agent",
  "Main Agent is running — type /btw to ask a side question…":
    "Main Agent sedang berjalan — ketik /btw untuk bertanya…",
  "Message the Main Agent; @ to reference findings, assets, …":
    "Kirim pesan ke Main Agent; @ untuk mereferensikan temuan, aset, …",
  "Upload files": "Unggah file",
  "Send side question": "Kirim pertanyaan sampingan",
  "Stop current run": "Hentikan eksekusi saat ini",
  "Send message": "Kirim pesan",
  "Message Worker #{id}": "Kirim pesan ke Worker #{id}",
  "Message Worker #{id}; @ to reference records and adjust its direction…":
    "Kirim pesan ke Worker #{id}; @ untuk mereferensikan catatan dan mengarahkan eksekusi…",
  "Pause current Worker": "Jeda Worker saat ini",
  "Resume without sending a message": "Lanjutkan tanpa mengirim pesan",
  "Resume now": "Lanjutkan sekarang",
  Resume: "Lanjutkan",
  "Delete Worker #{id}?": "Hapus Worker #{id}?",
  "Hard delete": "Hard Delete",
  " permanently removes this intent, and its": " akan menghapus intent ini secara permanen beserta node turunan yang ",
  "downstream nodes that only it supports": "hanya ditopang olehnya",
  " (cascaded to leaves to avoid orphaned data); shared nodes, goals, and task root facts are kept.":
    " (dihapus berjenjang sampai ke daun agar tidak ada data yatim); node bersama, tujuan, dan fakta akar tugas tetap dipertahankan.",
  "This cannot be undone.": "Tindakan ini tidak dapat dibatalkan.",
  "The planner is notified and will re-plan accordingly.": "Planner menerima notifikasi dan akan merencanakan ulang.",
  "Soft delete": "Soft Delete",
  " marks the intent as “Deleted” and records the reason; the intent node, execution records, and registered facts and findings":
    " menandai intent sebagai “Dihapus” dan mencatat alasannya; node intent, catatan eksekusi, serta fakta dan temuan yang terdaftar",
  "are all kept": "tetap dipertahankan",
  ". The planner receives “deleted by the user + reason” and re-plans accordingly.":
    ". Planner menerima “intent dihapus oleh pengguna + alasan” dan merencanakan ulang.",
  "Keeps data, fully traceable": "Data tetap ada, bisa ditelusuri",
  "Cascaded removal, cannot be undone": "Penghapusan berjenjang, tidak dapat dibatalkan",
  "Deletion reason (required)": "Alasan penghapusan (wajib)",
  "Explain why this intent is being deleted, e.g. wrong direction / goal no longer valid / duplicate of another intent…":
    "Jelaskan alasan penghapusan intent ini, mis. salah arah / tujuan sudah tidak berlaku / duplikat dari intent lain…",
  Back: "Kembali",
  "Delete permanently": "Hapus permanen",
  "Confirm delete": "Konfirmasi hapus",
  "Start a new session?": "Mulai sesi baru?",
  "The current session is archived (you can switch back anytime) and the Main Agent continues with a clean context. The task's graph, assets, and goals are unaffected.":
    "Sesi saat ini diarsipkan (bisa berpindah kapan saja) dan Main Agent melanjutkan dengan konteks bersih. Graf, aset, dan tujuan tugas tidak terpengaruh.",
  Cancel: "Batal",
  "Starting…": "Memulai…",
  "Start new session": "Mulai sesi baru",
} satisfies Record<string, string>;

export default messages;

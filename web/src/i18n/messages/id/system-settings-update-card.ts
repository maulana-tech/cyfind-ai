/**
 * Terjemahan kartu pembaruan (system/settings/_components/update-card).
 *
 * Kunci adalah string zh-CN asli. Termasuk pesan progres pembaruan statis
 * dari backend (server/update.go, selfupdate/stage.go) — dirender lewat
 * t(progress.message) dengan fallback aman.
 */

const messages = {
  "Failed to check for updates: {message}": "Gagal memeriksa pembaruan: {message}",
  "New version {version} found": "Versi baru {version} ditemukan",
  "Already the latest version": "Sudah versi terbaru",
  "Updated to {version}, reloading the page": "Diperbarui ke {version}, memuat ulang halaman",
  "Timed out waiting for the service to restart. Check the backend log, or confirm cyfind was started via start.sh / start.bat.":
    "Waktu tunggu restart layanan habis. Periksa log backend, atau pastikan cyfind dijalankan lewat start.sh / start.bat.",
  "Update failed: {message}": "Pembaruan gagal: {message}",
  "Update failed": "Pembaruan gagal",
  "Update to {version}?": "Perbarui ke {version}?",
  "Updating restarts the program; running tasks will be interrupted.\n":
    "Pembaruan me-restart program; tugas yang berjalan akan terputus.\n",
  "\nNote: an in-container update only replaces the program itself, not the playwright / nmap toolchain in the image; ":
    "\nCatatan: update di dalam container hanya mengganti program itu sendiri — tidak memperbarui toolchain seperti playwright / nmap di image; ",
  "if the new version needs new tools, use docker compose pull instead.":
    "jika versi baru membutuhkan tool baru, gunakan docker compose pull.",
  "Roll back to the previous version?\n\nThe program will restart and running tasks will be interrupted.\nNote: the database schema is not rolled back, and the old version may not recognize data written by the new one.":
    "Rollback ke versi sebelumnya?\n\nProgram akan di-restart dan tugas yang berjalan akan terputus.\nCatatan: skema database tidak ikut di-rollback; versi lama mungkin tidak mengenali data yang ditulis versi baru.",
  "Switched to the previous version, restarting…": "Beralih ke versi sebelumnya, restart…",
  "Rollback failed: {message}": "Rollback gagal: {message}",
  "An update is already in progress": "Pembaruan sudah berjalan",
  "An update is in progress; rollback is not possible": "Pembaruan sedang berjalan; rollback tidak memungkinkan",
  "Failed to start the update: {message}": "Gagal memulai pembaruan: {message}",
  "Version & updates": "Versi & pembaruan",
  "Check for and install a new version from GitHub. Updating restarts the program; running tasks will be interrupted.":
    "Periksa versi baru di GitHub dan pasang. Pembaruan me-restart program; tugas yang berjalan akan terputus.",
  "Current version": "Versi saat ini",
  Standalone: "Program standalone",
  "Latest version": "Versi terbaru",
  "Release notes": "Catatan rilis",
  "Preparing…": "Mempersiapkan…",
  "Fetching the checksum manifest…": "Mengambil daftar checksum…",
  "Verifying SHA256…": "Memverifikasi SHA256…",
  "Extracting and smoke-testing…": "Mengekstrak dan smoke test…",
  "Warning: failed to write the upgrade marker; this upgrade will have no automatic rollback protection":
    "Peringatan: gagal menulis tanda upgrade — pembaruan ini tanpa perlindungan rollback otomatis",
  "The new version is ready, restarting…": "Versi baru siap, restart…",
  "Cannot connect to GitHub: ": "Tidak dapat terhubung ke GitHub:",
  "Configure the global proxy above and try again.": "Atur proxy global di atas, lalu coba lagi.",
  "{latest} does not provide a release package for {os}/{arch} (missing {asset}), so automatic update is not possible.":
    "{latest} tidak menyediakan paket rilis untuk {os}/{arch} ({asset} tidak ada) — pembaruan otomatis tidak tersedia.",
  "Will download ": "Unduh ",
  "（{size}）": " ({size})",
  ", and it is replaced only after SHA256 verification and a smoke test; on failure the current version is kept automatically.":
    ", baru diganti setelah verifikasi SHA256 dan smoke test; jika gagal, versi saat ini dipertahankan.",
  "Already on the latest version.": "Sudah versi terbaru.",
  "An update under Docker only replaces the program itself, not the playwright / nmap toolchain in the image, and":
    "Update di Docker hanya mengganti program itu sendiri — toolchain seperti playwright / nmap di image tidak diperbarui, dan setelah",
  "after rebuilding the container it reverts to the image-bundled version. To upgrade the image too, run":
    "container dibuat ulang, kembali ke versi bawaan image. Untuk meng-upgrade image sekaligus, jalankan",
  "。": ".",
  "Restarting and applying the new version, please wait (the page will refresh automatically)…":
    "Restart dan menerapkan versi baru, tunggu sebentar (halaman akan dimuat ulang otomatis)…",
  "Check for updates": "Periksa pembaruan",
  "Update to {version}": "Perbarui ke {version}",
  "Update now": "Perbarui sekarang",
  "Roll back to the previous version": "Rollback ke versi sebelumnya",
  "One-click update relies on the watchdog script to restart the program. Please use ":
    "Pembaruan sekali klik bergantung pada skrip watchdog untuk me-restart program. Silakan pakai ",
  " (on Windows: ": " (di Windows:",
  ") to start CYFIND; when running the cyfind binary directly, it is not relaunched automatically after it exits.":
    ") untuk memulai CYFIND; jika menjalankan cyfind secara langsung, program tidak akan di-restart otomatis setelah keluar.",
} satisfies Record<string, string>;

export default messages;

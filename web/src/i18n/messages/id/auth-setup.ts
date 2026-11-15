/** Halaman penyiapan awal: galat validasi, label, dan galat autentikasi backend yang diketahui. */

const messages = {
  "Unable to connect to the backend service": "Tidak dapat terhubung ke layanan backend",
  "The two passwords you entered do not match": "Kata sandi yang Anda masukkan tidak cocok",
  "Password must be at least 8 characters": "Kata sandi minimal 8 karakter",
  "Initialization failed": "Inisialisasi gagal",
  "Unable to confirm the initialization status": "Tidak dapat memastikan status inisialisasi",
  "Initialize password": "Inisialisasi kata sandi",
  "The backend or database is temporarily unavailable. To avoid overwriting the existing password on this instance, the setup entry has been temporarily disabled — please restore the service and try again.":
    "Backend atau basis data sementara tidak tersedia. Untuk menghindari penimpaan kata sandi yang sudah ada pada instance ini, pintu inisialisasi telah sementara ditutup — pulihkan layanan lalu coba lagi.",
  "First time using CYFIND? Set a sign-in password for your account (at least 8 characters).":
    "Pertama kali menggunakan CYFIND? Tetapkan kata sandi masuk untuk akun Anda (minimal 8 karakter).",
  Retry: "Coba lagi",
  "New password": "Kata sandi baru",
  "At least 8 characters": "Minimal 8 karakter",
  "Confirm password": "Konfirmasi kata sandi",
  "Re-enter your password": "Masukkan ulang kata sandi",
  "Saving…": "Menyimpan…",
  "Set password and sign in": "Tetapkan kata sandi dan masuk",
  "The data source is temporarily unavailable. Please try again later.":
    "Sumber data sementara tidak tersedia. Silakan coba lagi nanti.",
  "A password has already been set": "Kata sandi sudah ditetapkan",
  "Password cannot be empty": "Kata sandi tidak boleh kosong",
  "Password must not exceed 72 bytes": "Kata sandi tidak boleh melebihi 72 byte",
  "Failed to hash the password": "Gagal meng-hash kata sandi",
  "Failed to generate token": "Gagal menghasilkan token",
} satisfies Record<string, string>;

export default messages;

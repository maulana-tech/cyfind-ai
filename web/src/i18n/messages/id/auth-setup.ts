/** Halaman penyiapan awal: galat validasi, label, dan galat autentikasi backend yang diketahui. */

const messages = {
  无法连接到后端服务: "Tidak dapat terhubung ke layanan backend",

  两次输入的密码不一致: "Kata sandi yang Anda masukkan tidak cocok",

  "密码长度至少 8 位": "Kata sandi minimal 8 karakter",
  初始化失败: "Inisialisasi gagal",

  无法确认初始化状态: "Tidak dapat memastikan status inisialisasi",

  初始化密码: "Inisialisasi kata sandi",

  "后端或数据库暂时不可用。为避免覆盖实例上已有的密码，初始化入口已临时关闭——请恢复服务后重试。":
    "Backend atau basis data sementara tidak tersedia. Untuk menghindari penimpaan kata sandi yang sudah ada pada instance ini, pintu inisialisasi telah sementara ditutup — pulihkan layanan lalu coba lagi.",
  "首次使用 CYFIND，请为账户设置一个登录密码（至少 8 位）":
    "Pertama kali menggunakan CYFIND? Tetapkan kata sandi masuk untuk akun Anda (minimal 8 karakter).",
  重试: "Coba lagi",

  新密码: "Kata sandi baru",

  "至少 8 位": "Minimal 8 karakter",
  确认密码: "Konfirmasi kata sandi",

  再次输入密码: "Masukkan ulang kata sandi",

  "保存中...": "Menyimpan…",
  设置密码并登录: "Tetapkan kata sandi dan masuk",

  "数据源暂时不可用，请稍后重试": "Sumber data sementara tidak tersedia. Silakan coba lagi nanti.",
  密码已设置: "Kata sandi sudah ditetapkan",

  密码不能为空: "Kata sandi tidak boleh kosong",

  "密码长度不能超过 72 字节": "Kata sandi tidak boleh melebihi 72 byte",
  密码加密失败: "Gagal meng-hash kata sandi",

  "token 生成失败": "Gagal menghasilkan token",
} satisfies Record<string, string>;

export default messages;

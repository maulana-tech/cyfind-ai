/**
 * Topbar & akun: badge update, menu pengguna, dialog ubah kata sandi.
 */

const messages = {
  "发现新版本 {latest}，点击前往更新": "Versi baru {latest} tersedia — klik untuk memperbarui",
  新版本: "Versi baru",

  修改密码: "Ubah Kata Sandi",

  退出登录: "Keluar",

  请填写当前密码和新密码: "Isi kata sandi saat ini dan kata sandi baru",

  两次输入的新密码不一致: "Kata sandi baru tidak sama",

  密码已修改: "Kata sandi berhasil diubah",

  "修改失败：{error}": "Gagal mengubah: {error}",
  "用户名固定为 ": "Nama pengguna selalu ",
  "。需先输入当前密码验证；修改后已签发的登录 token 仍有效直至过期。":
    ". Masukkan kata sandi saat ini terlebih dahulu untuk verifikasi; token login yang sudah diterbitkan tetap berlaku hingga kedaluwarsa.",
  当前密码: "Kata Sandi Saat Ini",

  新密码: "Kata Sandi Baru",

  确认新密码: "Konfirmasi Kata Sandi",

  "修改中…": "Menyimpan…",
  确认修改: "Konfirmasi Perubahan",

  // Sidebar engine indicator
  引擎空闲: "Mesin idle",
  引擎运行中: "Mesin berjalan",
} satisfies Record<string, string>;

export default messages;

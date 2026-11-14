/**
 * Terjemahan kartu pembaruan (system/settings/_components/update-card).
 *
 * Kunci adalah string zh-CN asli. Termasuk pesan progres pembaruan statis
 * dari backend (server/update.go, selfupdate/stage.go) — dirender lewat
 * t(progress.message) dengan fallback aman.
 */

const messages = {
  "检查更新失败：{message}": "Gagal memeriksa pembaruan: {message}",
  "发现新版本 {version}": "Versi baru {version} ditemukan",
  当前已是最新版本: "Sudah versi terbaru",

  "已更新到 {version}，正在重新加载页面": "Diperbarui ke {version}, memuat ulang halaman",
  "等待服务重启超时。请检查后端日志，或确认 cyfind 是通过 start.sh / start.bat 启动的。":
    "Waktu tunggu restart layanan habis. Periksa log backend, atau pastikan cyfind dijalankan lewat start.sh / start.bat.",
  "更新失败：{message}": "Pembaruan gagal: {message}",
  更新失败: "Pembaruan gagal",

  "确定更新到 {version}？": "Perbarui ke {version}?",
  "更新会重启程序，正在运行的任务会被中断。\n": "Pembaruan me-restart program; tugas yang berjalan akan terputus.\n",
  "\n注意：容器内更新只替换程序本身，不会更新镜像里的 playwright / nmap 等工具链；":
    "\nCatatan: update di dalam container hanya mengganti program itu sendiri — tidak memperbarui toolchain seperti playwright / nmap di image; ",
  "若新版本依赖新工具，请改用 docker compose pull。":
    "jika versi baru membutuhkan tool baru, gunakan docker compose pull.",
  "回滚到上一版本？\n\n程序会重启，正在运行的任务会被中断。\n注意：数据库结构不会回退，旧版本可能无法识别新版写入的数据。":
    "Rollback ke versi sebelumnya?\n\nProgram akan di-restart dan tugas yang berjalan akan terputus.\nCatatan: skema database tidak ikut di-rollback; versi lama mungkin tidak mengenali data yang ditulis versi baru.",
  "已切换到上一版本，正在重启…": "Beralih ke versi sebelumnya, restart…",

  "回滚失败：{message}": "Rollback gagal: {message}",
  已有一个更新正在进行中: "Pembaruan sudah berjalan",

  "更新正在进行中，无法回滚": "Pembaruan sedang berjalan; rollback tidak memungkinkan",

  "启动更新失败：{message}": "Gagal memulai pembaruan: {message}",
  版本与更新: "Versi & pembaruan",

  "从 GitHub 检查并安装新版本。更新会重启程序，正在运行的任务会被中断。":
    "Periksa versi baru di GitHub dan pasang. Pembaruan me-restart program; tugas yang berjalan akan terputus.",
  当前版本: "Versi saat ini",

  独立程序: "Program standalone",

  最新版本: "Versi terbaru",

  更新日志: "Catatan rilis",

  // static backend update-progress messages (server/update.go, selfupdate/stage.go)
  "准备中…": "Mempersiapkan…",
  "获取校验和清单…": "Mengambil daftar checksum…",
  "校验 SHA256…": "Memverifikasi SHA256…",
  "解压并冒烟测试…": "Mengekstrak dan smoke test…",

  "警告：写入升级标记失败，本次升级将没有自动回滚保护":
    "Peringatan: gagal menulis tanda upgrade — pembaruan ini tanpa perlindungan rollback otomatis",
  "新版本已就绪，正在重启…": "Versi baru siap, restart…",
  "无法连接 GitHub：": "Tidak dapat terhubung ke GitHub:",

  "可在上方配置全局代理后重试。": "Atur proxy global di atas, lalu coba lagi.",

  "{latest} 没有提供 {os}/{arch} 的发布包（缺少 {asset}），无法自动更新。":
    "{latest} tidak menyediakan paket rilis untuk {os}/{arch} ({asset} tidak ada) — pembaruan otomatis tidak tersedia.",
  "将下载 ": "Unduh ",
  "（{size}）": " ({size})",
  "，校验 SHA256 并冒烟测试后才会替换，失败自动保留当前版本。":
    ", baru diganti setelah verifikasi SHA256 dan smoke test; jika gagal, versi saat ini dipertahankan.",
  "当前已是最新版本。": "Sudah versi terbaru.",
  "Docker 下的更新只替换程序本身，不更新镜像里的 playwright / nmap 等工具链，且":
    "Update di Docker hanya mengganti program itu sendiri — toolchain seperti playwright / nmap di image tidak diperbarui, dan setelah",
  "重建容器后会退回镜像自带的版本。需要连镜像一起升级请执行":
    "container dibuat ulang, kembali ke versi bawaan image. Untuk meng-upgrade image sekaligus, jalankan",
  "。": ".",

  "正在重启并应用新版本，请稍候（页面会自动刷新）…":
    "Restart dan menerapkan versi baru, tunggu sebentar (halaman akan dimuat ulang otomatis)…",
  检查更新: "Periksa pembaruan",

  "更新到 {version}": "Perbarui ke {version}",
  立即更新: "Perbarui sekarang",

  回滚到上一版本: "Rollback ke versi sebelumnya",

  "一键更新依赖守护脚本重启程序。请通过 ":
    "Pembaruan sekali klik bergantung pada skrip watchdog untuk me-restart program. Silakan pakai ",
  "（Windows 为": " (di Windows:",
  "）启动 CYFIND；直接运行 cyfind 本体时，程序退出后不会被自动拉起。":
    ") untuk memulai CYFIND; jika menjalankan cyfind secara langsung, program tidak akan di-restart otomatis setelah keluar.",
} satisfies Record<string, string>;

export default messages;

/**
 * Terjemahan halaman chat (rail percakapan, tampilan chat, komposer) — kunci adalah string zh-CN asli.
 */

const messages = {
  实时: "Live",

  移除: "Hapus",

  上传文件: "Unggah berkas",

  发送旁路问题: "Kirim pertanyaan sampingan",

  停止本次运行: "Hentikan run ini",

  发送消息: "Kirim pesan",

  "（{name}）": " ({name})",
  默认: "Bawaan",

  更换: "Ganti",

  "选择 LLM 配置": "Pilih konfigurasi LLM",
  "发送失败：{message}": "Gagal mengirim: {message}",
  "上传失败：{message}": "Unggahan gagal: {message}",
  "选择 Agent…": "Pilih Agent…",
  自定义: "Kustom",

  "开始和「{name}」对话": "Mulai mengobrol dengan \u201c{name}\u201d",
  "输入消息，@ 引用记录，Enter 发送": "Ketik pesan, @ untuk mereferensikan catatan, Enter untuk mengirim",
  "切换 LLM 失败：{message}": "Gagal mengganti konfigurasi LLM: {message}",
  "停止失败：{message}": "Gagal menghentikan: {message}",
  "agent 循环轮次（模型调用次数）": "Putaran loop agent (jumlah panggilan model)",
  "{n} 轮": "{n} putaran",
  "向上滚动加载更早的消息…": "Gulir ke atas untuk memuat pesan sebelumnya…",
  "Agent 正在回复，可输入 /btw 提问…": "Agent sedang membalas — ketik /btw untuk bertanya…",
  "选择对话「{title}」": "Pilih percakapan \u201c{title}\u201d",
  双击重命名: "Klik dua kali untuk mengganti nama",

  已置顶: "Disematkan",

  新对话: "Percakapan baru",

  "Agent 正在运行": "Agent sedang berjalan",
  运行中: "Berjalan",

  "管理对话「{title}」": "Kelola percakapan \u201c{title}\u201d",
  重命名: "Ganti nama",

  取消置顶: "Lepas sematan",

  置顶: "Sematkan",

  删除: "Hapus",

  "删除对话「{title}」？": "Hapus percakapan \u201c{title}\u201d?",
  "此操作不可撤销。": "Tindakan ini tidak dapat dibatalkan.",
  取消: "Batal",

  "展开「{name}」": "Perluas \u201c{name}\u201d",
  "收起「{name}」": "Tutup \u201c{name}\u201d",
  当前对话在此分组内: "Percakapan saat ini berada di grup ini",

  "{n} 个对话运行中": "{n} percakapan sedang berjalan",
  "共 {n} 个": "Total {n}",
  "{a} / {b} 个": "{a} / {b}",
  "删除失败：{message}": "Penghapusan gagal: {message}",
  对话不存在: "Percakapan tidak ada",

  "已删除 {n} 个对话": "{n} percakapan dihapus",
  "#{id}（{error}）": "#{id} ({error})",
  "；": "; ",
  "{n} 个对话删除失败：{details}{more}": "{n} percakapan gagal dihapus: {details}{more}",
  " 等": " dan lainnya",
  "批量删除失败：{message}": "Penghapusan massal gagal: {message}",
  "取消置顶失败：{message}": "Melepas sematan gagal: {message}",
  "置顶失败：{message}": "Menyematkan gagal: {message}",
  "重命名失败：{message}": "Ganti nama gagal: {message}",
  新建对话: "Percakapan baru",

  "按 Agent 筛选对话": "Filter percakapan per Agent",
  "全部 Agent": "Semua Agent",
  "{name}（{count}）": "{name} ({count})",
  选择当前筛选的全部对话: "Pilih semua percakapan pada filter saat ini",

  "已选 {n} 个": "{n} dipilih",
  完成: "Selesai",

  多选: "Pilih banyak",

  暂无对话: "Belum ada percakapan",

  "该 Agent 暂无对话": "Belum ada percakapan untuk Agent ini",
  加载更多: "Muat lebih banyak",

  对话已被删除: "Percakapan sudah dihapus",

  "正在加载对应对话…": "Memuat percakapan…",
  "删除选中的 {n} 个对话？": "Hapus {n} percakapan terpilih?",
  "对话消息和执行记录将一并删除，此操作不可撤销。":
    "Pesan percakapan dan catatan eksekusi juga akan dihapus. Tindakan ini tidak dapat dibatalkan.",
  删除中: "Menghapus",

  确认删除: "Konfirmasi hapus",
} satisfies Record<string, string>;

export default messages;

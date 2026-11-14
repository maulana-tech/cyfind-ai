/**
 * Agent editor drawer (agent-editor.tsx): konfigurasi, prompt, wrap-up,
 * visibilitas MCP/Skill, binding tool, dan trigger agent kustom.
 */

const messages = {
  // Tab prompt: toast & dialog
  "保存失败：{error}": "Gagal menyimpan: {error}",
  "恢复失败：{error}": "Gagal memulihkan: {error}",
  "渲染错误：{error}": "Kesalahan render: {error}",
  "预览失败：{error}": "Pratinjau gagal: {error}",
  "已保存为版本 v{version}": "Tersimpan sebagai versi v{version}",
  "已恢复为内置默认（v{version}）": "Dipulihkan ke default bawaan sistem (v{version})",
  已恢复为内置默认: "Dipulihkan ke default bawaan sistem",

  "收尾配置已保存（下次运行生效）": "Konfigurasi wrap-up tersimpan (berlaku untuk eksekusi berikutnya)",
  "已清空，将使用内置默认": "Dikosongkan; default bawaan sistem akan dipakai",
  "任务超时收尾配置已保存（下次运行生效）":
    "Konfigurasi wrap-up timeout tugas tersimpan (berlaku untuk eksekusi berikutnya)",
  "已加载 v{version} 到编辑器，确认后点「保存为新版本」":
    'v{version} dimuat ke editor; klik "Simpan sebagai Versi Baru" setelah selesai',
  "已保存运行配置（立即生效）": "Konfigurasi eksekusi tersimpan (langsung berlaku)",
  "未找到 Agent：{key}": "Agent tidak ditemukan: {key}",
  配置与提示词: "Konfigurasi & Prompt",

  预览渲染: "Pratinjau Render",

  渲染预览: "Pratinjau Render",

  "所有 {{.Var}} 已由后端用示例值替换。": "Semua {{.Var}} telah diganti oleh backend dengan nilai contoh.",
  保存为新版本: "Simpan sebagai Versi Baru",

  恢复默认: "Pulihkan Bawaan",

  加载到编辑器: "Muat ke Editor",

  与当前版本对比: "Bandingkan dengan Versi Saat Ini",

  "版本对比：v{old} → v{new}（当前）": "Perbandingan versi: v{old} → v{new} (saat ini)",
  "- 删除": "- Dihapus",
  "+ 新增": "+ Ditambahkan",
  版本历史: "Riwayat Versi",

  当前: "Saat ini",

  "（暂无保存的版本，使用内置默认）": "(Belum ada versi tersimpan; memakai default bawaan sistem)",
  "（无备注）": "(Tanpa catatan)",
  "（空）": "(Kosong)",

  // Bagian LLM / konfigurasi eksekusi
  "默认模型（LLM 配置）": "Model Bawaan (Profil LLM)",
  "跟随任务 / 全局激活配置": "Ikuti tugas / profil aktif global",
  " · 默认": " · Bawaan",
  "为该 Agent 绑定固定 LLM 配置（点「保存配置」生效）。优先级：Agent 绑定 > 任务/会话指定 > 全局激活。":
    'Ikat profil LLM tetap untuk Agent ini (berlaku setelah klik "Simpan Konfigurasi"). Prioritas: ikatan Agent > pengaturan tugas/sesi > profil aktif global.',
  "最大循环次数（0=不限）": "Jumlah iterasi maksimum (0 = tanpa batas)",
  "运行时长（秒，0=不限）": "Durasi eksekusi (detik, 0 = tanpa batas)",
  保存配置: "Simpan Konfigurasi",

  网络搜索: "Pencarian Web",

  "为该 Agent 开启后（点上方保存生效），可用 web_search 联网检索":
    "Setelah diaktifkan untuk Agent ini (berlaku setelah menyimpan di atas), web_search dapat mencari di internet",
  "需先在「系统配置」开启网络搜索并配置后端，才能在此启用":
    "Aktifkan Pencarian Web di Pengaturan Sistem dan konfigurasikan backend terlebih dahulu",
  "交互式 Shell": "Shell Interaktif",
  "为该 Agent 开启后（点上方保存生效），可用持久 PTY 会话工具（shell_open/send/read/close/list）驱动 msfconsole/ssh/REPL 等交互程序":
    "Setelah diaktifkan untuk Agent ini (berlaku setelah menyimpan di atas), tool sesi PTY persisten (shell_open/send/read/close/list) dapat menjalankan program interaktif seperti msfconsole/ssh/REPL",

  // Variabel & isi prompt
  "变量（点击插入占位符，渲染时由运行时数据替换）":
    "Variabel (klik untuk menyisipkan placeholder; diganti dengan data runtime saat render)",
  "示例：{example}": "Contoh: {example}",
  "（无变量）": "(Tidak ada variabel)",
  留空则使用内置默认提示词: "Kosongkan untuk memakai prompt default bawaan sistem",

  // Visibilitas & binding tool
  "已取消 MCP「{name}」可见": 'MCP "{name}" tidak lagi terlihat oleh agent ini',
  "已开启 MCP「{name}」可见": 'MCP "{name}" kini terlihat oleh agent ini',
  "已取消 Skill「{name}」可见": 'Skill "{name}" tidak lagi terlihat oleh agent ini',
  "已开启 Skill「{name}」可见": 'Skill "{name}" kini terlihat oleh agent ini',
  "已解绑工具「{key}」": 'Tool "{key}" dilepas',
  "已绑定工具「{key}」": 'Tool "{key}" terikat',
  "保存工具绑定失败：{error}": "Gagal menyimpan ikatan tool: {error}",
  "勾选此 Agent 可见的 MCP 服务器。": "Pilih server MCP yang dapat dilihat Agent ini.",
  "（暂无 MCP）": "(Tidak ada MCP)",
  "勾选此 Agent 可见的 Skill。": "Pilih Skill yang dapat dilihat Agent ini.",
  "（暂无 Skill）": "(Tidak ada Skill)",
  "勾选绑定给此 Agent 的内置工具。": "Pilih tool bawaan yang terikat ke Agent ini.",
  流量: "Traffic",

  已停用: "Dinonaktifkan",

  需开启流量捕获: "Perekaman traffic harus diaktifkan",

  "（暂无工具）": "(Tidak ada tool)",

  // Tab wrap-up
  收尾提示词: "Prompt Wrap-up",

  "当此 Agent 因": "Saat Agent ini dihentikan karena ",
  超时: "waktu habis",

  或: " atau ",

  步数耗尽: "langkah habis",

  "被终止时，系统会注入这段「收尾提示词」跑一轮收尾： 先把已识别但未落库的内容写回，再输出一句总结（避免烂尾）。留空则使用内置默认。":
    ', sistem menyuntikkan "prompt wrap-up" ini untuk menjalankan satu putaran wrap-up: pertama simpan hal yang sudah terdeteksi tapi belum masuk basis data, lalu keluarkan ringkasan singkat (menghindari run yang menggantung). Kosongkan untuk memakai default bawaan sistem.',
  收尾提示词正文: "Isi Prompt Wrap-up",

  自定义: "Kustom",

  使用内置默认: "Memakai bawaan sistem",

  留空则使用内置默认收尾提示词: "Kosongkan untuk memakai prompt wrap-up default bawaan sistem",

  "收尾轮数（收尾阶段自身最多跑几轮；0=用内置默认 {turns} 轮）":
    "Jumlah putaran wrap-up (maks putaran fase wrap-up itu sendiri; 0 = default bawaan sistem {turns} putaran)",
  保存: "Simpan",

  "内置默认（只读，供参考）": "Bawaan bawaan sistem (hanya baca, sebagai referensi)",
  任务超时收尾: "Wrap-up timeout tugas",

  "（与上面的 per-run 收尾是": " (ini mekanisme ",
  两套: "terpisah",

  "）：当": " dari wrap-up per-run di atas): disuntikkan saat ",
  整个任务: "seluruh tugas",

  "到达超时上限、即将结束时注入。 与 per-run 语义常相反（如 planner：per-run 说“别停继续规划”，任务超时说“到点停止、做最后判定”）。留空则用内置默认。":
    " mencapai batas timeout dan akan selesai. Semantiknya sering berlawanan dengan wrap-up per-run (mis. planner: per-run bilang “jangan berhenti, terus rencanakan”, timeout tugas bilang “berhenti sekarang, buat keputusan akhir”). Kosongkan untuk memakai default bawaan sistem.",
  任务超时收尾提示词正文: "Isi Prompt Wrap-up Timeout Tugas",

  留空则使用内置默认任务超时收尾提示词: "Kosongkan untuk memakai prompt wrap-up timeout tugas default bawaan sistem",

  "收尾轮数（0=用内置默认 {turns} 轮）": "Jumlah putaran wrap-up (0 = default bawaan sistem {turns} putaran)",

  // Tab trigger
  触发: "Trigger",

  "保存策略失败：{error}": "Gagal menyimpan kebijakan: {error}",
  至少选择一种触发条件: "Pilih setidaknya satu kondisi pemicu",

  工具调用触发至少选择一个工具: "Pemicu panggilan tool memerlukan setidaknya satu tool",

  已保存修改: "Perubahan tersimpan",

  已添加触发器: "Trigger ditambahkan",

  "添加失败：{error}": "Gagal menambahkan: {error}",
  "删除失败：{error}": "Gagal menghapus: {error}",
  "每 {sec}s": "Setiap {sec}s",
  "发现 finding": "Finding ditemukan",
  目标达成: "Target tercapai",

  任务超时: "Timeout tugas",

  "工具调用({n})": "Panggilan tool ({n})",
  任务创建: "Tugas dibuat",

  "（无条件）": "(Tanpa kondisi)",
  "触发器让这个自定义 Agent 自动运行：每次触发都": "Trigger membuat Agent kustom ini berjalan otomatis; setiap pemicu ",
  新建一个会话运行: "memulai sesi percakapan baru",

  "（在「对话」页可见）。 可多选触发条件；系统会把「本次为何触发 + 相关任务/finding/目标」自动附加到你写的基础消息后面。":
    ' (terlihat di halaman Chat). Anda dapat memilih banyak kondisi; sistem menambahkan "alasan pemicu + tugas/finding/target terkait" ke pesan dasar Anda.',
  "触发后处理策略（决定触发如何排队/合并运行）":
    "Perilaku pasca-pemicu (menentukan antrean dan penggabungan eksekusi pemicu)",
  运行模式: "Mode Eksekusi",

  "串行（排队，一次一个）": "Serial (berantre, satu per satu)",
  "并行（各自并发会话）": "Paralel (sesi konkuren)",
  合并模式: "Mode Gabung",

  按任务合并: "Gabung per tugas",

  全部合并成一条: "Gabungkan semua",

  不合并: "Tanpa penggabungan",

  "最大并发（0=不限）": "Konkurensi maks (0 = tanpa batas)",
  "并行：每次触发立即各开一个会话并发运行，不合并；超过最大并发的触发排队等空位。":
    "Paralel: setiap pemicu langsung membuka sesinya sendiri dan berjalan konkuren, tanpa digabung; pemicu yang melebihi konkurensi maks mengantre menunggu slot kosong.",
  "串行·按任务合并：同 agent 一次跑一个；排队中同一任务的事件触发合并成一条会话。":
    "Serial · gabung per tugas: satu perjalanan per agent; peristiwa untuk tugas yang sama di antrean digabung menjadi satu sesi.",
  "串行·全部合并：同 agent 一次跑一个；取队列时把当前排队的所有触发合并成一条会话。":
    "Serial · gabung semua: satu perjalanan per agent; saat mengambil dari antrean, semua pemicu yang sedang mengantre digabung menjadi satu sesi.",
  "串行·不合并：同 agent 一次跑一个；每条触发各自一个会话。":
    "Serial · tanpa penggabungan: satu perjalanan per agent; setiap pemicu mendapat sesinya sendiri.",
  "编辑触发器 #{id}（改完点「保存修改」）": 'Edit trigger #{id} (klik "Simpan Perubahan" setelah selesai)',
  "新增触发器（每种条件可填各自的用户消息）": "Trigger baru (setiap kondisi dapat memiliki pesan pengguna sendiri)",
  定时触发: "Pemicu terjadwal",

  每: "Setiap",

  秒: "detik",

  "定时触发时发给 agent 的话，如：巡检所有任务":
    "Pesan yang dikirim ke agent pada setiap pemicu terjadwal, mis. periksa semua tugas",
  "发现 finding 时触发": "Pemicu saat finding ditemukan",
  "发现 finding 时发给 agent 的话（系统会附带任务与 finding 详情）":
    "Pesan yang dikirim ke agent saat finding ditemukan (sistem melampirkan detail tugas dan finding)",
  目标达成时触发: "Pemicu saat target tercapai",

  "目标达成时发给 agent 的话（系统会附带任务与达成的目标）":
    "Pesan yang dikirim ke agent saat target tercapai (sistem melampirkan tugas dan target yang tercapai)",
  任务超时时触发: "Pemicu saat timeout tugas",

  "任务超时时发给 agent 的话（系统会附带任务编号与目标）":
    "Pesan yang dikirim ke agent saat tugas timeout (sistem melampirkan ID tugas dan target)",
  工具调用时触发: "Pemicu saat tool dipanggil",

  "选择要监听的工具（至少一个）；任务执行中这些工具每次":
    "Pilih tool yang dipantau (setidaknya satu); selama eksekusi tugas, setiap ",
  调用完成: "penyelesaian panggilan tool",

  "都会触发。已选 {n} 个。": " pada tool ini memicu trigger. {n} dipilih.",
  "（工具列表为空）": "(Daftar tool kosong)",
  "工具被调用时发给 agent 的话（系统会附带任务信息、工具入参与返回内容）":
    "Pesan yang dikirim ke agent saat tool dipanggil (sistem melampirkan info tugas, argumen tool, dan isi hasil)",
  任务创建时触发: "Pemicu saat tugas dibuat",

  "任务被创建时发给 agent 的话（系统会附带任务编号与目标）":
    "Pesan yang dikirim ke agent saat tugas dibuat (sistem melampirkan ID tugas dan target)",
  保存修改: "Simpan Perubahan",

  添加触发器: "Tambah Trigger",

  取消编辑: "Batal Edit",

  已有触发器: "Trigger yang Ada",

  "（暂无）": "(Belum ada)",
  "定时：{message}": "Terjadwal: {message}",
  "finding：{message}": "Finding: {message}",
  "目标：{message}": "Target: {message}",
  "超时：{message}": "Timeout: {message}",
  "任务创建：{message}": "Tugas dibuat: {message}",
  "工具：": "Tool:",
  "（未选）": "(tidak dipilih)",
  "消息：{message}": "Pesan: {message}",
  编辑: "Edit",

  删除: "Hapus",
} satisfies Record<string, string>;

export default messages;

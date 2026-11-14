/**
 * System → Command Intercept (halaman intercept perintah), kunci sumber = string zh-CN asli.
 */

const messages = {
  "{date} · {calls} 次 · {total} tokens": "{date} · {calls} kali · {total} token",
  "在 shell 中执行命令": "Jalankan perintah di shell",
  "发起 HTTP/HTTPS 请求（含代理支持）": "Kirim permintaan HTTP/HTTPS (dengan dukungan proxy)",
  网络搜索: "Pencarian web",

  "开启持久 PTY 交互会话": "Buka sesi interaktif PTY yang persisten",
  向交互会话发送输入: "Kirim input ke sesi interaktif",

  读取交互会话输出: "Baca keluaran sesi interaktif",

  关闭交互会话: "Tutup sesi interaktif",

  列出所有交互会话: "Daftar semua sesi interaktif",

  写入文件: "Tulis file",

  "编辑文件（精确替换）": "Edit file (penggantian persis)",
  批量编辑文件: "Edit massal file",

  执行类: "Eksekusi",

  "写入/编辑类": "Tulis / Edit",
  系统工具: "Tools sistem",

  自定义工具: "Tools kustom",

  允许: "Izinkan",

  禁止: "Tolak",

  申请: "Minta",

  加载模型兜底配置失败: "Gagal memuat konfigurasi fallback model",

  保存失败: "Gagal menyimpan",

  模型兜底配置已保存: "Konfigurasi fallback model disimpan",

  已恢复内置默认模板: "Template bawaan dipulihkan",

  恢复失败: "Gagal memulihkan",

  模型兜底审批: "Persetujuan fallback model",

  在: "Hanya perintah ",

  拦截范围: "Cakupan intercept",

  "内、且": " yang berada di dalamnya dan ",
  没有任何拦截规则命中: "tidak cocok dengan aturan intercept mana pun",

  "的命令，才由模型做语义判断（放行 / 转人工 / 拦截）":
    ", yang akan dinilai secara semantik oleh model (izinkan / teruskan ke manusia / blokir)",
  已启用: "Aktif",

  未启用: "Nonaktif",

  "审批 Token 消耗": "Penggunaan Token persetujuan",
  "模型兜底审批累计用量,单独计量(worker=judge),不与各模型配置的统计混在一起":
    "Akumulasi penggunaan persetujuan fallback model, dihitung terpisah (worker=judge), tidak dicampur dengan statistik tiap konfigurasi model",
  刷新: "Muat ulang",

  审批调用: "Panggilan persetujuan",

  "输入 Token": "Token masukan",
  "输出 Token": "Token keluaran",
  缓存读: "Baca cache",

  缓存写: "Tulis cache",

  "近 30 天每日消耗(输入 + 输出)": "Pemakaian harian 30 hari terakhir (masukan + keluaran)",
  审批提示词: "Prompt persetujuan",

  "模型据此判定 ALLOW / ASK / DENY，可直接编辑":
    "Model menentukan ALLOW / ASK / DENY berdasarkan ini; dapat langsung diedit",
  恢复默认模板: "Pulihkan template bawaan",

  留空使用内置模板: "Kosongkan untuk memakai template bawaan",

  "{n} 字": "{n} karakter",
  判定模型与策略: "Model & strategi penilaian",

  审批模型: "Model persetujuan",

  跟随激活配置: "Ikuti konfigurasi aktif",

  "{name}（{model}）": "{name} ({model})",
  "模型判定超时（秒）": "Timeout penilaian model (detik)",
  "模型失败时（出错 / 超时 / 无法解析）": "Saat model gagal (error / timeout / tak terurai)",
  放行: "Izinkan",

  转人工审批: "Teruskan ke persetujuan manusia",

  拦截: "Blokir",

  "人工审批（模型判为「转人工」时）": "Persetujuan manusia (saat model memutuskan “teruskan ke manusia”)",
  "审批等待超时（秒）": "Timeout tunggu persetujuan (detik)",
  超时后默认动作: "Aksi bawaan setelah timeout",

  "保存中…": "Menyimpan…",
  保存配置: "Simpan konfigurasi",

  加载拦截规则失败: "Gagal memuat aturan intercept",

  名称不能为空: "Nama wajib diisi",

  模式不能为空: "Pola wajib diisi",

  正则表达式语法无效: "Sintaks regular expression tidak valid",

  规则已更新: "Aturan diperbarui",

  规则已创建: "Aturan dibuat",

  规则已删除: "Aturan dihapus",

  加载失败: "Gagal memuat",

  拦截范围已保存: "Cakupan intercept disimpan",

  命令拦截: "Intercept Perintah",

  "工具执行前先按拦截规则匹配；未命中的命令可交由模型兜底判定":
    "Perintah dicocokkan dengan aturan intercept sebelum tools dieksekusi; perintah yang tidak cocok dapat dinilai oleh model sebagai fallback",
  "未启用任何工具 — 拦截规则与模型兜底均不会生效":
    "Tidak ada tools yang diaktifkan — aturan intercept maupun fallback model tidak akan berlaku",
  "{n} 个工具": "{n} tools",
  "、": ", ",
  调整范围: "Atur cakupan",

  拦截规则: "Aturan Intercept",

  模型配置: "Konfigurasi model",

  "按优先级（数字越大越先）逐条匹配，首条命中的规则生效":
    "Dicocokkan per baris berdasarkan prioritas (angka lebih besar lebih dulu); aturan pertama yang cocok yang berlaku",
  新建规则: "Aturan baru",

  "加载中…": "Memuat…",
  暂无规则: "Belum ada aturan",

  新建第一条规则: "Buat aturan pertama",

  优先级: "Prioritas",

  名称: "Nama",

  目标: "Target",

  类型: "Jenis",

  模式: "Pola",

  策略: "Strategi",

  启用: "Aktif",

  工具名: "Nama tools",

  输入内容: "Isi input",

  正则: "Regex",

  字符串: "String",

  编辑规则: "Edit aturan",

  "优先级越大越先匹配；首条命中规则生效，后续跳过":
    "Prioritas lebih besar dicocokkan lebih dulu; aturan pertama yang cocok yang berlaku, sisanya dilewati",
  给规则起个名字: "Beri nama untuk aturan ini",

  "优先级（数字越大越先匹配）": "Prioritas (angka lebih besar dicocokkan lebih dulu)",
  匹配目标: "Target pencocokan",

  "工具名（tool_name）": "Nama tools (tool_name)",
  "输入内容（tool_input JSON）": "Isi input (tool_input JSON)",
  匹配类型: "Jenis pencocokan",

  字符串包含: "Berisi string",

  正则表达式: "Regular expression",

  "包含 Go RE2 扩展语法（如 ": "Berisi sintaks lanjutan Go RE2 (mis. ",
  "），浏览器无法预览，提交后由服务端验证":
    ") yang tidak dapat dipratinjau di browser, akan divalidasi oleh server saat disimpan",
  拦截策略: "Strategi intercept",

  "允许 — 直接放行，跳过后续规则": "Izinkan — lolos langsung, lewati aturan berikutnya",
  "禁止 — 阻断，返回拒绝消息给模型": "Tolak — blokir dan kembalikan pesan penolakan ke model",
  "向用户申请 — 等待审批": "Minta izin pengguna — tunggu persetujuan",
  "拒绝消息（返回给模型）": "Pesan penolakan (dikembalikan ke model)",
  "审批说明（可选）": "Keterangan persetujuan (opsional)",
  操作被安全策略阻止: "Operasi ini diblokir oleh kebijakan keamanan",

  启用审批超时: "Aktifkan timeout persetujuan",

  "超时后自动处置，不再等待": "Ditangani otomatis setelah timeout, tidak perlu menunggu",
  "超时时间（秒）": "Waktu timeout (detik)",
  超时动作: "Aksi saat timeout",

  自动拒绝: "Tolak otomatis",

  自动允许: "Izinkan otomatis",

  启用此规则: "Aktifkan aturan ini",

  取消: "Batal",

  保存: "Simpan",

  "只有启用拦截的工具才会进入规则匹配；其余工具直接放行":
    "Hanya tools yang mengaktifkan intercept yang masuk ke pencocokan aturan; tools lain langsung lolos",
} satisfies Record<string, string>;

export default messages;

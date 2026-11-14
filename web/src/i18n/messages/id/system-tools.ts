/**
 * System tools catalog page translations (keys are the original zh-CN strings).
 */

const messages = {
  工具: "Alat",

  "系统工具的描述/绑定，以及自定义工具(command/script/http)":
    "Deskripsi/ikatan tool sistem, serta tool kustom (command/script/http)",
  "搜索工具名、描述、Agent…": "Cari nama tool, deskripsi, agent…",
  系统工具: "Tool sistem",

  自定义工具: "Tool kustom",

  "{a} / {b} 个匹配，点击卡片编辑描述、参数默认值与 Agent 绑定":
    "{a} / {b} cocok — klik kartu untuk mengubah deskripsi, nilai default parameter, dan ikatan Agent",
  "共 {n} 个，点击卡片编辑描述、参数默认值与 Agent 绑定":
    "{n} total — klik kartu untuk mengubah deskripsi, nilai default parameter, dan ikatan Agent",
  没有匹配的系统工具: "Tidak ada tool sistem yang cocok",

  "（暂无系统工具，等待后端 seed）": "(belum ada tool sistem — menunggu seed dari backend)",
  "shell/command/script/http，{a} / {b} 个匹配，点击卡片编辑":
    "shell/command/script/http — {a} / {b} cocok, klik kartu untuk mengubah",
  "shell(bash 声明) / command(命令) / script(Python) / http(API)，共 {n} 个，点击卡片编辑":
    "shell (deklarasi bash) / command (perintah shell) / script (Python) / http (API) — {n} total, klik kartu untuk mengubah",
  新建自定义工具: "Tool kustom baru",

  没有匹配的自定义工具: "Tidak ada tool kustom yang cocok",

  "（暂无自定义工具，点击右上角「新建自定义工具」）": "(belum ada tool kustom — klik “Tool kustom baru” di kanan atas)",
  "编辑描述、参数默认值与 Agent 绑定": "Ubah deskripsi, nilai default parameter, dan ikatan Agent",
  "已保存工具「{key}」": "Tool “{key}” disimpan",
  "保存失败：{message}": "Gagal menyimpan: {message}",
  "已恢复「{key}」为代码默认": "“{key}” dipulihkan ke default kode",
  "恢复失败：{message}": "Gagal memulihkan: {message}",
  该工具依赖: "Tool ini memerlukan ",

  流量捕获: "Traffic capture",

  "。请先在「系统配置」开启流量捕获，才能绑定给 Agent 并启用。":
    ". Aktifkan traffic capture di System Settings terlebih dahulu, lalu ikat ke Agent dan nyalakan.",
  "绑定 Agent（决定该工具给哪些 Agent）": "Ikat Agent (menentukan Agent mana yang menerima tool ini)",
  "（无 Agent）": "(tanpa Agent)",
  启用: "Aktif",

  "工具描述（发送给模型）": "Deskripsi tool (dikirim ke model)",
  "参数（名称 / 类型 / 必填只读；描述与默认值可改）":
    "Parameter (nama / jenis / wajib hanya-baca; deskripsi dan default bisa diubah)",
  "（无参数）": "(tanpa parameter)",
  必填: "Wajib",

  "items 子字段": "sub-field items",
  描述: "Deskripsi",

  默认值: "Nilai default",

  "（空=无默认）": "(kosong = tanpa default)",
  仅标量支持: "Hanya skalar",

  保存: "Simpan",

  恢复默认: "Pulihkan bawaan",

  系统: "Sistem",

  "自定义·{kind}": "Kustom · {kind}",
  已停用: "Dinonaktifkan",

  "累计调用 {n} 次": "Total {n} panggilan",
  "调用 {n}": "{n} panggilan",
  "（无描述）": "(tanpa deskripsi)",
  "（未绑定 Agent）": "(belum terikat ke Agent)",
  "编辑 {key}": "Ubah {key}",
  "shell=bash 环境声明(只需名称+描述，告知模型可用 bash 调用)；command/script/http 需写执行规格。":
    "shell = deklarasi lingkungan bash (hanya nama + deskripsi; memberi tahu model bahwa bash bisa dipanggil). command/script/http perlu spesifikasi eksekusi.",
  "如 nmap_scan": "mis. nmap_scan",
  "描述(发给模型)": "Deskripsi (dikirim ke model)",
  类型: "Jenis",

  "shell（bash 环境声明）": "shell (deklarasi lingkungan bash)",
  "command（shell 命令模板）": "command (template perintah shell)",
  "script（Python 脚本）": "script (skrip Python)",
  "http（API 请求）": "http (permintaan API)",
  '适合 nmap、sqlmap、ffuf 等出名工具——模型已知用法，只需声明"可在 bash 中调用"即可。名称+描述会追加到 Bash 工具描述里。':
    "Untuk tool terkenal seperti nmap, sqlmap, ffuf — model sudah tahu cara pakainya; cukup deklarasikan bahwa tool bisa dipanggil dari bash. Nama + deskripsi ditambahkan ke deskripsi tool Bash.",
  "命令模板（占位符 {param}，如 nmap -p {ports} {target}）":
    "Template perintah (placeholder {param}, mis. nmap -p {ports} {target})",
  'Python 正文（参数走 stdin JSON / os.environ["TOOL_X"]）':
    'Isi Python (parameter via stdin JSON / os.environ["TOOL_X"])',
  "URL（可含 {param}）": "URL (boleh mengandung {param})",
  "Headers（JSON，可含 {param}）": "Headers (JSON, boleh mengandung {param})",
  "Body（可含 {param}）": "Body (boleh mengandung {param})",
  "代理 URL（空=直连）": "URL proxy (kosong = langsung)",
  走记录代理: "Gunakan proxy rekaman",

  "超时(ms，空=默认)": "Timeout (ms, kosong = bawaan)",
  "参数 JSON Schema": "JSON Schema parameter",
  "（http 工具必填，需含 properties）": "(wajib untuk tool http; harus memuat properties)",
  "（留空 = 自动给 {args} 薄壳）": "(kosong = bungkus otomatis dengan {args})",
  "绑定 Agent": "Ikat Agent",
  "deferred（大量不常用工具才开）": "deferred (hanya aktifkan untuk banyak tool yang jarang dipakai)",
  "测试运行（用当前表单，不会保存）": "Tes jalankan (pakai formulir saat ini; tidak ada yang disimpan)",
  '示例参数 JSON，如 {"target":"example.com"}': 'Contoh JSON params, mis. {"target":"example.com"}',
  "运行中…": "Berjalan…",
  测试运行: "Tes jalankan",

  "（无输出）": "(tanpa output)",
  创建: "Buat",

  删除: "Hapus",

  "key 需小写字母开头，仅含小写字母/数字/下划线":
    "key harus diawali huruf kecil dan hanya berisi huruf kecil, angka, dan garis bawah",
  "参数 JSON Schema 格式错误": "JSON Schema parameter tidak valid",
  "headers JSON 格式错误": "JSON headers tidak valid",
  "http 工具必须提供参数 JSON Schema（含 properties，不能留空）":
    "Tool http harus memiliki JSON Schema parameter (harus memuat properties; tidak boleh kosong)",
  已创建自定义工具: "Tool kustom dibuat",

  已保存: "Tersimpan",

  已删除: "Dihapus",

  "删除失败：{message}": "Gagal menghapus: {message}",
  "测试参数 JSON 格式错误": "JSON params tes tidak valid",
} satisfies Record<string, string>;

export default messages;

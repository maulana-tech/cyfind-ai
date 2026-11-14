/**
 * Pesan error mock API handler (lib/mock/handler.ts), fase arsip, dan label
 * respons demo (kunci sumber adalah string zh-CN asli).
 */

const messages = {
  任务不存在: "Tugas tidak ditemukan",

  排队中的任务必须先暂停: "Tugas dalam antrean harus dijeda terlebih dahulu",

  运行中的任务必须先暂停: "Tugas yang berjalan harus dijeda terlebih dahulu",

  任务已经在归档队列中: "Tugas sudah berada dalam antrean arsip",

  "任务被未归档任务 #{id} 直接继承，暂不能归档":
    "Tugas diwarisi langsung oleh tugas yang belum diarsipkan #{id}, belum bisa diarsipkan",
  归档不存在: "Arsip tidak ditemukan",

  当前归档状态不可还原: "Status arsip saat ini tidak dapat dipulihkan",

  当前归档状态不可永久删除: "Status arsip saat ini tidak dapat dihapus permanen",

  "归档仍被任务 #{id} 依赖，无法永久删除": "Arsip masih dirujuk oleh tugas #{id} dan tidak dapat dihapus permanen",
  等待归档: "Menunggu untuk diarsipkan",

  压缩任务数据: "Mengompres data tugas",

  归档完成: "Arsip selesai",

  等待还原: "Menunggu untuk dipulihkan",

  恢复任务数据: "Memulihkan data tugas",

  等待永久删除: "Menunggu untuk dihapus permanen",

  删除归档包: "Menghapus paket arsip",

  "task_ids 数量必须为 1-100": "task_ids must contain 1-100 entries",
  任务分类不存在: "Kategori tugas tidak ditemukan",

  分类名称不能为空: "Nama kategori tidak boleh kosong",

  分类名称已存在: "Nama kategori sudah ada",

  新任务: "Tugas baru",

  "请填写模板名称、描述和目标": "Isi nama, deskripsi, dan tujuan template",
  模板名称已存在: "Nama template sudah ada",

  任务状态已变化: "Status tugas sudah berubah",

  终态任务不可控制: "Tugas dalam status akhir tidak bisa dikontrol",

  任务已经暂停: "Tugas sudah dijeda",

  任务未暂停: "Tugas belum dijeda",

  未关联资产: "Aset tidak terkait",

  资产不存在: "Aset tidak ditemukan",

  任务或资产不存在: "Tugas atau aset tidak ditemukan",

  资产未关联当前任务: "Aset tidak terkait dengan tugas saat ini",

  "资产 #{id}": "Aset #{id}",
  请填写有效测试范围: "Masukkan ruang lingkup pengujian yang valid",

  "第 {n} 条范围无效：{error}": "Entri ruang lingkup {n} tidak valid: {error}",
  无法识别: "Tidak dikenali",

  请选择资产并填写来源说明: "Pilih aset dan isi keterangan sumbernya",

  用户在测试资产页手工新增: "Ditambahkan manual oleh pengguna di halaman aset pengujian",

  "任务创建时关联企业：{name}": "Perusahaan yang ditautkan saat pembuatan tugas: {name}",
  关联企业不存在或无效: "Perusahaan terkait tidak ada atau tidak valid",

  企业: "Perusahaan",

  企业名称不能为空: "Nama perusahaan tidak boleh kosong",

  企业已存在: "Perusahaan sudah ada",

  企业不存在: "Perusahaan tidak ditemukan",

  "企业范围包含无效规则，未覆盖原有范围":
    "Ruang lingkup perusahaan berisi aturan yang tidak valid, ruang lingkup lama tidak diganti",
  意图不存在: "Intent tidak ditemukan",

  "Worker 状态已变化": "Status Worker sudah berubah",
  "request_id 不能为空": "request_id tidak boleh kosong",
  "request_id 已用于其他 Worker 消息": "request_id sudah dipakai untuk pesan Worker lain",
  "仅已暂停的 Worker 可以发送消息，请先暂停": "Hanya Worker yang dijeda yang bisa menerima pesan, jeda dulu",
  消息不能为空: "Pesan tidak boleh kosong",

  "消息不能超过 4000 个字符": "Pesan tidak boleh melebihi 4000 karakter",
  "LLM 配置不存在": "Profil LLM tidak ditemukan",
  "LLM 配置未设置 API Key": "Profil LLM belum mengatur API Key",
  "任务 LLM 配置链额度已耗尽": "Kuota rantai profil LLM tugas sudah habis",
  全局配置: "Profil global",

  "批量操作最多支持 100 个 ID": "Operasi massal mendukung maksimal 100 ID",
  漏洞不存在: "Temuan tidak ditemukan",

  "复测 #{id} · {name}": "Uji ulang #{id} · {name}",
  "请复测漏洞 #{id}": "Silakan uji ulang temuan #{id}",
  "演示环境未执行真实验证，无法确认漏洞当前状态。":
    "Tidak ada verifikasi nyata yang dijalankan di lingkungan demo; status temuan saat ini tidak dapat dipastikan.",
  "演示复测进行中（未向目标发送请求）":
    "Uji ulang demo sedang berlangsung (tidak ada permintaan yang dikirim ke target)",
  演示复测已停止: "Uji ulang demo dihentikan",

  证据不存在: "Bukti tidak ditemukan",

  "（demo）我已把该建议注入为一条高优意图，work agent 会尽快执行。":
    "(demo) Saran tersebut sudah saya sisipkan sebagai intent prioritas tinggi; work agent akan segera mengeksekusinya.",
  新对话: "Percakapan baru",

  "（demo）工具执行输出示例。": "(demo) Contoh keluaran eksekusi tool.",
  "审批已处理或不存在，请刷新记录": "Persetujuan sudah diproses atau tidak ada, muat ulang catatan",
  无效审批动作: "Aksi persetujuan tidak valid",

  审批记录不存在: "Catatan persetujuan tidak ditemukan",

  无效审批状态: "Status persetujuan tidak valid",

  无效判定来源: "Sumber keputusan tidak valid",

  人工允许执行: "Diizinkan manual",

  人工拒绝执行: "Ditolak manual",

  "演示模式未执行工具。": "Tool tidak dijalankan dalam mode demo.",
  演示模式不支持旁路提问: "Pertanyaan sampingan tidak didukung dalam mode demo",

  后台功能枚举意图从前序子域发现中选定:
    "Intent enumerasi fungsionalitas admin dipilih dari temuan subdomain sebelumnya",
  "订单接口测试意图从 API 任务目标中选定": "Intent pengujian API pesanan dipilih dari tujuan tugas API",
  "q 参数注入 payload，响应回显 MSSQL 报错。":
    "Payload disuntikkan melalui parameter q; respons memantulkan kesalahan MSSQL.",
  "本人订单 id=1001，作为正常对照。": "Pesanan sendiri id=1001, digunakan sebagai pembanding normal.",
  "改 id=1002 越权读到他人订单。": "Mengubah id=1002 untuk membaca pesanan pengguna lain (IDOR).",
  "Fastjson @type JNDI payload，触发回连。": "Payload JNDI @type Fastjson yang memicu callback.",
  "二次请求确认命令执行落地。": "Permintaan lanjutan yang memastikan eksekusi perintah berhasil.",
  "Jenkins Script Console 未授权可达。": "Jenkins Script Console dapat diakses tanpa autentikasi.",
  "scriptText 执行 Groovy 命令返回 SYSTEM。": "scriptText mengeksekusi perintah Groovy dan mengembalikan SYSTEM.",
  "psexec 以 svc_deploy 登录域控 DC01。": "psexec masuk ke domain controller DC01 sebagai svc_deploy.",
} satisfies Record<string, string>;

export default messages;

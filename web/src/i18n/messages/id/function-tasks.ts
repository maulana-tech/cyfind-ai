/**
 * Terjemahan halaman daftar tugas (kunci adalah string zh-CN asli).
 */

const messages = {
  "删除资产 {n} 条": "{n} aset dihapus",
  "解除共享资产关联 {n} 条": "{n} tautan aset bersama dilepas",
  "删除流量 {n} 条": "{n} catatan trafik dihapus",
  删除任务文件: "berkas tugas dihapus",

  "删除漏洞 {n} 条": "{n} temuan dihapus",
  "删除 LLM 请求/响应记录 {n} 条": "{n} catatan permintaan/tanggapan LLM dihapus",
  "任务已删除（{details}）": "Tugas dihapus ({details})",
  "，": ", ",
  任务已删除: "Tugas dihapus",

  "{summary}；部分外部数据清理未完成：{warning}":
    "{summary}; pembersihan data eksternal tidak sepenuhnya selesai: {warning}",
  "删除失败：{message}": "Penghapusan gagal: {message}",
  "任务 #{id} 已暂停": "Tugas #{id} dijeda",
  "任务 #{id} 已继续{queued}": "Tugas #{id} dilanjutkan{queued}",
  "，已进入队列": ", masuk antrean",
  "暂停失败：{message}": "Jeda gagal: {message}",
  "继续失败：{message}": "Lanjut gagal: {message}",
  "任务 #{id} 已重命名": "Tugas #{id} diganti nama",
  "重命名失败：{message}": "Ganti nama gagal: {message}",
  "任务 #{id} 已取消置顶": "Sematan tugas #{id} dilepas",
  "任务 #{id} 已置顶": "Tugas #{id} disematkan",
  "取消置顶失败：{message}": "Melepas sematan gagal: {message}",
  "置顶失败：{message}": "Menyematkan gagal: {message}",
  "任务 #{id} 已进入归档队列": "Tugas #{id} masuk antrean arsip",
  "归档失败：{message}": "Arsip gagal: {message}",
  "#{id}：{warning}": "#{id}: {warning}",
  "已删除 {n} 个任务（{details}）": "Menghapus {n} tugas ({details})",
  "已删除 {n} 个任务": "Menghapus {n} tugas",
  "；": "; ",
  "#{id}（{message}）": "#{id} ({message})",
  "{n} 个任务删除失败：{details}{more}": "{n} tugas gagal dihapus: {details}{more}",
  " 等": " dan lainnya",
  "已将 {n} 个任务加入归档队列": "Menambahkan {n} tugas ke antrean arsip",
  "{n} 个任务无法归档：{details}": "{n} tugas tidak dapat diarsipkan: {details}",
  状态已变化: "Status telah berubah",

  "一次最多控制 100 个任务": "Maksimal 100 tugas per kontrol",
  "已暂停 {n} 个任务": "Menjeda {n} tugas",
  "已继续 {n} 个任务{queued}": "Melanjutkan {n} tugas{queued}",
  "，部分任务已进入队列": ", sebagian tugas masuk antrean",
  "{n} 个任务操作失败：{details}{more}": "{n} tugas gagal: {details}{more}",
  "批量暂停失败：{message}": "Jeda massal gagal: {message}",
  "批量继续失败：{message}": "Lanjut massal gagal: {message}",
  "一次最多修改 100 个任务的分类": "Maksimal ubah kategori 100 tugas sekaligus",
  未分类: "Tanpa kategori",

  "已将 {n} 个任务移动到「{category}」": "Memindahkan {n} tugas ke \u201c{category}\u201d",
  任务已不存在: "Tugas sudah tidak ada",

  "{n} 个任务未能移动：{details}{more}": "{n} tugas gagal dipindahkan: {details}{more}",
  "修改分类失败：{message}": "Gagal mengubah kategori: {message}",
  当前任务: "Tugas Aktif",

  已归档: "Diarsipkan",

  "搜索描述 / 目标 / ID": "Cari deskripsi / tujuan / ID",
  清除搜索: "Hapus pencarian",

  状态: "Status",

  全部状态: "Semua status",

  任务分类: "Kategori tugas",

  全部分类: "Semua kategori",

  "{shown}/{total} 条": "{shown}/{total}",
  "已选 {n} 个": "{n} dipilih",
  取消选择: "Batalkan pilihan",

  "暂停 {n}": "Jeda {n}",
  "继续 {n}": "Lanjut {n}",
  "归档 {n}": "Arsipkan {n}",
  "暂无任务，点击右上角「新建任务」开始。": "Belum ada tugas. Klik \u201cTugas Baru\u201d di kanan atas untuk memulai.",
  "没有匹配的任务。": "Tidak ada tugas yang cocok.",
  选择本页全部任务: "Pilih semua tugas di halaman ini",

  名称: "Nama",

  描述: "Deskripsi",

  目标: "Tujuan",

  目标进度: "Progres tujuan",

  "严重 / 高 / 中 / 低": "Kritis / Tinggi / Sedang / Rendah",
  漏洞: "Temuan",

  "严/高/中/低": "K/T/S/R",
  "运行中 Worker": "Worker Berjalan",
  操作: "Aksi",

  "按{label}倒序排序": "Urutkan menurut {label} menurun",
  "{label}当前正序，点击切换排序方向": "{label}: menaik \u2014 klik untuk mengubah arah urutan",
  "{label}当前倒序，点击切换排序方向": "{label}: menurun \u2014 klik untuk mengubah arah urutan",
  "已开启并发限制：最多同时运行 {n} 个任务": "Batas konkurensi aktif: maksimal {n} tugas berjalan bersamaan",
  已关闭任务并发限制: "Batas konkurensi tugas dinonaktifkan",

  "保存失败：{message}": "Gagal menyimpan: {message}",
  任务并发设置: "Pengaturan konkurensi tugas",

  并发设置: "Pengaturan konkurensi",

  任务并发限制: "Batas konkurensi tugas",

  "限制同时运行的任务数量。达到上限后，新任务会按创建顺序排队并在空位出现时自动启动。":
    "Batasi jumlah tugas yang berjalan bersamaan. Saat batas tercapai, tugas baru diantrekan sesuai urutan pembuatan dan otomatis mulai saat ada slot kosong.",
  开启任务并发限制: "Aktifkan batas konkurensi tugas",

  默认关闭: "Nonaktif secara bawaan",

  同时运行上限: "Batas berjalan bersamaan",

  取消: "Batal",

  保存: "Simpan",

  "选择任务 {id}": "Pilih tugas {id}",
  已置顶: "Disematkan",

  "输入 {input} · 缓存 {cache} · 输出 {output}": "Masuk {input} · Cache {cache} · Keluar {output}",
  入: "Masuk",

  " · 缓 ": " · Cache ",
  " · 出 ": " · Keluar ",
  查看任务详情: "Lihat detail tugas",

  "任务 #{id} 名称": "Nama tugas #{id}",
  未命名: "Tanpa nama",

  "重命名任务 #{id}": "Ganti nama tugas #{id}",
  重命名: "Ganti nama",

  "取消置顶任务 #{id}": "Lepas sematan tugas #{id}",
  "置顶任务 #{id}": "Sematkan tugas #{id}",
  取消置顶: "Lepas sematan",

  置顶: "Sematkan",

  继续任务: "Lanjutkan tugas",

  暂停任务: "Jeda tugas",

  该状态不可暂停或继续: "Status ini tidak dapat dijeda atau dilanjutkan",

  排队中的任务必须先暂停: "Tugas dalam antrean harus dijeda terlebih dahulu",

  运行中或尚未结束的任务必须先暂停: "Tugas yang berjalan atau belum selesai harus dijeda terlebih dahulu",

  "任务被未归档任务 #{id} 直接继承，请先归档依赖任务":
    "Tugas diwarisi langsung oleh tugas #{id} yang belum diarsipkan; arsipkan tugas dependen terlebih dahulu",
  归档任务: "Arsipkan tugas",

  "归档 {n} 个任务": "Arsipkan {n} tugas",
  "归档会停止任务调度，将图谱、LLM 历史、文件以及独占资产和流量压缩到本地冷存储。归档完成后可从“已归档”中还原。":
    "Arsip menghentikan penjadwalan tugas serta mengompres graf, riwayat LLM, berkas, serta aset dan trafik eksklusif ke penyimpanan dingin lokal. Tugas yang diarsipkan dapat dipulihkan dari tab \u201cDiarsipkan\u201d.",
  确认归档: "Konfirmasi arsip",

  "归档任务 #{id}": "Arsipkan tugas #{id}",
  "{size} · 节省 {pct}%": "{size} · hemat {pct}%",
  "永久删除 {n} 个任务归档？": "Hapus permanen {n} arsip tugas?",
  "将永久删除约 {size} 的归档包及 {rows} 条关联数据快照。此操作不可恢复。":
    "Ini menghapus permanen sekitar {size} paket arsip beserta {rows} snapshot data terkait. Tindakan ini tidak dapat dibatalkan.",
  永久删除: "Hapus permanen",

  "读取归档列表失败：{message}": "Gagal memuat daftar arsip: {message}",
  "已将 {n} 个任务加入还原队列": "Menambahkan {n} tugas ke antrean pemulihan",
  "{n} 个任务无法还原": "{n} tugas tidak dapat dipulihkan",
  "还原失败：{message}": "Pemulihan gagal: {message}",
  "已将 {n} 个归档加入永久删除队列": "Menambahkan {n} arsip ke antrean hapus permanen",
  "{n} 个归档无法删除": "{n} arsip tidak dapat dihapus",
  "永久删除失败：{message}": "Hapus permanen gagal: {message}",
  已重新加入处理队列: "Diantrekan ulang untuk diproses",

  "重试失败：{message}": "Percobaan ulang gagal: {message}",
  "搜索任务名称 / 描述 / ID": "Cari nama tugas / deskripsi / ID",
  处理状态: "Status pemrosesan",

  等待归档: "Menunggu untuk diarsipkan",

  归档中: "Mengarsipkan",

  可还原: "Dapat dipulihkan",

  等待还原: "Menunggu untuk dipulihkan",

  还原中: "Memulihkan",

  等待删除: "Menunggu dihapus",

  删除中: "Menghapus",

  归档失败: "Arsip gagal",

  还原失败: "Pemulihan gagal",

  删除失败: "Penghapusan gagal",

  "{n} 个归档": "{n} arsip",
  "还原 {n}": "Pulihkan {n}",
  "永久删除 {n}": "Hapus {n} permanen",
  暂无任务归档: "Belum ada arsip tugas",

  "暂停或终态任务可从当前任务列表归档。":
    "Tugas yang dijeda atau sudah berakhir dapat diarsipkan dari daftar tugas saat ini.",
  选择当前页归档: "Pilih arsip di halaman ini",

  任务: "Tugas",

  原状态: "Status asal",

  分类: "Kategori",

  归档时间: "Waktu arsip",

  压缩大小: "Ukuran terkompresi",

  数据量: "Ukuran data",

  "选择任务归档 #{id}": "Pilih arsip tugas #{id}",
  "任务 #{id}": "Tugas #{id}",
  "压缩前 {size}": "Sebelum kompresi: {size}",
  重试归档操作: "Coba ulang operasi arsip",

  重试: "Coba lagi",

  还原任务: "Pulihkan tugas",

  永久删除归档: "Hapus arsip permanen",

  同时清理关联数据: "Bersihkan juga data terkait",

  全部删除: "Hapus semua",

  "选中下方全部关联数据，包括资产、流量、文件、漏洞和 LLM 请求/响应记录。":
    "Memilih semua data terkait di bawah, termasuk aset, trafik, berkas, temuan, dan catatan permintaan/tanggapan LLM.",
  关联资产: "Aset terkait",

  "删除仅属于该任务的资产；共享资产只解除当前任务关联。":
    "Menghapus aset yang hanya milik tugas ini; aset bersama hanya dilepas tautannya dari tugas ini.",
  关联流量: "Trafik terkait",

  "按关联资产的精确主机名删除；仍被其他任务引用的共享主机流量会保留。":
    "Menghapus berdasarkan hostname persis aset terkait; trafik host bersama yang masih dirujuk tugas lain tetap dipertahankan.",
  任务文件: "Berkas tugas",

  "删除该任务工作目录中的上传文件、命令输出和其他产物。":
    "Menghapus berkas yang diunggah, keluaran perintah, dan artefak lain di direktori kerja tugas ini.",
  关联漏洞: "Temuan terkait",

  "永久删除该任务产生的独立漏洞记录与漏洞报告。":
    "Menghapus permanen catatan temuan mandiri dan laporan temuan yang dihasilkan tugas ini.",
  "LLM 请求/响应记录": "Catatan permintaan/tanggapan LLM",
  "永久删除该任务录制的 LLM 请求、响应、Token 与错误详情。":
    "Menghapus permanen permintaan, tanggapan, Token, dan detail error LLM yang direkam tugas ini.",
  删除任务: "Hapus tugas",

  "确认删除任务 #{id}？": "Hapus tugas #{id}?",
  "「": "\u201c",
  "」的执行记录与探索链路将被永久删除。":
    "\u201d dan catatan eksekusi serta tautan eksplorasinya akan dihapus permanen.",
  "该任务的执行记录与探索链路将被永久删除。": "Catatan eksekusi dan tautan eksplorasi tugas ini akan dihapus permanen.",
  删除: "Hapus",

  修改分类: "Ubah kategori",

  "修改所选 {n} 个任务的分类": "Ubah kategori {n} tugas terpilih",
  "目标分类对所选任务统一生效；选「未分类」会把它们移出当前分类。":
    "Kategori tujuan berlaku seragam untuk semua tugas terpilih; memilih \u201cTanpa kategori\u201d mengeluarkannya dari kategori saat ini.",
  目标分类: "Kategori tujuan",

  选择分类: "Pilih kategori",

  "还没有任何分类，先用「分类管理」创建一个。":
    "Belum ada kategori \u2014 buat dulu lewat \u201cManajemen Kategori\u201d.",
  移动: "Pindahkan",

  "删除所选 {n}": "Hapus {n} terpilih",
  "确认删除所选 {n} 个任务？": "Hapus {n} tugas terpilih?",
  "这些任务的执行记录与探索链路将被永久删除，下方清理选项对所选任务统一生效。":
    "Catatan eksekusi dan tautan eksplorasi tugas-tugas ini akan dihapus permanen; opsi pembersihan di bawah berlaku seragam untuk tugas terpilih.",
  "…等 {n} 个": "… dan {n} lagi",
  "删除中 {done}/{total}": "Menghapus {done}/{total}",
  "删除 {n} 个任务": "Hapus {n} tugas",
  "最多关联 {n} 个任务": "Tautkan maksimal {n} tugas",
  "搜索任务 ID、描述或目标": "Cari ID, deskripsi, atau tujuan tugas",
  没有匹配的任务: "Tidak ada tugas yang cocok",

  未知任务: "Tugas tidak dikenal",

  "已创建分类「{name}」": "Kategori \u201c{name}\u201d dibuat",
  "创建分类失败：{message}": "Gagal membuat kategori: {message}",
  未知分类: "Kategori tidak dikenal",

  "搜索分类，或输入新名称后回车创建": "Cari kategori, atau ketik nama baru lalu tekan Enter untuk membuat",
  "创建分类「{name}」": "Buat kategori \u201c{name}\u201d",
  输入名称以搜索或创建分类: "Ketik nama untuk mencari atau membuat kategori",

  未配置资产范围: "Cakupan aset belum dikonfigurasi",

  "{kind}：{value}": "{kind}: {value}",
  " · 另 {n} 条": " · dan {n} lainnya",
  "企业 #{id}": "Perusahaan #{id}",
  搜索企业名称或资产范围: "Cari nama perusahaan atau cakupan aset",

  没有匹配的企业: "Tidak ada perusahaan yang cocok",

  "{n} 个资产": "{n} aset",
  域名: "Domain",

  关键词: "Kata kunci",

  松开以移动: "Lepaskan untuk memindahkan",

  "{n} 个任务": "{n} tugas",
  "拖动任务 #{id}": "Seret tugas #{id}",
  拖动任务: "Seret tugas",

  分类已创建: "Kategori dibuat",

  分类已更新: "Kategori diperbarui",

  "更新分类失败：{message}": "Gagal memperbarui kategori: {message}",
  "分类已删除，关联任务已移入未分类": "Kategori dihapus; tugas terkait dipindahkan ke Tanpa kategori",
  "删除分类失败：{message}": "Gagal menghapus kategori: {message}",
  "目标分类不存在，请刷新后重试": "Kategori tujuan sudah tidak ada; muat ulang lalu coba lagi",
  "任务 #{id} 已移至「{category}」": "Tugas #{id} dipindahkan ke \u201c{category}\u201d",
  "移动任务失败：{message}": "Gagal memindahkan tugas: {message}",
  保存中: "Menyimpan",

  创建分类: "Buat kategori",

  保存修改: "Simpan perubahan",

  分类管理: "Manajemen kategori",

  任务分类管理: "Manajemen kategori tugas",

  "分类用于任务筛选与归档；修改不会影响任务执行，删除后任务会移入未分类。":
    "Kategori dipakai untuk penyaringan dan pengarsipan tugas; mengubahnya tidak memengaruhi eksekusi tugas, dan tugas dalam kategori yang dihapus akan dipindahkan ke Tanpa kategori.",
  新建分类: "Kategori baru",

  分类名称: "Nama kategori",

  "例如：外网评估": "mis., Penilaian Jaringan Eksternal",
  "当前有 {n} 个任务使用该分类。重命名后会同步更新任务列表。":
    "Saat ini {n} tugas memakai kategori ini. Mengganti nama akan memperbarui daftar tugas.",
  "创建后可在新建任务和任务列表筛选中使用。": "Setelah dibuat, dapat dipakai di Tugas Baru dan filter daftar tugas.",
  分类任务: "Tugas Berkategori",

  未分类任务: "Tugas Tanpa Kategori",

  "该分类包含 {n} 个任务。": "Kategori ini berisi {n} tugas.",
  "当前有 {n} 个任务尚未分类。": "Saat ini ada {n} tugas yang belum dikategorikan.",
  该分类暂无任务: "Belum ada tugas di kategori ini",

  暂无未分类任务: "Belum ada tugas tanpa kategori",

  "此处将在任务归入后显示内容。": "Tugas akan muncul di sini setelah dimasukkan ke kategori ini.",
  删除分类: "Hapus kategori",

  关闭: "Tutup",

  "删除分类「{name}」？": "Hapus kategori \u201c{name}\u201d?",
  未命名分类: "Kategori tanpa nama",

  "分类删除后，其中 {n} 个任务会自动移入“未分类”，任务数据不会被删除。":
    "Setelah kategori dihapus, {n} tugas di dalamnya otomatis dipindahkan ke \u201cTanpa kategori\u201d; data tugas tidak dihapus.",
  "上传失败：{message}": "Unggahan gagal: {message}",
  请填写描述与目标: "Deskripsi dan tujuan wajib diisi",

  "最多关联 {n} 个来源任务": "Tautkan maksimal {n} tugas sumber",
  任务已创建: "Tugas dibuat",

  "创建失败：{message}": "Pembuatan gagal: {message}",
  新建任务: "Tugas Baru",

  "填写测试对象与目标，高级参数可按需展开。": "Isi objek dan tujuan pengujian; buka opsi lanjutan seperlunya.",
  "名称（可选）": "Nama (opsional)",
  "给任务起个便于识别的名字，例如：Acme 官网渗透": "Beri nama yang mudah dikenali, mis., uji penetrasi situs Acme",
  "可选，单个分类；用于任务列表筛选和归档，不影响 Agent 执行。":
    "Opsional, satu kategori; dipakai untuk penyaringan daftar tugas dan arsip, tidak memengaruhi eksekusi Agent.",
  "测试对象与背景，例如：测试 example.com 这个站点": "Objek dan latar pengujian, mis., uji situs example.com",
  上传文件: "Unggah berkas",

  "已上传 {n} 个文件，绝对路径已追加到描述末尾（可编辑）":
    "{n} berkas diunggah; path absolut ditambahkan ke akhir deskripsi (dapat diedit)",
  "可多选；上传后把文件的绝对路径追加到描述，供 worker 用 Read/Bash 打开":
    "Boleh lebih dari satu; path absolut berkas yang diunggah ditambahkan ke deskripsi agar worker dapat membukanya dengan Read/Bash",
  "要达成什么，例如：拿下后台管理权限、获取服务器权限":
    "Yang ingin dicapai, mis., dapatkan akses admin, peroleh hak akses server",
  关联任务: "Tugas terkait",

  "最多关联 {n} 个任务。实时只读继承所选任务的持久化黑板、资产范围及相关流量；新任务写入独立黑板。":
    "Tautkan maksimal {n} tugas. Tugas baru hanya mewarisi blackboard persisten, cakupan aset, dan trafik terkait dari tugas terpilih secara real-time (baca-saja); tulisan diarahkan ke blackboard sendiri.",
  关联企业资产范围: "Cakupan aset perusahaan terkait",

  "创建任务时会将所选企业当前已有资产加入“测试资产”，并将域名、IP、CIDR、ICP 和企业关键词提供给 Agent 作为范围上下文；不会自动生成意图或强制改变执行目标。":
    "Saat tugas dibuat, aset yang sudah ada pada perusahaan terpilih ditambahkan ke \u201caset pengujian\u201d, dan domain, IP, CIDR, ICP, serta kata kunci perusahaan diberikan kepada Agent sebagai konteks cakupan; ini tidak menghasilkan intent secara otomatis atau memaksa perubahan tujuan eksekusi.",
  "任务级资产拦截 / 允许规则（可选）": "Aturan blokir / izin aset tingkat tugas (opsional)",
  "仅对本任务生效，不写入全局规则。判定顺序：先按「拦截」规则（含全局）匹配，命中即禁止测试；未命中且本任务配置了「允许」规则时，须命中某条允许规则才放行，否则同样不允许测试；未配置任何允许规则则不启用白名单。":
    "Berlaku hanya untuk tugas ini dan tidak ditulis ke aturan global. Urutan pengecekan: aturan \u201cblokir\u201d (termasuk global) dicek lebih dulu \u2014 bila cocok, pengujian dilarang; bila tidak cocok dan tugas ini mengonfigurasi aturan \u201cizin\u201d, harus cocok dengan salah satu aturan izin agar diizinkan, jika tidak maka pengujian tetap dilarang; tanpa aturan izin, whitelist tidak diaktifkan.",
  "LLM 配置链": "Rantai konfigurasi LLM",
  "按列表顺序故障转移；第一项为当前配置，仅在明确额度不足时切换下一项。":
    "Failover mengikuti urutan daftar; entri pertama adalah konfigurasi aktif dan hanya berpindah ke berikutnya saat kuota benar-benar habis.",
  高级设置: "Pengaturan lanjutan",

  "超时 · 心跳 · 首个意图": "Timeout · Heartbeat · Intent pertama",
  "任务超时（分钟，可选）": "Timeout tugas (menit, opsional)",
  "留空 = 不限时": "Kosong = tanpa batas waktu",
  "到点后触发优雅收尾（各 agent 写回 + planner 终局判定），任务进入 timeout 终态。":
    "Saat batas waktu tercapai, penutupan elegan dijalankan (setiap agent menulis kembali + planner melakukan penilaian akhir) dan tugas masuk status akhir timeout.",
  "planner 心跳（分钟）": "Heartbeat planner (menit)",
  "默认 10": "Bawaan 10",
  "距上轮规划结束/任务开始满该时长且期间无触发，自动触发一轮规划（兜底卡死 + 唤醒去监督在跑的 worker）。下限 10 分钟。":
    "Bila durasi ini tercapai sejak ronde perencanaan terakhir selesai (atau tugas dimulai) tanpa pemicu di antaranya, satu ronde perencanaan berjalan otomatis (anti-gagal untuk tugas mandeg + membangunkan pengawasan worker yang berjalan). Minimum 10 menit.",
  "直接下发首个意图（描述+目标）": "Kirim intent pertama segera (deskripsi + tujuan)",
  "开启后创建即把「描述+目标」作为一条意图下发，worker 免等首轮规划直接开跑，跑完再由 planner 接手判定/补充。CTF 等常一个 work 直接解决的场景推荐开启；关闭则走标准的先规划再执行。":
    "Saat aktif, pembuatan langsung mengirim deskripsi + tujuan sebagai satu intent; worker langsung berjalan tanpa menunggu ronde perencanaan pertama, lalu planner mengambil alih untuk menilai/melengkapi. Disarankan untuk skenario seperti CTF yang sering selesai dalam satu work; bila nonaktif, alur standar rencana-lalu-eksekusi dipakai.",
  资产覆盖度功能: "Fitur cakupan aset",

  "默认开启：计算并展示测试覆盖度、态势图显示测试进度、自动累积测试范围。关闭后不再计算/展示覆盖度，态势图仅展示资产不显示进度，agent 也不再获得范围类工具。关闭不影响「关联企业资产范围」。":
    "Aktif secara bawaan: menghitung dan menampilkan cakupan pengujian, menampilkan progres pengujian di peta situasi, dan mengakumulasi cakupan pengujian secara otomatis. Bila dimatikan, cakupan tidak lagi dihitung/ditampilkan, peta situasi hanya menampilkan aset tanpa progres, dan agent tidak lagi mendapat alat terkait cakupan. Mematikan tidak memengaruhi Cakupan Aset Perusahaan Terkait.",
  创建中: "Membuat",

  创建: "Buat",

  创建时间: "Waktu dibuat",

  运行时长: "Durasi",
} satisfies Record<string, string>;

export default messages;

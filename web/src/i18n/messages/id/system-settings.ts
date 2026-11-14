/**
 * Terjemahan halaman pengaturan sistem (system/settings)
 * (kunci adalah string zh-CN asli).
 */

const messages = {
  "并发数必须是大于 0 的整数": "Kongurensi harus bilangan bulat lebih besar dari 0",
  "已保存并发工作 agent 数（对之后启动的任务生效）":
    "Jumlah agent worker disimpan (berlaku untuk tugas yang dimulai nanti)",
  "保存失败：{message}": "Gagal menyimpan: {message}",
  "已保存 Python 解释器配置": "Konfigurasi interpreter Python disimpan",
  "已开启 Agent 自动绑定流量": "Pengikatan traffic otomatis Agent diaktifkan",
  "已关闭 Agent 自动绑定流量": "Pengikatan traffic otomatis Agent dinonaktifkan",
  "已开启 noa 上下文压缩（对之后启动的运行生效）":
    "Kompaksi konteks noa diaktifkan (berlaku untuk run yang dimulai nanti)",
  "已关闭 noa 上下文压缩（恢复内置压缩）": "Kompaksi konteks noa dinonaktifkan (kompaksi bawaan dipulihkan)",
  已保存网络搜索配置: "Konfigurasi pencarian web disimpan",

  "已保存 Brave API Key": "Brave API Key disimpan",
  "已保存 Tavily API Key": "Tavily API Key disimpan",
  已保存出口代理: "Proxy egress disimpan",

  "已清除出口代理（改为直连）": "Proxy egress dihapus (dialihkan ke koneksi langsung)",
  已保存全局代理: "Proxy global disimpan",

  "已清除全局代理（改为直连）": "Proxy global dihapus (dialihkan ke koneksi langsung)",
  "搜索测试成功 · {backend} 返回 {count} 条结果": "Tes pencarian berhasil · {backend} mengembalikan {count} hasil",
  "搜索测试失败：{message}": "Tes pencarian gagal: {message}",
  未知错误: "kesalahan tidak diketahui",

  系统配置: "Pengaturan Sistem",

  全局运行时开关: "Saklar runtime global",

  流量捕获: "Penangkapan traffic",

  "开启后，所有 Agent 的 HTTP 流量经记录代理全量落库，并向 Agent 注入 traffic_search / traffic_get 工具与代理配置（提示词含代理说明）。":
    "Saat aktif, seluruh HTTP traffic Agent disimpan penuh lewat proxy pencatat, dan perkakas traffic_search / traffic_get serta konfigurasi proxy disuntikkan ke Agent (prompt memuat petunjuk proxy).",
  "关闭（默认）时不记录任何流量：Agent": "Nonaktif (bawaan): tidak ada traffic yang direkam — Agent",
  不会: "tidak akan",

  "拿到代理配置与流量工具，提示词也": " menerima konfigurasi proxy atau perkakas traffic, dan prompt ",
  不含: "tidak memuat",

  "代理相关内容。切换后会即时重建 Agent 生效。":
    " konten terkait proxy. Mengubahnya langsung membangun ulang Agent agar berlaku.",
  "已开启 · 正在记录流量并注入代理": "Aktif · Merekam traffic dan menyuntikkan proxy",
  "已关闭 · 不记录、不注入代理": "Nonaktif · Tidak merekam, tanpa injeksi proxy",
  "Agent 自动绑定流量": "Pengikatan traffic otomatis Agent",
  "默认关闭。开启后，漏洞入库时触发的报告 Agent 会核对已有 HTTP 请求/响应，关联对应流量后再编写报告。":
    "Nonaktif secara bawaan. Saat aktif, Agent laporan yang dipicu saat temuan dicocokkan dengan request/respons HTTP yang sudah ada, menautkan traffic yang sesuai, lalu menulis laporan.",
  "查阅数据包及额外的工具调用会增加 Token 消耗。":
    "Memeriksa paket dan pemanggilan tool tambahan menambah konsumsi Token.",
  "TCP、未抓包或没有匹配流量时仍可正常上报。此开关不影响流量捕获、人工绑定及已保存证据的查看。 对下一轮 Agent 生效；关闭后会立即拒绝新的自动绑定。":
    "Pelaporan tetap berjalan untuk traffic TCP, yang tidak terekam, atau yang tidak cocok. Saklar ini tidak memengaruhi penangkapan traffic, pengikatan manual, atau tampilan bukti tersimpan. Berlaku untuk ronde Agent berikutnya; saat nonaktif, pengikatan otomatis baru langsung ditolak.",
  "已开启 · 会增加 Token 消耗": "Aktif · Menambah konsumsi Token",
  "已关闭 · 可继续人工绑定": "Nonaktif · Pengikatan manual tetap tersedia",
  全局代理: "Proxy global",

  "所有 Agent 的": "Semua Agent ",
  目标流量: "traffic target",

  "经此代理出网（隐藏源 IP / 走跳板）。支持 ":
    " keluar lewat proxy ini (menyembunyikan IP sumber / lewat jump host). Mendukung ",
  "，可带": ", dan bisa memakai",
  " 认证。留空=直连。": " autentikasi. Kosongkan untuk koneksi langsung.",
  开启: "Saat ",

  "时，它作为记录代理的": " aktif, proxy ini menjadi ",
  上游: "upstream bagi proxy pencatat",

  "（流量仍全量落库，再经此代理出网）；关闭捕获时，直接注入 Agent 的 bash / WebFetch 出网。与网络搜索代理、LLM 代理相互独立。":
    " (traffic tetap tersimpan penuh, lalu keluar lewat proxy ini); saat penangkapan nonaktif, disuntikkan langsung ke egress bash / WebFetch Agent. Tidak tergantung pada proxy pencarian web maupun proxy LLM.",
  提示: "Tips",

  "：socks5 在": ": socks5, saat ",
  关闭捕获: "penangkapan nonaktif",

  "时依赖各命令行工具对 ": ", bergantung pada dukungan setiap tool command-line terhadap ",
  " 的支持（curl 可用，部分工具可能忽略）； 若主要用 socks5，建议开启流量捕获——此路径由 MITM 亲自拨号，工具无感知、稳定生效。":
    " (curl bisa, sebagian tool mungkin mengabaikannya). Jika terutama memakai socks5, aktifkan penangkapan traffic — jalur ini di-dial langsung oleh MITM, jadi tool tidak menyadarinya dan tetap stabil.",
  代理地址: "Alamat proxy",

  "socks5://user:pass@host:1080 或 http://host:port（留空=直连）":
    "socks5://user:pass@host:1080 atau http://host:port (kosongkan = langsung)",
  保存: "Simpan",

  "已配置 · 所有目标流量经此代理出网": "Terkonfigurasi · Semua traffic target keluar lewat proxy ini",
  "未配置 · 目标流量直连出网": "Tidak terkonfigurasi · Traffic target tersambung langsung",
  操作约束注入: "Injeksi batasan operasi",

  "开启后，把每个任务的": "Saat aktif, ",
  操作约束: "batasan operasi",

  "（在任务总览「操作约束」里维护的 allow/deny 条目）拼进对应 Agent 的系统提示，用来框定探索边界（如「仅测当前端口」「禁止爆破」）。":
    " (entri allow/deny yang dirawat di “Batasan operasi” pada ringkasan tugas) disisipkan ke system prompt Agent yang bersangkutan untuk membatasi area eksplorasi (misal “hanya uji port ini”, “dilarang brute force”).",
  "可分别控制注入到 ": "Penyuntikan bisa dikendalikan terpisah untuk ",
  "规划者（planner）": "planner",
  "与 ": " dan ",
  "执行者（worker）": "worker",
  "；默认都开。切换即时生效（下一轮读取），无需重建 Agent。关闭后该 Agent 不再看到约束。":
    "; keduanya aktif secara bawaan. Efeknya langsung saat berganti (dibaca pada giliran berikutnya) — tanpa perlu membangun ulang Agent. Saat nonaktif, Agent tidak lagi melihat batasan.",
  "注入规划者（planner）": "Suntikkan ke planner",
  " · 已开启": " · Aktif",
  " · 已关闭": " · Nonaktif",
  "注入执行者（worker）": "Suntikkan ke worker",
  实验功能: "Fitur eksperimental",

  "尚在验证中的机制，默认关闭。可能改变 Agent 行为或影响稳定性，请在了解影响后启用。":
    "Mekanisme yang masih dalam validasi, nonaktif secara bawaan. Bisa mengubah perilaku Agent atau memengaruhi stabilitas — aktifkan setelah memahami dampaknya.",
  "noa 上下文压缩": "kompaksi konteks noa",
  "：由模型主动压缩长对话历史（norma v0.4.0）。开启后平台接入的四类 Agent（":
    ": model mengompres riwayat percakapan panjang secara proaktif (norma v0.4.0). Saat diaktifkan, empat jenis Agent di platform (",
  "规划者 / 执行者 / 主 Agent / 对话": "Planner / Worker / Agent utama / Chat",
  "）改用 noa 接管上下文，取代内置压缩，压缩原文会归档到任务工作目录下便于回溯。切换即时生效（对之后启动的运行生效），无需重建 Agent；关闭后立即恢复内置压缩。":
    ") beralih ke noa untuk mengelola konteks menggantikan kompresi bawaan; teks asli diarsipkan di direktori kerja tugas untuk penelusuran. Efeknya langsung (untuk run yang dimulai nanti) tanpa membangun ulang Agent; saat nonaktif, kompresi bawaan langsung dipulihkan.",
  "总开关已开启 · 可在各 Agent 配置里单独启用": "Saklar utama aktif · Bisa diaktifkan per Agent",
  "已关闭 · 各 Agent 无法启用网络搜索": "Nonaktif · Agent tidak bisa mengaktifkan pencarian web",
  网络搜索: "Pencarian web",

  这是网络搜索的: "Ini adalah ",

  "总开关 + 来源配置": "saklar utama + konfigurasi sumber",
  "。开启后，才能在": " untuk pencarian web. Setelah diaktifkan, barulah bisa memilih di ",
  "每个 Agent 的配置": "konfigurasi tiap Agent",
  里单独选择是否启用: " apakah mengaktifkan ",

  "（仅返回标题/链接/摘要，不抓取正文；抓取由 WebFetch 负责）。网络搜索":
    " (hanya judul/tautan/ringkasan — tidak mengambil isi halaman; pengambilan ditangani WebFetch). Pencarian web ",
  不走: "tidak lewat",

  "记录代理，独立于流量捕获。": " proxy pencatat; terlepas dari penangkapan traffic.",
  "来源可选 ": "Sumber tersedia: ",
  "DuckDuckGo（ddgs）": "DuckDuckGo (ddgs)",
  "（无需 Key）、": " (tanpa perlu Key), ",
  "Brave（免费版）": "Brave (gratis)",
  "（需填写 Brave API Key）、": " (perlu isi Brave API Key),",
  "（需填写 Tavily API Key）或 ": " (perlu isi Tavily API Key) atau ",
  "（复用当前 LLM 配置）。总开关关闭时，各 Agent 的网络搜索开关不可用。":
    " (memakai ulang konfigurasi LLM aktif). Saat saklar utama nonaktif, saklar pencarian web tiap Agent tidak tersedia.",
  搜索来源: "Sumber pencarian",

  选择来源: "Pilih sumber",

  "DuckDuckGo（ddgs · 免费无 Key）": "DuckDuckGo (ddgs · gratis, tanpa Key)",
  "Brave（免费版 · 需 Key）": "Brave (gratis · butuh Key)",
  "Tavily（需 Key）": "Tavily (butuh Key)",
  "DeepSeek（官方）": "DeepSeek (resmi)",
  "DeepSeek 官方联网搜索": "Pencarian web resmi DeepSeek",
  该来源直接复用: "Sumber ini langsung memakai ",

  "当前激活的 LLM 配置": "konfigurasi LLM yang aktif saat ini",
  "。因此它": ". Karena itu, ",
  "仅支持 DeepSeek 官方模型": "hanya mendukung model resmi DeepSeek",
  "，且该配置": ", dan konfigurasi itu ",
  "必须使用 anthropic 协议": "harus memakai protokol anthropic",
  "——DeepSeek 的 OpenAI 协议端点不支持服务端搜索。切换 LLM 配置后此来源可能失效。":
    "— titik akhir protokol OpenAI DeepSeek tidak mendukung pencarian di sisi server. Sumber ini bisa berhenti bekerja setelah Anda mengganti konfigurasi LLM.",
  "与其它来源不同，搜索由 ": "Berbeda dengan sumber lain, pencarian ",
  "DeepSeek 服务端执行": "dijalankan di server DeepSeek",
  "：每次搜索会额外消耗一次模型调用（产生 Token 费用），搜索请求":
    ": setiap pencarian menghabiskan satu panggilan model tambahan (biaya Token), dan permintaan pencarian ",
  不经过上面的出口代理: "melewati proxy egress di atas",

  "，也": ", dan ",
  不计入流量留痕: "tidak tercatat dalam jejak traffic",

  "；返回结果": "; hasil yang dikembalikan ",
  只有标题和链接: "hanya berisi judul dan tautan",

  "（无摘要），需要正文时由 WebFetch 抓取。": " (tanpa ringkasan) — WebFetch mengambil isi halaman saat diperlukan.",
  "是否满足上述条件由你自行确认，系统不做拦截；可用下方「测试搜索」按钮实际跑一次来验证。":
    "Anda sendiri yang memastikan kondisi di atas — sistem tidak memblokirnya; gunakan tombol “Uji pencarian” di bawah untuk menjalankan pencarian sungguhan sebagai verifikasi.",
  已配置: "Terkonfigurasi",

  "已配置（留空则不变）": "Terkonfigurasi (kosongkan untuk mempertahankan)",
  "输入 Brave API Key": "Masukkan Brave API Key",
  "已选择 Brave 但尚未配置 Key —— 在保存 Key 之前，搜索工具不会启用。":
    "Brave dipilih tetapi belum ada Key yang dikonfigurasi — alat pencarian tetap mati sampai Anda menyimpan Key.",
  "免费版额度约 2,000 次/月。前往 https://brave.com/search/api/ 获取 Key。":
    "Kuota gratis sekitar 2.000 pencarian/bulan. Dapatkan Key di https://brave.com/search/api/.",
  "输入 Tavily API Key（tvly-…）": "Masukkan Tavily API Key (tvly-…)",
  "已选择 Tavily 但尚未配置 Key —— 在保存 Key 之前，搜索工具不会启用。":
    "Tavily dipilih tetapi belum ada Key yang dikonfigurasi — alat pencarian tetap mati sampai Anda menyimpan Key.",
  "前往 https://tavily.com 注册并获取 API Key。": "Daftar di https://tavily.com untuk mendapatkan API Key.",
  "出口代理（可选）": "Proxy egress (opsional)",
  "http://host:port 或 socks5://host:port（留空=直连）":
    "http://host:port atau socks5://host:port (kosongkan = langsung)",
  "独立出口代理，仅用于访问搜索端点（VPN/SOCKS 等）。与记录流量的 MITM 代理无关；网络不通时经此代理访问。":
    "Proxy egress terpisah, hanya untuk mengakses endpoint pencarian (VPN/SOCKS, dll.). Tidak berkaitan dengan MITM proxy perekam traffic; pakai saat jalur langsung tidak tersambung.",
  "用当前配置（来源 + 代理 + Key）实际搜索一次「test」，验证是否可用。":
    "Menjalankan pencarian sungguhan untuk “test” dengan pengaturan saat ini (sumber + proxy + Key) untuk memverifikasinya.",
  "测试中…": "Menguji…",
  测试搜索: "Uji pencarian",

  "自定义脚本 · Python 解释器": "Script kustom · Interpreter Python",
  "自定义 ": "Kustom ",
  " 类型工具用它跑 Python。开机会自动检测（python3 优先）；此处可手填 venv / 特定版本的绝对路径，留空则运行时自动检测。":
    " type tool menjalankan Python dengannya. Deteksi otomatis saat startup (python3 lebih dulu); di sini Anda bisa mengisi path absolut ke venv atau versi tertentu — kosongkan agar dideteksi otomatis saat runtime.",
  "/usr/bin/python3（留空=自动检测）": "/usr/bin/python3 (kosongkan = deteksi otomatis)",
  重新检测: "Deteksi ulang",

  "工作并发 · Work Agent 数": "Kongurensi kerja · jumlah work agent",
  "每个任务并发运行的工作 agent 数量（默认 3）。数值越大并发探测越多、消耗也越高。修改后":
    "Jumlah work agent yang berjalan paralel per tugas (bawaan 3). Angka lebih besar berarti lebih banyak probe paralel dan konsumsi lebih tinggi. Perubahan berlaku ",
  对之后启动的任务生效: "untuk tugas yang dimulai nanti",

  "，正在运行的任务不受影响。": " — tugas yang berjalan tidak terpengaruh.",
  会话输入框发送键位: "Tombol kirim kotak chat",

  "对话页与任务详情的主 Agent 会话输入框共用此设置，选择后立即生效、无需保存。":
    "Dipakai bersama oleh kotak input chat utama di halaman percakapan dan detail tugas; langsung berlaku tanpa perlu menyimpan.",
  该偏好: "Preferensi ini ",

  只存在本浏览器: "hanya tersimpan di browser ini",

  "，不随账号同步，换浏览器或清理站点数据后需重新设置。":
    ", tidak disinkronkan dengan akun, dan harus diatur ulang setelah ganti browser atau membersihkan data situs.",
  发送方式: "Mode pengiriman",

  "Enter 发送，Shift+Enter 换行": "Enter untuk kirim, Shift+Enter untuk baris baru",
  "Ctrl+Enter 发送，Enter 换行": "Ctrl+Enter untuk kirim, Enter untuk baris baru",
} satisfies Record<string, string>;

export default messages;

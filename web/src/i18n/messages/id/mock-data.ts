/**
 * Mock/demo dataset strings (src/lib/mock/data.ts) yang diterjemahkan di dalam
 * fungsi modul (agentDetail, assetRefsFor, workspaceRead, llmRecordDetail).
 * Data mock top-level tetap zh — situs render yang menerjemahkannya.
 */

const messages = {
  // ── agentDetail: template prompt ({name} = nama agent), default wrapup ──
  "你是 CYFIND 的「{name}」。\n目标：{{.Goal}}\n资产概览：{{.AssetSummary}}\n路线提示：{{.RouteHint}}\n请基于以上信息推进探索，并通过工具把结果写回图。":
    'Anda adalah "{name}" dari CYFIND.\nGoal: {{.Goal}}\nRingkasan aset: {{.AssetSummary}}\nPetunjuk rute: {{.RouteHint}}\nGunakan informasi di atas untuk mendorong eksplorasi dan menuliskan hasil kembali ke graph.',
  "时间/步数将尽，请总结已确认发现并标记意图终态。":
    "Waktu/langkah hampir habis — rangkum temuan yang telah dikonfirmasi dan tetapkan intent ke status akhir.",
  "任务超时，请立即收尾并落库当前结论。": "Tugas melewati batas waktu — segera tutup dan simpan kesimpulan saat ini.",
  // nama agent (diinterpolasi ke prompt lewat {name})
  漏洞复测: "Retest Kerentanan",

  目标拆解器: "Pemecah Goal",

  规划者: "Perencana",

  "主 Agent": "Agent Utama",
  "侦察机器人（自定义）": "Bot Recon (Kustom)",
  // ── agentDetail: variabel prompt ──
  当前任务目标: "Goal tugas saat ini",

  "拿到 acme.com 后台管理权限": "Dapatkan akses admin ke konsol acme.com",
  资产图概览: "Ringkasan asset graph",

  "6 子域 / 3 IP / 4 应用 / 4 端点": "6 subdomain / 3 IP / 4 aplikasi / 4 endpoint",
  探索路线提示: "Petunjuk rute eksplorasi",

  "优先后台与 API 越权面": "Prioritaskan konsol admin dan permukaan bypass otorisasi API",
  // ── agentDetail: riwayat versi prompt ──
  加强越权探测引导: "Perkuat panduan pengujian bypass otorisasi",

  初版微调: "Penyesuaian awal",

  "你是 CYFIND 的规划者……": "Anda adalah perencana CYFIND…",
  "你是 CYFIND 的规划者(v2)……": "Anda adalah perencana CYFIND (v2)…",
  // ── assetRefsFor: ringkasan intent/fact/finding ──
  "对 www.acme.com 搜索接口做 SQL 注入探测": "Uji endpoint pencarian www.acme.com untuk SQL injection",
  "枚举 api.acme.com 的对象越权 (IDOR)": "Enumerasi cacat otorisasi level objek (IDOR) pada api.acme.com",
  "search?q= 参数可注入，报错回显 MySQL 语法错误":
    "Parameter search?q= dapat disuntik — respons galat menampilkan kembali galat sintaks MySQL",
  "[高] SQL 注入 www.acme.com/search?q=": "[Tinggi] SQL injection pada www.acme.com/search?q=",
  // ── workspaceRead: isi file demo ──
  "# 工作区笔记\n\n（demo）这是工作空间根目录下的示例文件，可在线编辑并保存。\n":
    "# Catatan workspace\n\n(demo) Ini adalah contoh file di root workspace; edit online dan simpan.\n",
  "<!-- (demo) 抓到的响应体片段 -->\n<html><body>MySQL error near ''1'='1'</body></html>\n":
    "<!-- (demo) Cuplikan body respons yang ditangkap -->\n<html><body>MySQL error near ''1'='1'</body></html>\n",
  "（demo）原始 LLM 对话记录示例，此处省略。": "(demo) Contoh log percakapan LLM mentah — dihilangkan di sini.",
  // ── llmRecordDetail: payload request/response hasil rekaman ──
  "你是一个授权渗透测试系统的「执行者」…（省略）":
    'Anda adalah "eksekutor" dari sistem penetration testing yang berizin… (dihapus)',
  "开始执行 system 提示里的这条意图：只做它、只产生事实、做完即停。":
    "Mulai eksekusi intent berikut dari prompt system: kerjakan hanya itu, hasilkan hanya fakta, berhenti setelah selesai.",
  "对 search?q= 做注入探测，先用报错型 payload 验证。":
    "Uji search?q= untuk injeksi; verifikasi dulu dengan payload error-based.",
  "在目标环境中执行一条 shell 命令并返回其输出。":
    "Jalankan perintah shell di lingkungan target dan kembalikan outputnya.",
  "对 search?q= 做注入探测。": "Uji search?q= untuk injeksi.",
} satisfies Record<string, string>;

export default messages;

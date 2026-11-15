/**
 * Mock/demo dataset strings (src/lib/mock/data.ts) yang diterjemahkan di dalam
 * fungsi modul (agentDetail, assetRefsFor, workspaceRead, llmRecordDetail).
 * Data mock top-level tetap zh — situs render yang menerjemahkannya.
 */

const messages = {
  'You are CYFIND\'s "{name}".\nGoal: {{.Goal}}\nAsset summary: {{.AssetSummary}}\nRoute hint: {{.RouteHint}}\nUse the information above to drive exploration and write results back to the graph.':
    'Anda adalah "{name}" dari CYFIND.\nGoal: {{.Goal}}\nRingkasan aset: {{.AssetSummary}}\nPetunjuk rute: {{.RouteHint}}\nGunakan informasi di atas untuk mendorong eksplorasi dan menuliskan hasil kembali ke graph.',
  "Time/steps are running low — summarize confirmed findings and set intents to their final states.":
    "Waktu/langkah hampir habis — rangkum temuan yang telah dikonfirmasi dan tetapkan intent ke status akhir.",
  "The task timed out — wrap up immediately and persist the current conclusions.":
    "Tugas melewati batas waktu — segera tutup dan simpan kesimpulan saat ini.",
  "Vulnerability Retest": "Retest Kerentanan",
  "Goal Decomposer": "Pemecah Goal",
  Planner: "Perencana",
  "Main Agent": "Agent Utama",
  "Recon Bot (Custom)": "Bot Recon (Kustom)",
  "Current task goal": "Goal tugas saat ini",
  "Obtain admin access to the acme.com console": "Dapatkan akses admin ke konsol acme.com",
  "Asset graph overview": "Ringkasan asset graph",
  "6 subdomains / 3 IPs / 4 apps / 4 endpoints": "6 subdomain / 3 IP / 4 aplikasi / 4 endpoint",
  "Exploration route hint": "Petunjuk rute eksplorasi",
  "Prioritize the admin console and API authorization-bypass surface":
    "Prioritaskan konsol admin dan permukaan bypass otorisasi API",
  "Strengthen guidance on probing for authorization bypass": "Perkuat panduan pengujian bypass otorisasi",
  "Initial tweaks": "Penyesuaian awal",
  "You are CYFIND's planner…": "Anda adalah perencana CYFIND…",
  "You are CYFIND's planner (v2)…": "Anda adalah perencana CYFIND (v2)…",
  "Probe the www.acme.com search endpoint for SQL injection": "Uji endpoint pencarian www.acme.com untuk SQL injection",
  "Enumerate object-level authorization flaws (IDOR) on api.acme.com":
    "Enumerasi cacat otorisasi level objek (IDOR) pada api.acme.com",
  "The search?q= parameter is injectable — error responses echo MySQL syntax errors":
    "Parameter search?q= dapat disuntik — respons galat menampilkan kembali galat sintaks MySQL",
  "[High] SQL injection on www.acme.com/search?q=": "[Tinggi] SQL injection pada www.acme.com/search?q=",
  "# Workspace notes\n\n(demo) This is a sample file in the workspace root; edit it online and save.\n":
    "# Catatan workspace\n\n(demo) Ini adalah contoh file di root workspace; edit online dan simpan.\n",
  "<!-- (demo) Captured response body snippet -->\n<html><body>MySQL error near ''1'='1'</body></html>\n":
    "<!-- (demo) Cuplikan body respons yang ditangkap -->\n<html><body>MySQL error near ''1'='1'</body></html>\n",
  "(demo) Raw LLM conversation log sample — omitted here.":
    "(demo) Contoh log percakapan LLM mentah — dihilangkan di sini.",
  'You are the "executor" of an authorized penetration testing system… (omitted)':
    'Anda adalah "eksekutor" dari sistem penetration testing yang berizin… (dihapus)',
  "Start executing this intent from the system prompt: do only that, produce only facts, stop when done.":
    "Mulai eksekusi intent berikut dari prompt system: kerjakan hanya itu, hasilkan hanya fakta, berhenti setelah selesai.",
  "Probe search?q= for injection; verify first with an error-based payload.":
    "Uji search?q= untuk injeksi; verifikasi dulu dengan payload error-based.",
  "Run a shell command in the target environment and return its output.":
    "Jalankan perintah shell di lingkungan target dan kembalikan outputnya.",
  "Probe search?q= for injection.": "Uji search?q= untuk injeksi.",
} satisfies Record<string, string>;

export default messages;

/**
 * Mock/demo dataset strings (src/lib/mock/data.ts) that are translated inside
 * the module's functions (agentDetail, assetRefsFor, workspaceRead,
 * llmRecordDetail). Top-level mock data stays zh — render sites translate it.
 */

const messages = {
  // ── agentDetail: prompt template ({name} = agent name), wrapup defaults ──
  "你是 CYFIND 的「{name}」。\n目标：{{.Goal}}\n资产概览：{{.AssetSummary}}\n路线提示：{{.RouteHint}}\n请基于以上信息推进探索，并通过工具把结果写回图。":
    'You are CYFIND\'s "{name}".\nGoal: {{.Goal}}\nAsset summary: {{.AssetSummary}}\nRoute hint: {{.RouteHint}}\nUse the information above to drive exploration and write results back to the graph.',
  "时间/步数将尽，请总结已确认发现并标记意图终态。":
    "Time/steps are running low — summarize confirmed findings and set intents to their final states.",
  "任务超时，请立即收尾并落库当前结论。":
    "The task timed out — wrap up immediately and persist the current conclusions.",
  // agent names (interpolated into the prompt via {name})
  漏洞复测: "Vulnerability Retest",

  目标拆解器: "Goal Decomposer",

  规划者: "Planner",

  "主 Agent": "Main Agent",
  "侦察机器人（自定义）": "Recon Bot (Custom)",
  // ── agentDetail: prompt variables ──
  当前任务目标: "Current task goal",

  "拿到 acme.com 后台管理权限": "Obtain admin access to the acme.com console",
  资产图概览: "Asset graph overview",

  "6 子域 / 3 IP / 4 应用 / 4 端点": "6 subdomains / 3 IPs / 4 apps / 4 endpoints",
  探索路线提示: "Exploration route hint",

  "优先后台与 API 越权面": "Prioritize the admin console and API authorization-bypass surface",
  // ── agentDetail: prompt version history ──
  加强越权探测引导: "Strengthen guidance on probing for authorization bypass",

  初版微调: "Initial tweaks",

  "你是 CYFIND 的规划者……": "You are CYFIND's planner…",
  "你是 CYFIND 的规划者(v2)……": "You are CYFIND's planner (v2)…",
  // ── assetRefsFor: intent/fact/finding summaries ──
  "对 www.acme.com 搜索接口做 SQL 注入探测": "Probe the www.acme.com search endpoint for SQL injection",
  "枚举 api.acme.com 的对象越权 (IDOR)": "Enumerate object-level authorization flaws (IDOR) on api.acme.com",
  "search?q= 参数可注入，报错回显 MySQL 语法错误":
    "The search?q= parameter is injectable — error responses echo MySQL syntax errors",
  "[高] SQL 注入 www.acme.com/search?q=": "[High] SQL injection on www.acme.com/search?q=",
  // ── workspaceRead: demo file contents ──
  "# 工作区笔记\n\n（demo）这是工作空间根目录下的示例文件，可在线编辑并保存。\n":
    "# Workspace notes\n\n(demo) This is a sample file in the workspace root; edit it online and save.\n",
  "<!-- (demo) 抓到的响应体片段 -->\n<html><body>MySQL error near ''1'='1'</body></html>\n":
    "<!-- (demo) Captured response body snippet -->\n<html><body>MySQL error near ''1'='1'</body></html>\n",
  "（demo）原始 LLM 对话记录示例，此处省略。": "(demo) Raw LLM conversation log sample — omitted here.",
  // ── llmRecordDetail: recorded request/response payloads ──
  "你是一个授权渗透测试系统的「执行者」…（省略）":
    'You are the "executor" of an authorized penetration testing system… (omitted)',
  "开始执行 system 提示里的这条意图：只做它、只产生事实、做完即停。":
    "Start executing this intent from the system prompt: do only that, produce only facts, stop when done.",
  "对 search?q= 做注入探测，先用报错型 payload 验证。":
    "Probe search?q= for injection; verify first with an error-based payload.",
  "在目标环境中执行一条 shell 命令并返回其输出。":
    "Run a shell command in the target environment and return its output.",
  "对 search?q= 做注入探测。": "Probe search?q= for injection.",
} satisfies Record<string, string>;

export default messages;

/**
 * Task detail → Overview tab (goals, constraints, coverage, tokens, scope, heartbeat).
 */

const messages = {
  "企业 #{id}": "Company #{id}",
  公司: "Company",

  根域名: "Root domain",

  子域名: "Subdomain",

  网段: "Network range",

  关键词: "Keyword",

  自动: "Auto",

  手动: "Manual",

  添加失败: "Failed to add",

  保存失败: "Failed to save",

  任务描述与目标: "Task description & goals",

  描述: "Description",

  目标: "Goal",

  目标管理: "Goal management",

  "（最终可核验的目标，共 {n} 条；新增/修改会通知规划者并复活任务）":
    " ({n} verifiable goals; adding or editing notifies the planner and revives the task)",
  "新增目标，如『拿到管理员账号的越权访问』": "Add a goal, e.g. “gain privilege escalation to an admin account”",
  "漏洞类(可选)": "Vulnerability class (optional)",
  添加: "Add",

  "暂无目标，添加后规划者会据此派发探索意图并判定达成。":
    "No goals yet. Once added, the planner dispatches exploration intents from them and judges completion.",
  操作约束: "Operation constraints",

  "（框定 planner/worker 的探索边界，共 {n} 条；改动下一轮规划生效）":
    " ({n} constraints scoping planner/worker exploration; changes apply in the next planning round)",
  禁止: "Deny",

  允许: "Allow",

  "一条操作约束，如『仅测当前端口，不扫其他端口』":
    "An operation constraint, e.g. “test only this port, don’t scan others”",
  "暂无操作约束。建任务时会自动从描述/目标抽取；也可在此手动增删改，用来框定「允许/禁止做哪些操作」。":
    "No operation constraints yet. They are extracted from the description/goals at task creation; you can also add, edit, and remove them here to scope what is allowed or denied.",
  资产测试覆盖度: "Asset test coverage",

  "（粗估，仅供参考）": " (rough estimate, for reference only)",
  "已测 {tested} / 范围内 {denominator}": "{tested} tested / {denominator} in scope",
  "LLM Token 用量": "LLM token usage",
  "（按模型统计，共 {n} 次调用）": " (by model, {n} calls total)",
  "（按模型统计）": " (by model)",
  输入: "Input",

  输出: "Output",

  缓存读: "Cache read",

  缓存命中率: "Cache hit rate",

  模型: "Model",

  调用: "Calls",

  命中率: "Hit rate",

  "暂无 LLM 用量（任务尚未产生调用，或记录仍在写入）。":
    "No LLM usage yet (the task hasn’t made any calls, or records are still being written).",
  测试范围: "Test scope",

  "（覆盖度分母 + 授权边界，共 {n} 条）": " ({n} entries: coverage denominator + authorization boundary)",
  "公司名或 id": "Company name or id",
  "如 10.0.0.1 或 10.0.0.0/24": "e.g. 10.0.0.1 or 10.0.0.0/24",
  "如 京ICP备12345678号-1": "e.g. 京ICP备12345678号-1",
  "如 企业名称关键词": "e.g. a company-name keyword",
  "如 example.com": "e.g. example.com",
  继承: "Inherited",

  "暂无测试范围，添加后可作为资产覆盖度的分母。":
    "No test scope yet. Entries here become the denominator for asset coverage.",
  心跳: "Heartbeat",

  引擎态: "Engine state",

  "运行中 Worker": "Running Workers",
  最近活动: "Last activity",

  "目标 {met}/{total}": "Goals {met}/{total}",
  完成时间: "Completed at",

  进行中意图: "Running intents",

  暂无进行中意图: "No running intents",

  需要关注: "Needs attention",

  确认漏洞: "Confirmed findings",

  "frontier 待领": "Unclaimed frontier",
  被拦意图: "Blocked intents",

  最近发现: "Recent findings",

  暂无发现: "No findings yet",

  "被拦/出错意图": "Blocked/failed intents",
  "（共 {n} 条，可重跑）": " ({n} total; can be re-run)",
  全部重跑: "Re-run all",

  重跑: "Re-run",

  "仅显示前 20 条，点「全部重跑」处理剩余 {n} 条。":
    "Showing only the first 20; click “Re-run all” to process the remaining {n}.",
  待领意图: "Unclaimed intents",

  "frontier 开放": "open frontier",
  确认发现: "Confirmed findings",

  本任务: "this task",

  意图总数: "Total intents",

  本任务全部意图: "all intents of this task",

  "域名(全等)": "Domain (exact)",
  "IP(全等)": "IP (exact)",
  "URL(全等)": "URL (exact)",
  "域名(模糊)": "Domain (fuzzy)",
  "IP(模糊)": "IP (fuzzy)",
  "URL(模糊)": "URL (fuzzy)",
  "CIDR 网段": "CIDR range",
  "任务级资产拦截 / 允许": "Task-level asset block / allow",
  "（仅本任务生效，不进全局；先拦截后允许，共 {n} 条）":
    " ({n} rules; this task only, not global — block is checked before allow)",
  "备注(可选)": "Note (optional)",
  "暂无任务级规则。「拦截」命中即禁止测试；「允许」为白名单——配置后本任务只允许命中允许规则的资产（未配置则不启用白名单）。":
    "No task-level rules yet. A “Block” match forbids testing; “Allow” is a whitelist — once configured, only assets matching an allow rule may be tested (no whitelist is active until then).",
} satisfies Record<string, string>;

export default messages;

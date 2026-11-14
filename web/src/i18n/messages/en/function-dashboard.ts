/**
 * Dashboard overview page translations (keys are the original zh-CN strings).
 */

const messages = {
  总览: "Overview",

  "系统全局状态 · 实时刷新": "Global system status · live refresh",
  活跃任务: "Active tasks",

  "探索 {n}": "Exploring {n}",
  "暂停 {n}": "Paused {n}",
  "完成 {n}": "Done {n}",
  暂无任务: "No tasks yet",

  确认发现: "Confirmed findings",

  "严重 {n}": "Critical {n}",
  "高危 {n}": "High {n}",
  "中危 {n}": "Medium {n}",
  "低危 {n}": "Low {n}",
  资产节点: "Asset nodes",

  跨任务共享: "Shared across tasks",

  流量交互: "Traffic exchanges",

  录制中: "Recording",

  捕获未开启: "Capture off",

  "Token 用量": "Token usage",
  "入 {in}（含缓存 {cache}）· 出 {out}": "In {in} (incl. cache {cache}) · Out {out}",
  "LLM Token 消耗": "LLM Token consumption",
  旧版: "Legacy",

  新版: "New",

  "新版：来自 llm_usage 计量账本，逐次调用精确、含中断消耗；仅覆盖启用后的数据":
    "New: from the llm_usage ledger — precise per call, includes interrupted runs; covers data recorded after enabling only",
  "旧版：来自 activity 统计（含历史任务），中断消耗不计、无法精确到模型":
    "Legacy: from activity stats (includes historical tasks); interrupted runs aren't counted and usage can't be attributed per model",
  全部: "All",

  默认: "Default",

  "合计 (输入+输出)": "Total (input+output)",
  "{n} 个任务": "{n} tasks",
  "输入(未命中)": "Input (cache miss)",
  缓存命中: "Cache hit",

  输入: "Input",

  输出: "Output",

  缓存读: "Cache read",

  缓存命中率: "Cache hit rate",

  "7天": "7d",
  "30天": "30d",
  "3月": "3mo",
  "6月": "6mo",
  一年: "1y",

  暂无数据: "No data yet",

  活动流: "Activity feed",

  "{n} 条事件": "{n} events",
  查看任务: "View tasks",

  暂无活动记录: "No activity yet",

  发现: "Findings",

  暂无发现: "No findings yet",

  任务: "Tasks",

  状态: "Status",

  引擎: "Engine",

  目标进度: "Goal progress",

  在途: "In flight",

  最近活动: "Last activity",

  按类型: "By type",

  资产分布: "Asset distribution",

  暂无资产数据: "No asset data yet",

  根域名: "Root domain",

  子域名: "Subdomain",

  应用: "Application",

  服务: "Service",

  端点: "Endpoint",

  "共 {n} 节点": "{n} nodes total",
  "{n} 次请求": "{n} requests",
  流量状态码: "Traffic status codes",

  暂无流量数据: "No traffic data yet",

  最近请求: "Recent requests",

  系统状态: "System status",

  "LLM 配置": "LLM configuration",
  已配置: "Configured",

  未配置: "Not configured",

  流量捕获: "Traffic capture",

  开启: "On",

  "关闭::state": "Off",
  激活模型: "Active model",

  "待审批 ({n})": "Pending approval ({n})",
  "还有 {n} 条…": "{n} more…",
  无待审批拦截: "No pending intercept approvals",

  "{s}s 前": "{s}s ago",
  "{m}m 前": "{m}m ago",
  "{h}h 前": "{h}h ago",
  "{d}d 前": "{d}d ago",
} satisfies Record<string, string>;

export default messages;

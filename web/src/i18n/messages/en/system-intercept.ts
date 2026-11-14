/**
 * System → Command Intercept page (source keys are the original zh-CN strings).
 */

const messages = {
  "{date} · {calls} 次 · {total} tokens": "{date} · {calls} calls · {total} tokens",
  "在 shell 中执行命令": "Run commands in a shell",
  "发起 HTTP/HTTPS 请求（含代理支持）": "Make HTTP/HTTPS requests (with proxy support)",
  网络搜索: "Web search",

  "开启持久 PTY 交互会话": "Open an interactive PTY session",
  向交互会话发送输入: "Send input to an interactive session",

  读取交互会话输出: "Read output from an interactive session",

  关闭交互会话: "Close an interactive session",

  列出所有交互会话: "List all interactive sessions",

  写入文件: "Write files",

  "编辑文件（精确替换）": "Edit files (exact replacement)",
  批量编辑文件: "Bulk edit files",

  执行类: "Execution",

  "写入/编辑类": "Write / Edit",
  系统工具: "System tools",

  自定义工具: "Custom tools",

  允许: "Allow",

  禁止: "Deny",

  申请: "Ask",

  加载模型兜底配置失败: "Failed to load model fallback config",

  保存失败: "Save failed",

  模型兜底配置已保存: "Model fallback config saved",

  已恢复内置默认模板: "Built-in default template restored",

  恢复失败: "Restore failed",

  模型兜底审批: "Model fallback approval",

  在: "Only commands in the ",

  拦截范围: "Intercept scope",

  "内、且": " that are ",
  没有任何拦截规则命中: "not matched by any intercept rule",

  "的命令，才由模型做语义判断（放行 / 转人工 / 拦截）": " are judged by the model (allow / human review / block)",
  已启用: "Enabled",

  未启用: "Disabled",

  "审批 Token 消耗": "Approval Token usage",
  "模型兜底审批累计用量,单独计量(worker=judge),不与各模型配置的统计混在一起":
    "Cumulative usage of model fallback approval, metered separately (worker=judge); not mixed with per-model-config stats",
  刷新: "Refresh",

  审批调用: "Approval calls",

  "输入 Token": "Input Token",
  "输出 Token": "Output Token",
  缓存读: "Cache read",

  缓存写: "Cache write",

  "近 30 天每日消耗(输入 + 输出)": "Daily usage over the last 30 days (input + output)",
  审批提示词: "Approval prompt",

  "模型据此判定 ALLOW / ASK / DENY，可直接编辑": "The model decides ALLOW / ASK / DENY based on this; edit directly",
  恢复默认模板: "Restore default template",

  留空使用内置模板: "Leave empty to use the built-in template",

  "{n} 字": "{n} chars",
  判定模型与策略: "Judge model & policy",

  审批模型: "Approval model",

  跟随激活配置: "Follow active config",

  "{name}（{model}）": "{name} ({model})",
  "模型判定超时（秒）": "Judge timeout (seconds)",
  "模型失败时（出错 / 超时 / 无法解析）": "On model failure (error / timeout / unparsable)",
  放行: "Allow",

  转人工审批: "Send to human approval",

  拦截: "Block",

  "人工审批（模型判为「转人工」时）": "Human approval (when the model decides “send to human”)",
  "审批等待超时（秒）": "Approval wait timeout (seconds)",
  超时后默认动作: "Default action after timeout",

  "保存中…": "Saving…",
  保存配置: "Save config",

  加载拦截规则失败: "Failed to load intercept rules",

  名称不能为空: "Name is required",

  模式不能为空: "Pattern is required",

  正则表达式语法无效: "Invalid regular expression syntax",

  规则已更新: "Rule updated",

  规则已创建: "Rule created",

  规则已删除: "Rule deleted",

  加载失败: "Load failed",

  拦截范围已保存: "Intercept scope saved",

  命令拦截: "Command Intercept",

  "工具执行前先按拦截规则匹配；未命中的命令可交由模型兜底判定":
    "Commands are matched against intercept rules before tool execution; unmatched commands can be judged by the model as a fallback",
  "未启用任何工具 — 拦截规则与模型兜底均不会生效":
    "No tools enabled — neither intercept rules nor model fallback will apply",
  "{n} 个工具": "{n} tools",
  "、": ", ",
  调整范围: "Adjust scope",

  拦截规则: "Intercept Rules",

  模型配置: "Model config",

  "按优先级（数字越大越先）逐条匹配，首条命中的规则生效":
    "Rules are matched by priority (higher number first); the first matching rule wins",
  新建规则: "New rule",

  "加载中…": "Loading…",
  暂无规则: "No rules yet",

  新建第一条规则: "Create the first rule",

  优先级: "Priority",

  名称: "Name",

  目标: "Target",

  类型: "Type",

  模式: "Pattern",

  策略: "Policy",

  启用: "Enabled",

  工具名: "Tool name",

  输入内容: "Input content",

  正则: "Regex",

  字符串: "String",

  编辑规则: "Edit rule",

  "优先级越大越先匹配；首条命中规则生效，后续跳过":
    "Higher priority is matched first; the first matching rule applies and the rest are skipped",
  给规则起个名字: "Give the rule a name",

  "优先级（数字越大越先匹配）": "Priority (higher number is matched first)",
  匹配目标: "Match target",

  "工具名（tool_name）": "Tool name (tool_name)",
  "输入内容（tool_input JSON）": "Input content (tool_input JSON)",
  匹配类型: "Match type",

  字符串包含: "String contains",

  正则表达式: "Regular expression",

  "包含 Go RE2 扩展语法（如 ": "Contains Go RE2 extended syntax (e.g. ",
  "），浏览器无法预览，提交后由服务端验证":
    "), which the browser cannot preview; it will be validated by the server on submit",
  拦截策略: "Intercept policy",

  "允许 — 直接放行，跳过后续规则": "Allow — pass through directly, skip remaining rules",
  "禁止 — 阻断，返回拒绝消息给模型": "Deny — block and return a rejection message to the model",
  "向用户申请 — 等待审批": "Ask the user — wait for approval",
  "拒绝消息（返回给模型）": "Rejection message (returned to the model)",
  "审批说明（可选）": "Approval note (optional)",
  操作被安全策略阻止: "This operation is blocked by security policy",

  启用审批超时: "Enable approval timeout",

  "超时后自动处置，不再等待": "Handle automatically after timeout instead of waiting",
  "超时时间（秒）": "Timeout (seconds)",
  超时动作: "Timeout action",

  自动拒绝: "Auto-deny",

  自动允许: "Auto-allow",

  启用此规则: "Enable this rule",

  取消: "Cancel",

  保存: "Save",

  "只有启用拦截的工具才会进入规则匹配；其余工具直接放行":
    "Only tools with intercept enabled go through rule matching; all other tools pass directly",
} satisfies Record<string, string>;

export default messages;

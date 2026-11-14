/**
 * System tools catalog page translations (keys are the original zh-CN strings).
 */

const messages = {
  工具: "Tools",

  "系统工具的描述/绑定，以及自定义工具(command/script/http)":
    "Descriptions/bindings for system tools, plus custom tools (command/script/http)",
  "搜索工具名、描述、Agent…": "Search tool name, description, agent…",
  系统工具: "System tools",

  自定义工具: "Custom tools",

  "{a} / {b} 个匹配，点击卡片编辑描述、参数默认值与 Agent 绑定":
    "{a} / {b} matches — click a card to edit description, parameter defaults, and agent bindings",
  "共 {n} 个，点击卡片编辑描述、参数默认值与 Agent 绑定":
    "{n} in total — click a card to edit description, parameter defaults, and agent bindings",
  没有匹配的系统工具: "No matching system tools",

  "（暂无系统工具，等待后端 seed）": "(no system tools yet — waiting for the backend seed)",
  "shell/command/script/http，{a} / {b} 个匹配，点击卡片编辑":
    "shell/command/script/http — {a} / {b} matches, click a card to edit",
  "shell(bash 声明) / command(命令) / script(Python) / http(API)，共 {n} 个，点击卡片编辑":
    "shell (bash declaration) / command (shell command) / script (Python) / http (API) — {n} in total, click a card to edit",
  新建自定义工具: "New custom tool",

  没有匹配的自定义工具: "No matching custom tools",

  "（暂无自定义工具，点击右上角「新建自定义工具」）":
    "(no custom tools yet — click “New custom tool” at the top right)",
  "编辑描述、参数默认值与 Agent 绑定": "Edit description, parameter defaults, and agent bindings",
  "已保存工具「{key}」": "Saved tool “{key}”",
  "保存失败：{message}": "Save failed: {message}",
  "已恢复「{key}」为代码默认": "Restored “{key}” to code defaults",
  "恢复失败：{message}": "Restore failed: {message}",
  该工具依赖: "This tool requires ",

  流量捕获: "Traffic capture",

  "。请先在「系统配置」开启流量捕获，才能绑定给 Agent 并启用。":
    ". Enable traffic capture in System Settings first, then bind it to agents and turn it on.",
  "绑定 Agent（决定该工具给哪些 Agent）": "Bind agents (decides which agents get this tool)",
  "（无 Agent）": "(no agents)",
  启用: "Enabled",

  "工具描述（发送给模型）": "Tool description (sent to the model)",
  "参数（名称 / 类型 / 必填只读；描述与默认值可改）":
    "Parameters (name / type / required are read-only; description and default are editable)",
  "（无参数）": "(no parameters)",
  必填: "Required",

  "items 子字段": "items sub-field",
  描述: "Description",

  默认值: "Default value",

  "（空=无默认）": "(empty = no default)",
  仅标量支持: "Scalars only",

  保存: "Save",

  恢复默认: "Restore defaults",

  系统: "System",

  "自定义·{kind}": "Custom · {kind}",
  已停用: "Disabled",

  "累计调用 {n} 次": "Called {n} times in total",
  "调用 {n}": "Calls {n}",
  "（无描述）": "(no description)",
  "（未绑定 Agent）": "(no agents bound)",
  "编辑 {key}": "Edit {key}",
  "shell=bash 环境声明(只需名称+描述，告知模型可用 bash 调用)；command/script/http 需写执行规格。":
    "shell = bash environment declaration (name + description only; tells the model it can call bash). command/script/http need an execution spec.",
  "如 nmap_scan": "e.g. nmap_scan",
  "描述(发给模型)": "Description (sent to the model)",
  类型: "Type",

  "shell（bash 环境声明）": "shell (bash environment declaration)",
  "command（shell 命令模板）": "command (shell command template)",
  "script（Python 脚本）": "script (Python script)",
  "http（API 请求）": "http (API request)",
  '适合 nmap、sqlmap、ffuf 等出名工具——模型已知用法，只需声明"可在 bash 中调用"即可。名称+描述会追加到 Bash 工具描述里。':
    "For well-known tools like nmap, sqlmap, ffuf — the model already knows how to use them; just declare that they can be called from bash. The name + description are appended to the Bash tool description.",
  "命令模板（占位符 {param}，如 nmap -p {ports} {target}）":
    "Command template (placeholders {param}, e.g. nmap -p {ports} {target})",
  'Python 正文（参数走 stdin JSON / os.environ["TOOL_X"]）':
    'Python body (params via stdin JSON / os.environ["TOOL_X"])',
  "URL（可含 {param}）": "URL (may contain {param})",
  "Headers（JSON，可含 {param}）": "Headers (JSON, may contain {param})",
  "Body（可含 {param}）": "Body (may contain {param})",
  "代理 URL（空=直连）": "Proxy URL (empty = direct)",
  走记录代理: "Use recording proxy",

  "超时(ms，空=默认)": "Timeout (ms, empty = default)",
  "参数 JSON Schema": "Parameter JSON Schema",
  "（http 工具必填，需含 properties）": "(required for http tools; must include properties)",
  "（留空 = 自动给 {args} 薄壳）": "(empty = auto-wrap with {args})",
  "绑定 Agent": "Bind agents",
  "deferred（大量不常用工具才开）": "deferred (only enable for large sets of rarely used tools)",
  "测试运行（用当前表单，不会保存）": "Test run (uses the current form; nothing is saved)",
  '示例参数 JSON，如 {"target":"example.com"}': 'Sample params JSON, e.g. {"target":"example.com"}',
  "运行中…": "Running…",
  测试运行: "Test run",

  "（无输出）": "(no output)",
  创建: "Create",

  删除: "Delete",

  "key 需小写字母开头，仅含小写字母/数字/下划线":
    "key must start with a lowercase letter and use only lowercase letters, digits, and underscores",
  "参数 JSON Schema 格式错误": "Invalid parameter JSON Schema",
  "headers JSON 格式错误": "Invalid headers JSON",
  "http 工具必须提供参数 JSON Schema（含 properties，不能留空）":
    "http tools must provide a parameter JSON Schema (must include properties; cannot be empty)",
  已创建自定义工具: "Custom tool created",

  已保存: "Saved",

  已删除: "Deleted",

  "删除失败：{message}": "Delete failed: {message}",
  "测试参数 JSON 格式错误": "Invalid test params JSON",
} satisfies Record<string, string>;

export default messages;

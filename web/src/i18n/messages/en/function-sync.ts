/**
 * Asset sync page translations (keys are the original zh-CN strings).
 */

const messages = {
  资产同步: "Asset Sync",

  从外部数据源同步资产入库: "Sync assets into the database from external data sources",

  "读取数据源状态失败：{message}": "Failed to read datasource status: {message}",
  "数据源就绪后即可选择项目 / 任务进行同步。": "Once the datasource is ready, pick a project / task to sync.",
  "已创建 ScopeSentry 数据源，请填写地址与密钥": "ScopeSentry datasource created; fill in the URL and API key",
  "创建失败：{message}": "Creation failed: {message}",
  "请填写 MCP 地址": "Enter the MCP URL",
  已保存并启用数据源: "Datasource saved and enabled",

  "已保存（尚未满足启用条件）": "Saved (enablement conditions not yet met)",
  "保存失败：{message}": "Save failed: {message}",
  数据源状态: "Datasource Status",

  刷新: "Refresh",

  "尚未创建 ScopeSentry 数据源。创建后会新增一个占位 MCP（地址/密钥为空、未启用）。":
    "No ScopeSentry datasource created yet. Creating one adds a placeholder MCP entry (empty URL/key, disabled).",
  创建数据源: "Create Datasource",

  "数据源已创建但未配置，请填写 MCP 地址与 API Key 后启用。":
    "The datasource is created but not configured. Fill in the MCP URL and API Key, then enable it.",
  "数据源已配置但未启用，保存后将自动启用。":
    "The datasource is configured but not enabled; saving will enable it automatically.",
  "MCP 地址": "MCP URL",
  "http://<主机>:8082/mcp": "http://<host>:8082/mcp",
  "API Key（X-API-Key，留空保留原值）": "API Key (X-API-Key; leave blank to keep the current value)",
  保存并启用: "Save & Enable",

  "已发现 {n} 个工具": "{n} tools discovered",
  "检测中…": "Checking…",
  未创建: "Not Created",

  未配置: "Not Configured",

  未启用: "Not Enabled",

  已连接: "Connected",

  不可达: "Unreachable",

  "加载列表失败：{message}": "Failed to load the list: {message}",
  "请至少选择一个{target}": "Select at least one {target}",
  项目: "Project",

  任务: "Task",

  请至少选择一种资产类型: "Select at least one asset type",

  "同步完成，共入库 {n} 条资产": "Sync complete; {n} assets imported",
  "同步失败：{message}": "Sync failed: {message}",
  "加载中…": "Loading…",
  无数据: "No data",

  选择数据同步: "Select Data to Sync",

  项目维度: "By Project",

  任务维度: "By Task",

  "同步资产：": "Sync assets:",
  子域名: "Subdomain",

  服务: "Service",

  按项目建立企业并写入资产范围: "Create a company per project and write its asset scope",

  搜索项目名: "Search project name",

  搜索任务名: "Search task name",

  "已选 {n}": "{n} selected",
  同步选中: "Sync Selected",

  项目名: "Project Name",

  任务名: "Task Name",

  标签: "Tag",

  资产数: "Asset Count",

  状态: "Status",

  时间: "Time",

  上一页: "Previous",

  "第 {n} 页": "Page {n}",
  下一页: "Next",

  "新建/更新企业：": "Created/updated companies: ",
  "…共 {n} 条错误": "…and {n} more errors",
} satisfies Record<string, string>;

export default messages;

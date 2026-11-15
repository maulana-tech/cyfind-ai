/**
 * Asset inventory page translations (keys are the original zh-CN strings).
 */

const messages = {
  "删除失败：{message}": "Delete failed: {message}",
  "已删除 {n} 条资产": "{n} assets deleted",
  "已删除企业，同时删除 {n} 条资产": "Company deleted, along with {n} assets",
  已删除企业: "Company deleted",

  资产: "Assets",

  "共 {n} 项资产": "Total {n} assets",
  "删除已选 ({n})": "Delete selected ({n})",
  刷新: "Refresh",

  企业: "Companies",

  根域名: "Root Domain",

  子域名: "Subdomains",

  应用: "Apps",

  服务: "Services",

  接口: "Endpoints",

  资产数: "Asset Count",

  资产范围: "Asset Scope",

  操作: "Actions",

  未设置范围: "No scope set",

  "删除企业 {name}": "Delete company {name}",
  "还没有企业。点击右上角「新增企业」并填写资产范围，系统会自动认领命中的资产。":
    "No companies yet. Click \u201cNew Company\u201d in the top-right and fill in the asset scope; matching assets are claimed automatically.",
  域名: "Domain",

  "ICP 备案": "ICP Filing",
  归属企业: "Owning Company",

  未归属: "Unassigned",

  C段: "C Segment",

  绑定域名: "Bound Domains",

  开放端口: "Open Ports",

  解析类型: "Record Type",

  解析值: "Record Value",

  应用名: "App Name",

  分类: "Category",

  端口: "Port",

  状态码: "Status Code",

  标题: "Title",

  指纹: "Fingerprint",

  认证: "Auth",

  方法: "Method",

  完整地址: "Full URL",

  参数: "Parameters",

  "删除资产 {name}": "Delete asset {name}",
  确认删除: "Confirm Delete",

  "将永久删除 {n} 条资产记录，此操作不可撤销。":
    "This will permanently delete {n} asset records. This action cannot be undone.",
  取消: "Cancel",

  "删除中…": "Deleting…",
  "删除企业 · {name}": "Delete Company · {name}",
  "此操作将永久删除该企业及其资产范围配置，不可撤销。":
    "This will permanently delete the company and its asset scope configuration. This action cannot be undone.",
  同时删除该企业下的所有资产: "Also delete all assets under this company",

  "不勾选则保留资产，仅取消归属关系": "Leave unchecked to keep the assets and only remove the ownership link",
  "暂无数据。": "No data yet.",
  "加载中…": "Loading…",
  "{n} / 页": "{n} / page",
  请填写企业名称: "Enter a company name",

  请修正无效的资产范围: "Fix the invalid asset scope entries",

  "已创建企业，添加 {added} 条范围；{invalid} 行无效":
    "Company created, {added} scope rules added; {invalid} lines invalid",
  "已创建企业，添加 {added} 条范围": "Company created, {added} scope rules added",
  "企业已存在，请换个名称": "Company already exists; choose a different name",
  "保存失败：{message}": "Save failed: {message}",
  新增企业: "New Company",

  "配置企业及其资产范围。关键词只作为 Agent 提示，不会自动归属资产。":
    "Configure the company and its asset scope. Keywords only serve as hints for the Agent; assets are not claimed automatically.",
  企业名称: "Company Name",

  "如 Acme Corp（名称唯一）": "e.g. Acme Corp (name must be unique)",
  "保存中…": "Saving…",
  保存: "Save",

  "编辑资产范围 · {name}": "Edit Asset Scope · {name}",
  "编辑后将替换全部现有范围。ICP 精确匹配资产，企业关键词仅作为 Agent 提示。":
    "Editing replaces all existing scope. ICP entries match assets exactly; company keywords only serve as hints for the Agent.",
  "归属依据（可选）": "Attribution Basis (optional)",
  "如 证书 / whois / ASN 佐证": "e.g. certificate / whois / ASN evidence",
  "已保存；{n} 行无效": "Saved; {n} lines invalid",
  "范围已更新，共 {n} 条": "Scope updated, {n} rules in total",
  编辑: "Edit",

  覆盖保存: "Overwrite & Save",

  请填写要追加的范围: "Enter the scope to append",

  "已追加 {n} 条范围": "{n} scope rules appended",
  "追加资产范围 · {name}": "Append Asset Scope · {name}",
  "新范围会追加到现有范围。ICP 精确匹配资产，企业关键词仅作为 Agent 提示。":
    "New scope will be appended to the existing scope. ICP entries match assets exactly; company keywords only serve as hints for the Agent.",
  追加: "Append",
  还没有企业: "No companies yet",
  "点击右上角「新增企业」并填写资产范围，系统会自动认领命中的资产。":
    "Click “Add company” at the top right and define the asset scope — matching assets are claimed automatically.",
} satisfies Record<string, string>;

export default messages;

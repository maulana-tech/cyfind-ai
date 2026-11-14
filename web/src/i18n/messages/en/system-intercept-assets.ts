/**
 * System → Asset Intercept page (source keys are the original zh-CN strings).
 */

const messages = {
  "域名（全等）": "Domain (exact)",
  "IP（全等）": "IP (exact)",
  "URL（全等）": "URL (exact)",
  "域名（模糊）": "Domain (fuzzy)",
  "IP（模糊）": "IP (fuzzy)",
  "URL（模糊）": "URL (fuzzy)",
  "CIDR 网段": "CIDR range",
  全等匹配: "Exact match",

  模糊匹配: "Fuzzy match",

  网段: "Range",

  匹配内容不能为空: "Match content is required",

  "CIDR 格式无效，形如 192.168.0.0/16": "Invalid CIDR format; expected something like 192.168.0.0/16",
  加载资产拦截规则失败: "Failed to load asset intercept rules",

  规则已更新: "Rule updated",

  规则已创建: "Rule created",

  规则已删除: "Rule deleted",

  "确定删除资产拦截规则「{pattern}」？": "Delete asset intercept rule “{pattern}”?",
  资产拦截: "Asset Intercept",

  "全局资产黑名单：命中的域名 / IP / URL / 网段将被拦截，不对其执行任何操作":
    "Global asset blocklist: matching domains / IPs / URLs / ranges are intercepted and no action is taken against them",
  "支持全等与模糊匹配的域名 / IP / URL，以及 CIDR 网段；默认内置模糊拦截政府（.gov / .gov.cn）与教育（.edu / .edu.cn）网站":
    "Supports exact and fuzzy matching for domains / IPs / URLs, plus CIDR ranges; built-in fuzzy blocking of government (.gov / .gov.cn) and education (.edu / .edu.cn) sites is on by default",
  新建规则: "New rule",

  "加载中…": "Loading…",
  暂无资产拦截规则: "No asset intercept rules yet",

  新建第一条规则: "Create the first rule",

  类型: "Type",

  匹配内容: "Match content",

  备注: "Note",

  启用: "Enabled",

  内置: "Built-in",

  "[内置] 政府网站 (.gov)": "[Built-in] Government sites (.gov)",
  "[内置] 政府网站 (.gov.cn)": "[Built-in] Government sites (.gov.cn)",
  "[内置] 教育网站 (.edu)": "[Built-in] Education sites (.edu)",
  "[内置] 教育网站 (.edu.cn)": "[Built-in] Education sites (.edu.cn)",
  编辑资产拦截规则: "Edit asset intercept rule",

  新建资产拦截规则: "New asset intercept rule",

  命中此规则的目标资产会被全局拦截: "Target assets matching this rule are intercepted globally",

  匹配类型: "Match type",

  "CIDR 网段，形如 192.168.0.0/16": "CIDR range, e.g. 192.168.0.0/16",
  "模糊匹配：目标包含此内容即命中": "Fuzzy match: hits when the target contains this content",
  "全等匹配：目标需与此内容完全一致": "Exact match: the target must equal this content exactly",
  "备注（可选）": "Note (optional)",
  说明这条规则的用途: "Describe what this rule is for",

  启用此规则: "Enable this rule",

  取消: "Cancel",

  "保存中…": "Saving…",
  保存: "Save",
} satisfies Record<string, string>;

export default messages;

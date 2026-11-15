/**
 * System → Asset Intercept page (source keys are the original zh-CN strings).
 */

const messages = {
  "Domain (exact)": "Domain (exact)",
  "IP (exact)": "IP (exact)",
  "URL (exact)": "URL (exact)",
  "Domain (fuzzy)": "Domain (fuzzy)",
  "IP (fuzzy)": "IP (fuzzy)",
  "URL (fuzzy)": "URL (fuzzy)",
  "CIDR range": "CIDR range",
  "Exact match": "Exact match",
  "Fuzzy match": "Fuzzy match",
  Range: "Range",
  "Match content is required": "Match content is required",
  "Invalid CIDR format; expected something like 192.168.0.0/16":
    "Invalid CIDR format; expected something like 192.168.0.0/16",
  "Failed to load asset intercept rules": "Failed to load asset intercept rules",
  "Rule updated": "Rule updated",
  "Rule created": "Rule created",
  "Rule deleted": "Rule deleted",
  "Delete asset intercept rule “{pattern}”?": "Delete asset intercept rule “{pattern}”?",
  "Asset Intercept": "Asset Intercept",
  "Global asset blocklist: matching domains / IPs / URLs / ranges are intercepted and no action is taken against them":
    "Global asset blocklist: matching domains / IPs / URLs / ranges are intercepted and no action is taken against them",
  "Supports exact and fuzzy matching for domains / IPs / URLs, plus CIDR ranges; built-in fuzzy blocking of government (.gov / .gov.cn) and education (.edu / .edu.cn) sites is on by default":
    "Supports exact and fuzzy matching for domains / IPs / URLs, plus CIDR ranges; built-in fuzzy blocking of government (.gov / .gov.cn) and education (.edu / .edu.cn) sites is on by default",
  "New rule": "New rule",
  "Loading…": "Loading…",
  "No asset intercept rules yet": "No asset intercept rules yet",
  "Create the first rule": "Create the first rule",
  Type: "Type",
  "Match content": "Match content",
  Note: "Note",
  Enabled: "Enabled",
  "Built-in": "Built-in",
  "[Built-in] Government sites (.gov)": "[Built-in] Government sites (.gov)",
  "[Built-in] Government sites (.gov.cn)": "[Built-in] Government sites (.gov.cn)",
  "[Built-in] Education sites (.edu)": "[Built-in] Education sites (.edu)",
  "[Built-in] Education sites (.edu.cn)": "[Built-in] Education sites (.edu.cn)",
  "Edit asset intercept rule": "Edit asset intercept rule",
  "New asset intercept rule": "New asset intercept rule",
  "Target assets matching this rule are intercepted globally":
    "Target assets matching this rule are intercepted globally",
  "Match type": "Match type",
  "CIDR range, e.g. 192.168.0.0/16": "CIDR range, e.g. 192.168.0.0/16",
  "Fuzzy match: hits when the target contains this content": "Fuzzy match: hits when the target contains this content",
  "Exact match: the target must equal this content exactly": "Exact match: the target must equal this content exactly",
  "Note (optional)": "Note (optional)",
  "Describe what this rule is for": "Describe what this rule is for",
  "Enable this rule": "Enable this rule",
  Cancel: "Cancel",
  "Saving…": "Saving…",
  Save: "Save",
} satisfies Record<string, string>;

export default messages;

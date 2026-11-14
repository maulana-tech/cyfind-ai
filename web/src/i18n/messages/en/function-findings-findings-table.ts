/**
 * Findings table translations (keys are the original zh-CN strings).
 */

const messages = {
  // select-all checkboxes (labels come in raw from the caller)
  选择当前页全部: "Select all on this page",
  选择本组当前页全部: "Select all on this page in the group",
  // column headers
  严重度: "Severity",
  漏洞名称: "Finding name",
  资产: "Asset",
  状态: "Status",
  所属任务: "Owning task",
  时间: "Time",
  操作: "Actions",
  // row actions
  选择该漏洞: "Select this finding",
  查看发现详情: "View finding details",
  未分类: "Uncategorized",
  "流量证据 {n} 条": "{n} traffic evidence records",
  查看正在进行的复测会话: "View the in-progress retest session",
  复测中: "Retesting",
  在独立会话中复测该漏洞: "Retest this finding in a separate session",
  复测: "Retest",
  深入: "Deepen",
  // delete confirm
  删除漏洞: "Delete finding",
  "确认删除该漏洞？": "Delete this finding?",
  "「": "“",
  "」将被永久删除， 同时从发现列表、任务发现 Tab 与探索图中移除，此操作不可撤销。":
    "” will be permanently deleted, along with its entries in the findings list, the task's Findings tab and the exploration graph. This cannot be undone.",
  取消: "Cancel",
  删除: "Delete",
  // inline edit
  "可读标题，留空回退类别": "Readable title; leave blank to fall back to the class",
  类别: "Class",
  "如 SQL Injection": "e.g. SQL Injection",
  严重等级: "Severity",
  "保存中…": "Saving…",
  保存: "Save",
  // evidence
  证据: "Evidence",
  "· 类型：": "· Type: ",
  "· 资产：": "· Asset: ",
  // detailed report
  详细报告: "Detailed report",
  已复制详细报告: "Detailed report copied",
  "加载中…": "Loading…",
  "报告加载失败。": "Failed to load the report.",
  "暂无详细报告。": "No detailed report yet.",
  // empty state
  "没有匹配的发现。": "No findings match.",
} satisfies Record<string, string>;

export default messages;

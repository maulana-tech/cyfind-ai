/**
 * Finding detail page translations (keys are the original zh-CN strings).
 */

const messages = {
  "严重等级已改为「{label}」": "Severity changed to “{label}”",
  "处理状态已改为「{label}」": "Processing status changed to “{label}”",
  "更新失败：{message}": "Update failed: {message}",
  "未找到发现 {id}": "Finding {id} not found",
  "加载中…": "Loading…",
  返回发现列表: "Back to findings list",
  未分类: "Uncategorized",
  "来源任务 #{id} · 只读": "Source task #{id} · read-only",
  概览: "Overview",
  链路图: "Chain view",
  摘要: "Summary",
  "（无摘要）": "(no summary)",
  "证据 / PoC": "Evidence / PoC",
  "（无证据）": "(no evidence)",
  详细报告: "Detailed report",
  已复制详细报告: "Detailed report copied",
  "流量证据已变更，详细报告待更新。": "Traffic evidence has changed; the detailed report is out of date.",
  "暂无详细报告。": "No detailed report yet.",
  状态: "Status",
  "漏洞 ID": "Finding ID",
  严重等级: "Severity",
  处理状态: "Processing status",
  漏洞类型: "Vulnerability type",
  涉及资产: "Assets involved",
  所属任务: "Owning task",
  发现时间: "Discovered at",
  "—（任务已删除）": "— (task deleted)",
} satisfies Record<string, string>;

export default messages;

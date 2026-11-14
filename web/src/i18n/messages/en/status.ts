/**
 * Status/severity label translations (keys are the zh-CN labels from lib/status.ts).
 * Render sites wrap them with t() at render time — the data file stays zh.
 */

const status = {
  // intent
  待领: "Unclaimed",

  执行中: "Executing",

  已暂停: "Paused",

  已完成: "Completed",

  执行出错: "Execution Error",

  预算耗尽: "Budget Exhausted",

  已停止: "Stopped",

  已删除: "Deleted",

  // task
  已创建: "Created",

  排队中: "Queued",

  运行中: "Running",

  失败: "Failed",

  已超时: "Timed Out",

  // severity
  严重: "Critical",

  高危: "High",

  中危: "Medium",

  低危: "Low",

  // finding
  待处理: "Pending",

  处理中: "In Progress",

  已确认: "Confirmed",

  已处理: "Handled",

  已修复: "Fixed",

  误报: "False Positive",

  忽略: "Ignored",

  重复: "Duplicate",

  风险接受: "Risk Accepted",

  // engine
  探索中: "Exploring",

  停滞: "Stalled",

  空闲: "Idle",

  // goal
  进行中: "Active",

  已达成: "Met",

  已放弃: "Abandoned",

  // audit (allow/block rule action)
  放行: "Allow",

  拦截: "Block",

  // exploration node
  观测: "Observed",

  确认: "Confirmed",

  废弃: "Deprecated",

  // notification delivery
  待发送: "Pending Send",

  发送中: "Sending",

  已送达: "Sent",

  已跳过: "Skipped",
} satisfies Record<string, string>;

export default status;

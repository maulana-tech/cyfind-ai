/**
 * Approval records page (approval-records.tsx): intercept approval queue,
 * history table, detail panel and model-review context.
 */

const messages = {
  // Origin / status / match cell
  "对话 #{id}": "Chat #{id}",
  "任务 {id}": "Task {id}",
  "定位审批 #{id} 的来源：{label}": "Locate the source of approval #{id}: {label}",
  无法定位对应执行: "Could not locate the corresponding execution",

  待审批: "Pending approval",

  已允许: "Allowed",

  已拒绝: "Denied",

  已超时: "Timed out",

  模型判定: "Model decision",

  规则判定: "Rule decision",

  规则未记录或已删除: "Rule not recorded or deleted",

  未记录理由: "No reason recorded",

  // CodeBlock
  已复制: "Copied",

  "复制失败，请手动选择内容复制": "Copy failed; please select and copy manually",
  "复制{label}": "Copy {label}",
  未记录: "Not recorded",

  "内容已截断，以上为保存的片段。": "Content truncated; the saved excerpt is shown above.",

  // Model review context
  模型审查上下文: "Model Review Context",

  "以下为本次实际发送给审查模型的输入快照。背景仅用于理解当前动作，裁决依据为审查策略。":
    "Below is a snapshot of the input actually sent to the review model this time. Background is only for understanding the action; the review policy is the basis for the verdict.",
  "此记录使用旧版输入，保留当时实际发送的内容。":
    "This record uses the legacy input format and keeps what was actually sent at the time.",
  当前待审查调用: "Current Call Under Review",

  "背景 · 用户消息": "Background · User Message",
  "背景 · Worker 意图摘要（旧版）": "Background · Worker Intent Summary (legacy)",
  "取自当前用户消息。": "Taken from the current user message.",
  "这是旧版发送的 Worker 意图摘要；新版 Worker 审查不再发送此内容。":
    "This is the legacy Worker intent summary; new Worker reviews no longer send it.",
  "本次审查未附带背景消息。": "This review did not include a background message.",
  "当前轮输入（旧版）": "Current Turn Input (legacy)",
  "任务描述（旧版）": "Task Description (legacy)",
  "任务目标（旧版）": "Task Goal (legacy)",
  "任务操作约束（旧版）": "Task Action Constraints (legacy)",
  "Worker 意图（旧版）": "Worker Intent (legacy)",
  工作目录: "Working Directory",

  "本次审查未发送历史调用或执行结果。": "This review did not send historical calls or execution results.",
  "当时提供给模型的历史调用（旧版）": "Historical Calls Provided to the Model at the Time (legacy)",
  成功: "Succeeded",

  "失败（可能有部分副作用）": "Failed (may have partial side effects)",
  历史调用参数: "Historical Call Arguments",

  历史执行结果: "Historical Execution Result",

  "本次未提供可配对的历史工具执行记录。": "No pairable historical tool execution records were provided.",
  "历史为有限窗口，部分内容已截断。": "History is a limited window; some content has been truncated.",
  "查看完整模型审查输入 JSON": "View Full Model Review Input JSON",
  模型审查输入: "Model Review Input",

  // Decision actions
  允许: "Allow",

  拒绝: "Deny",

  转人工审批: "Escalate to human approval",

  // Detail panel
  详情加载失败: "Failed to load details",

  "详情加载失败：{error}": "Failed to load details: {error}",
  " · 工具请求": " · Tool Call",
  查看命令内容: "View Command Content",

  命令内容: "Command Content",

  "执行结果：": "Execution result: ",
  "加载中…": "Loading…",
  审查状态: "Review Status",

  审批裁决: "Approval Decision",

  未记录审批理由: "No approval reason recorded",

  "最终动作：": "Final action: ",
  来源: "Source",

  申请时间: "Requested at",

  决定时间: "Decided at",

  规则快照: "Rule Snapshot",

  审批模型配置: "Approval Model Profile",

  重试详情: "Retry Details",

  "此记录未保存审批详情快照，无法还原当时的上下文、模型初判和执行输出。":
    "This record has no saved approval detail snapshot; the context, model verdict and execution output from that time cannot be reconstructed.",
  收起上下文: "Collapse Context",

  查看上下文与执行结果: "View Context & Execution Result",

  "此历史记录仅保存审查输入指纹，未保存输入原文，无法还原当时发给模型的上下文。这不代表审查时没有上下文；新产生的模型裁决会保留输入快照。":
    "This historical record only stores a fingerprint of the review input, not the original text, so the context sent to the model cannot be reconstructed. This does not mean there was no context at review time; new model verdicts keep an input snapshot.",
  "此记录没有保存模型审查输入，可能由规则直接裁决、模型调用前发生异常或产生于旧版本。":
    "This record has no saved model review input; it may have been decided directly by a rule, failed before the model call, or originated from an old version.",
  查看会话审计片段: "View Conversation Audit Excerpt",

  "查看会话审计片段（未发送模型）": "View Conversation Audit Excerpt (not sent to the model)",
  "会话当前轮输入（审计片段）": "Current Turn Input (audit excerpt)",
  可见会话上下文: "Visible Conversation Context",

  "保存于 {time} 的会话记录片段。模型实际使用的内容以“模型审查输入”为准。":
    'An excerpt of the conversation captured at {time}. The content actually used by the model is defined by "Model Review Input".',
  "仅保存最近的上下文，部分内容已截断。": "Only the most recent context is stored; some content has been truncated.",
  " · 异常": " · Error",
  未记录可关联的上下文: "No correlatable context recorded",

  模型初判: "Initial Model Verdict",

  规则初判: "Initial Rule Verdict",

  模型异常回退: "Model Fallback (error)",

  执行输出: "Execution Output",

  "工具未执行。": "The tool was not executed.",
  尚无执行输出: "No execution output yet",

  "存在相同参数的并发调用，无法唯一关联工具调用；本记录不展示推测的执行结果。":
    "Concurrent calls with identical arguments exist, so the tool call cannot be uniquely correlated; no guessed execution result is shown.",
  "未记录可唯一关联的工具调用 ID。": "No tool call ID that can be uniquely correlated was recorded.",
  "工具调用 ID：": "Tool call ID: ",
  "参数摘要 SHA-256：": "Arguments digest SHA-256: ",
  "审查配置指纹 SHA-256：": "Review config fingerprint SHA-256: ",
  "模型审查输入 SHA-256：": "Model review input SHA-256: ",
  "结果记录时间：": "Result recorded at: ",

  // Context labels (data map values translated at render)
  用户消息: "User Message",

  "Agent 消息": "Agent Message",
  工具请求: "Tool Request",

  工具输出: "Tool Output",

  // Execution status labels (data map values translated at render)
  尚未执行: "Not executed yet",

  未执行: "Not executed",

  "已允许，等待执行结果": "Allowed; awaiting execution result",
  执行成功: "Executed successfully",

  执行失败: "Execution failed",

  执行结果未知: "Execution result unknown",

  未关联执行结果: "No correlated execution result",

  // Table
  展开详情: "Expand details",

  工具: "Tool",

  匹配规则: "Matched Rule",

  参数: "Arguments",

  状态: "Status",

  "收起审批 #{id}": "Collapse approval #{id}",
  "展开审批 #{id}": "Expand approval #{id}",
  "审批详情 #{id}": "Approval details #{id}",

  // Page shell
  加载失败: "Failed to load",

  已允许执行: "Execution allowed",

  已拒绝执行: "Execution denied",

  "规则 #{id}": "Rule #{id}",
  拦截审批: "Intercept Approvals",

  审批记录: "Approval Records",

  "{n} 待审批": "{n} pending",
  刷新: "Refresh",

  "展开记录查看工具请求和审批裁决，以及当时的上下文与执行结果。":
    "Expand a record to view the tool call, the approval decision, and the context and execution result from that time.",
  审批记录筛选: "Approval records filter",

  审批状态: "Approval Status",

  全部状态: "All statuses",

  全部来源: "All sources",

  判定来源: "Decision Source",

  来源未知: "Unknown source",

  清除筛选: "Clear Filters",

  "记录加载失败：{error}。请点击刷新重试。": "Failed to load records: {error}. Click Refresh to retry.",
  "待审批加载失败：{error}。请点击刷新重试。": "Failed to load pending approvals: {error}. Click Refresh to retry.",
  "待处理（{n}）": "Pending ({n})",
  展开后允许或拒绝: "expand to allow or deny",

  待处理审批: "Pending approvals",

  筛选结果: "Filtered results",

  全部记录: "All records",

  没有符合筛选条件的审批记录: "No approval records match the filters",

  暂无审批记录: "No approval records yet",

  "请调整审批状态或判定来源，或清除筛选查看全部记录。":
    "Adjust the approval status or decision source, or clear the filters to see all records.",
  "规则或模型作出审批决定后，记录将显示在这里。":
    "Records appear here once a rule or the model makes an approval decision.",
  审批记录列表: "Approval records list",
} satisfies Record<string, string>;

export default messages;

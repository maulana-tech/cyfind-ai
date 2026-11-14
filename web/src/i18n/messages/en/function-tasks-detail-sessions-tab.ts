/**
 * Task detail → Sessions tab (session list, transcript, worker controls).
 */

const messages = {
  未命名配置: "Unnamed profile",

  "主 Agent": "Main Agent",
  "规划 Planner": "Planner",
  系统审计: "System Audit",

  入: "In",

  缓: "Cache",

  出: "Out",

  input: "input",
  cache: "cache",
  output: "output",
  "主 Agent · 会话 #{n}": "Main Agent · Session #{n}",
  "规划 Planner · 态势研判": "Planner · Situation Assessment",
  "系统事件 · LLM 故障转移": "System Events · LLM Failover",
  "来源 #{n}": "From #{n}",
  实时: "Live",

  "删除该意图（需填写原因，可选假删除/真删除）":
    "Delete this intent (a reason is required; choose soft or hard delete)",
  "当前资产：{label}": "Current asset: {label}",
  "来源任务 #{n}": "From task #{n}",
  "上传失败：{message}": "Upload failed: {message}",
  "新建会话失败：{message}": "Failed to create session: {message}",
  请填写删除原因: "Enter a reason for deletion",

  "Worker #{id} 发消息": "Send message to Worker #{id}",
  "Worker #{id} 已暂停": "Worker #{id} paused",
  "Worker #{id} 已恢复，等待重新领取": "Worker #{id} resumed, waiting to be picked up again",
  "（含 {intents} 意图 / {facts} 事实 / {findings} 漏洞）":
    " ({intents} intents / {facts} facts / {findings} findings included)",
  "Worker #{id} 及其独占下游已彻底删除{extra}": "Worker #{id} and its exclusive downstream permanently deleted{extra}",
  "Worker #{id} 已删除（原因已记录，规划者将据此重新规划）":
    "Worker #{id} deleted (reason recorded; the planner will re-plan accordingly)",
  "Worker 操作失败：{message}": "Worker action failed: {message}",
  加载失败: "Load failed",

  "加载失败：{error}": "Load failed: {error}",
  "发送失败：{message}": "Failed to send: {message}",
  请稍后重试: "Please try again later",

  "消息不能超过 {max} 个字符": "Messages can be at most {max} characters",
  "消息已发送给 Worker #{id}，已立即继续执行": "Message sent to Worker #{id}; execution resumed immediately",
  会话列表: "Sessions",

  实时连接正常: "Live connection OK",

  "实时连接中断，正在自动重连（历史仍可见）":
    "Live connection lost — reconnecting automatically (history remains visible)",
  重连中: "Reconnecting",

  任务总计: "Task total",

  "输入 {input} · 输出 {output} · 缓存读取 {cacheRead} · 缓存写入 {cacheWrite}":
    "Input {input} · Output {output} · Cache read {cacheRead} · Cache write {cacheWrite}",
  "新建主 Agent 会话（清空上下文，任务状态保留）": "New Main Agent session (clears context; task state is kept)",
  "新建主 Agent 会话": "New Main Agent session",
  新建: "New",

  "加载更早的 Worker": "Load earlier Workers",
  "暂无运行中的 Worker 会话。": "No running Worker sessions.",
  "Worker 执行会话": "Worker Session",
  "当前配置：{label}": "Current profile: {label}",
  模型不可用: "Model unavailable",

  "没有可用的 LLM 配置": "No LLM profile available",
  "来源任务 #{id} · 只读历史": "From task #{id} · read-only history",
  向上滚动加载更早历史: "Scroll up to load earlier history",

  "↑ 更早历史": "↑ Earlier history",
  "运行时长（首步 → 末步）": "Run duration (first → last step)",
  可交互: "Interactive",

  此意图已被用户删除: "This intent was deleted by the user",

  "（已停止执行，规划者已收到通知；意图与产出保留，可在下方查看历史）":
    " (execution stopped, the planner has been notified; the intent and its outputs are kept — history is viewable below)",
  "删除原因：": "Deletion reason: ",
  "加载更早历史…": "Loading earlier history…",
  "加载活动流…": "Loading activity stream…",
  重试: "Retry",

  "还没有对话。在下方给主 Agent 发消息，引导探索方向或介入流程。":
    "No conversation yet. Message the Main Agent below to steer the exploration or step in.",
  "暂无活动记录。": "No activity yet.",
  移除: "Remove",

  "给主 Agent 发消息": "Message the Main Agent",
  "主 Agent 正在运行，可输入 /btw 提问…": "Main Agent is running — type /btw to ask a side question…",
  "给主 Agent 发消息，@ 引用漏洞、资产等…": "Message the Main Agent; @ to reference findings, assets, …",
  上传文件: "Upload file",

  发送旁路问题: "Send side question",

  停止当前执行: "Stop current run",

  发送消息: "Send message",

  "给 Worker #{id} 发消息": "Message Worker #{id}",
  "给 Worker #{id} 发消息，@ 引用记录，调整执行方向…":
    "Message Worker #{id}; @ to reference records and adjust its direction…",
  "暂停当前 Worker": "Pause current Worker",
  "不发消息，直接继续执行": "Resume without sending a message",
  直接继续执行: "Resume now",

  直接继续: "Resume",

  "删除 Worker #{id}？": "Delete Worker #{id}?",
  真删除: "Hard delete",

  "会物理移除该意图，以及": " permanently removes this intent, and its",
  仅由它支撑: "downstream nodes that only it supports",

  "的下游节点（级联到叶子，避免留下孤立数据）；共享节点、目标和任务根事实会保留。":
    " (cascaded to leaves to avoid orphaned data); shared nodes, goals, and task root facts are kept.",
  "此操作不可恢复。": "This cannot be undone.",
  "规划者会收到删除通知并据此重新规划。": "The planner is notified and will re-plan accordingly.",
  假删除: "Soft delete",

  "会把该意图置为「已删除」并记录删除原因，意图节点、执行记录、已登记的事实和漏洞":
    " marks the intent as “Deleted” and records the reason; the intent node, execution records, and registered facts and findings",
  都会保留: "are all kept",

  "。规划者会收到「该意图由用户删除 + 原因」并据此重新规划。":
    ". The planner receives “deleted by the user + reason” and re-plans accordingly.",
  "保留数据，可追溯": "Keeps data, fully traceable",
  "级联移除，不可恢复": "Cascaded removal, cannot be undone",
  "删除原因（必填）": "Deletion reason (required)",
  "说明为什么删除这条意图，例如：方向判断错误 / 目标已失效 / 与其他意图重复…":
    "Explain why this intent is being deleted, e.g. wrong direction / goal no longer valid / duplicate of another intent…",
  返回: "Back",

  彻底删除: "Delete permanently",

  确认删除: "Confirm delete",

  "开启新会话？": "Start a new session?",
  "当前会话会被归档（可随时切回），主 Agent 将以干净的上下文继续。任务的图谱、资产、目标不受影响。":
    "The current session is archived (you can switch back anytime) and the Main Agent continues with a clean context. The task's graph, assets, and goals are unaffected.",
  取消: "Cancel",

  "开启中…": "Starting…",
  开启新会话: "Start new session",
} satisfies Record<string, string>;

export default messages;

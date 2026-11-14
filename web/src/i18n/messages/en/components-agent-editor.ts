/**
 * Agent editor drawer (agent-editor.tsx): config, prompt, wrapup, MCP/Skill
 * visibility, tool bindings and custom-agent triggers.
 */

const messages = {
  // Prompt tab: toasts & dialogs
  "保存失败：{error}": "Save failed: {error}",
  "恢复失败：{error}": "Restore failed: {error}",
  "渲染错误：{error}": "Render error: {error}",
  "预览失败：{error}": "Preview failed: {error}",
  "已保存为版本 v{version}": "Saved as version v{version}",
  "已恢复为内置默认（v{version}）": "Restored to the built-in default (v{version})",
  已恢复为内置默认: "Restored to the built-in default",

  "收尾配置已保存（下次运行生效）": "Wrap-up configuration saved (applies to the next run)",
  "已清空，将使用内置默认": "Cleared; the built-in default will be used",
  "任务超时收尾配置已保存（下次运行生效）": "Task-timeout wrap-up configuration saved (applies to the next run)",
  "已加载 v{version} 到编辑器，确认后点「保存为新版本」":
    'Loaded v{version} into the editor; click "Save as New Version" when done',
  "已保存运行配置（立即生效）": "Run configuration saved (applied immediately)",
  "未找到 Agent：{key}": "Agent not found: {key}",
  配置与提示词: "Configuration & Prompt",

  预览渲染: "Preview Render",

  渲染预览: "Render Preview",

  "所有 {{.Var}} 已由后端用示例值替换。":
    "All {{.Var}} placeholders have been replaced by the backend with example values.",
  保存为新版本: "Save as New Version",

  恢复默认: "Restore Default",

  加载到编辑器: "Load into Editor",

  与当前版本对比: "Compare with Current Version",

  "版本对比：v{old} → v{new}（当前）": "Version diff: v{old} → v{new} (current)",
  "- 删除": "- Removed",
  "+ 新增": "+ Added",
  版本历史: "Version History",

  当前: "Current",

  "（暂无保存的版本，使用内置默认）": "(No saved versions; using the built-in default)",
  "（无备注）": "(No note)",
  "（空）": "(Empty)",

  // LLM / run config section
  "默认模型（LLM 配置）": "Default Model (LLM Profile)",
  "跟随任务 / 全局激活配置": "Follow task / globally active profile",
  " · 默认": " · Default",
  "为该 Agent 绑定固定 LLM 配置（点「保存配置」生效）。优先级：Agent 绑定 > 任务/会话指定 > 全局激活。":
    'Bind a fixed LLM profile to this Agent (applies when you click "Save Configuration"). Priority: Agent binding > task/session setting > global active profile.',
  "最大循环次数（0=不限）": "Max turns (0 = unlimited)",
  "运行时长（秒，0=不限）": "Run time (seconds, 0 = unlimited)",
  保存配置: "Save Configuration",

  网络搜索: "Web Search",

  "为该 Agent 开启后（点上方保存生效），可用 web_search 联网检索":
    "When enabled for this Agent (applies after saving above), web_search can query the internet",
  "需先在「系统配置」开启网络搜索并配置后端，才能在此启用":
    "Enable Web Search in System Settings and configure the backend first",
  "交互式 Shell": "Interactive Shell",
  "为该 Agent 开启后（点上方保存生效），可用持久 PTY 会话工具（shell_open/send/read/close/list）驱动 msfconsole/ssh/REPL 等交互程序":
    "When enabled for this Agent (applies after saving above), persistent PTY session tools (shell_open/send/read/close/list) can drive interactive programs like msfconsole/ssh/REPL",

  // Variables & prompt body
  "变量（点击插入占位符，渲染时由运行时数据替换）":
    "Variables (click to insert a placeholder; replaced with runtime data at render time)",
  "示例：{example}": "Example: {example}",
  "（无变量）": "(No variables)",
  留空则使用内置默认提示词: "Leave empty to use the built-in default prompt",

  // Visibility & tool bindings
  "已取消 MCP「{name}」可见": 'MCP "{name}" is no longer visible to this agent',
  "已开启 MCP「{name}」可见": 'MCP "{name}" is now visible to this agent',
  "已取消 Skill「{name}」可见": 'Skill "{name}" is no longer visible to this agent',
  "已开启 Skill「{name}」可见": 'Skill "{name}" is now visible to this agent',
  "已解绑工具「{key}」": 'Unbound tool "{key}"',
  "已绑定工具「{key}」": 'Bound tool "{key}"',
  "保存工具绑定失败：{error}": "Failed to save tool binding: {error}",
  "勾选此 Agent 可见的 MCP 服务器。": "Check the MCP servers this Agent can see.",
  "（暂无 MCP）": "(No MCP servers)",
  "勾选此 Agent 可见的 Skill。": "Check the Skills this Agent can see.",
  "（暂无 Skill）": "(No Skills)",
  "勾选绑定给此 Agent 的内置工具。": "Check the built-in tools bound to this Agent.",
  流量: "Traffic",

  已停用: "Disabled",

  需开启流量捕获: "Traffic capture must be enabled",

  "（暂无工具）": "(No tools)",

  // Wrapup tab
  收尾提示词: "Wrap-up Prompt",

  "当此 Agent 因": "When this Agent is terminated due to",
  超时: "timeout",

  或: " or ",

  步数耗尽: "step exhaustion",

  "被终止时，系统会注入这段「收尾提示词」跑一轮收尾： 先把已识别但未落库的内容写回，再输出一句总结（避免烂尾）。留空则使用内置默认。":
    ', the system injects this "wrap-up prompt" to run one wrap-up turn: first persist anything identified but not yet saved, then output a brief summary (to avoid an unfinished run). Leave empty to use the built-in default.',
  收尾提示词正文: "Wrap-up Prompt Body",

  自定义: "Custom",

  使用内置默认: "Using built-in default",

  留空则使用内置默认收尾提示词: "Leave empty to use the built-in default wrap-up prompt",

  "收尾轮数（收尾阶段自身最多跑几轮；0=用内置默认 {turns} 轮）":
    "Wrap-up turns (max turns for the wrap-up phase itself; 0 = built-in default of {turns} turns)",
  保存: "Save",

  "内置默认（只读，供参考）": "Built-in default (read-only, for reference)",
  任务超时收尾: "Task-timeout wrap-up",

  "（与上面的 per-run 收尾是": " (this is a ",
  两套: "separate mechanism",

  "）：当": " from the per-run wrap-up above): injected when the ",
  整个任务: "whole task",

  "到达超时上限、即将结束时注入。 与 per-run 语义常相反（如 planner：per-run 说“别停继续规划”，任务超时说“到点停止、做最后判定”）。留空则用内置默认。":
    " reaches its timeout limit and is about to end. Its semantics often differ from the per-run wrap-up (e.g. planner: per-run says “keep going, keep planning”, task timeout says “stop now, make a final call”). Leave empty to use the built-in default.",
  任务超时收尾提示词正文: "Task-timeout Wrap-up Prompt Body",

  留空则使用内置默认任务超时收尾提示词: "Leave empty to use the built-in default task-timeout wrap-up prompt",

  "收尾轮数（0=用内置默认 {turns} 轮）": "Wrap-up turns (0 = built-in default of {turns} turns)",

  // Triggers tab
  触发: "Triggers",

  "保存策略失败：{error}": "Failed to save behavior policy: {error}",
  至少选择一种触发条件: "Select at least one trigger condition",

  工具调用触发至少选择一个工具: "Tool-call triggers require at least one tool",

  已保存修改: "Changes saved",

  已添加触发器: "Trigger added",

  "添加失败：{error}": "Failed to add: {error}",
  "删除失败：{error}": "Delete failed: {error}",
  "每 {sec}s": "Every {sec}s",
  "发现 finding": "Finding discovered",
  目标达成: "Goal met",

  任务超时: "Task timeout",

  "工具调用({n})": "Tool call ({n})",
  任务创建: "Task created",

  "（无条件）": "(No conditions)",
  "触发器让这个自定义 Agent 自动运行：每次触发都": "Triggers make this custom Agent run automatically; each trigger ",
  新建一个会话运行: "starts a new conversation run",

  "（在「对话」页可见）。 可多选触发条件；系统会把「本次为何触发 + 相关任务/finding/目标」自动附加到你写的基础消息后面。":
    ' (visible on the Chat page). You can select multiple conditions; the system appends "why this fired + related task/finding/goal" to your base message.',
  "触发后处理策略（决定触发如何排队/合并运行）":
    "Post-trigger behavior (controls how triggered runs are queued and merged)",
  运行模式: "Run Mode",

  "串行（排队，一次一个）": "Serial (queued, one at a time)",
  "并行（各自并发会话）": "Parallel (concurrent sessions)",
  合并模式: "Merge Mode",

  按任务合并: "Merge by task",

  全部合并成一条: "Merge all into one",

  不合并: "No merging",

  "最大并发（0=不限）": "Max concurrency (0 = unlimited)",
  "并行：每次触发立即各开一个会话并发运行，不合并；超过最大并发的触发排队等空位。":
    "Parallel: each trigger immediately opens its own session and runs concurrently, with no merging; triggers beyond max concurrency queue for a free slot.",
  "串行·按任务合并：同 agent 一次跑一个；排队中同一任务的事件触发合并成一条会话。":
    "Serial · merge by task: one run at a time per agent; queued events for the same task are merged into one session.",
  "串行·全部合并：同 agent 一次跑一个；取队列时把当前排队的所有触发合并成一条会话。":
    "Serial · merge all: one run at a time per agent; when dequeuing, all currently queued triggers are merged into one session.",
  "串行·不合并：同 agent 一次跑一个；每条触发各自一个会话。":
    "Serial · no merging: one run at a time per agent; each trigger gets its own session.",
  "编辑触发器 #{id}（改完点「保存修改」）": 'Edit trigger #{id} (click "Save Changes" when done)',
  "新增触发器（每种条件可填各自的用户消息）": "New trigger (each condition can have its own user message)",
  定时触发: "Timed trigger",

  每: "Every",

  秒: "seconds",

  "定时触发时发给 agent 的话，如：巡检所有任务":
    "Message sent to the agent on each timed trigger, e.g. inspect all tasks",
  "发现 finding 时触发": "Trigger on finding discovered",
  "发现 finding 时发给 agent 的话（系统会附带任务与 finding 详情）":
    "Message sent to the agent when a finding is discovered (the system attaches the task and finding details)",
  目标达成时触发: "Trigger on goal met",

  "目标达成时发给 agent 的话（系统会附带任务与达成的目标）":
    "Message sent to the agent when a goal is met (the system attaches the task and the met goal)",
  任务超时时触发: "Trigger on task timeout",

  "任务超时时发给 agent 的话（系统会附带任务编号与目标）":
    "Message sent to the agent when a task times out (the system attaches the task ID and goal)",
  工具调用时触发: "Trigger on tool call",

  "选择要监听的工具（至少一个）；任务执行中这些工具每次":
    "Select the tools to watch (at least one); during task execution, every ",
  调用完成: "tool call completion",

  "都会触发。已选 {n} 个。": " for these tools fires the trigger. {n} selected.",
  "（工具列表为空）": "(Tool list is empty)",
  "工具被调用时发给 agent 的话（系统会附带任务信息、工具入参与返回内容）":
    "Message sent to the agent when a tool is called (the system attaches task info, tool arguments and return content)",
  任务创建时触发: "Trigger on task created",

  "任务被创建时发给 agent 的话（系统会附带任务编号与目标）":
    "Message sent to the agent when a task is created (the system attaches the task ID and goal)",
  保存修改: "Save Changes",

  添加触发器: "Add Trigger",

  取消编辑: "Cancel Edit",

  已有触发器: "Existing Triggers",

  "（暂无）": "(None yet)",
  "定时：{message}": "Timed: {message}",
  "finding：{message}": "Finding: {message}",
  "目标：{message}": "Goal: {message}",
  "超时：{message}": "Timeout: {message}",
  "任务创建：{message}": "Task created: {message}",
  "工具：": "Tools:",
  "（未选）": "(none selected)",
  "消息：{message}": "Message: {message}",
  编辑: "Edit",

  删除: "Delete",
} satisfies Record<string, string>;

export default messages;

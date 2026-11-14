/**
 * Task list page translations (keys are the original zh-CN strings).
 */

const messages = {
  "删除资产 {n} 条": "{n} assets deleted",
  "解除共享资产关联 {n} 条": "{n} shared asset links removed",
  "删除流量 {n} 条": "{n} traffic records deleted",
  删除任务文件: "task files deleted",

  "删除漏洞 {n} 条": "{n} findings deleted",
  "删除 LLM 请求/响应记录 {n} 条": "{n} LLM request/response records deleted",
  "任务已删除（{details}）": "Task deleted ({details})",
  "，": ", ",
  任务已删除: "Task deleted",

  "{summary}；部分外部数据清理未完成：{warning}": "{summary}; some external data cleanup did not complete: {warning}",
  "删除失败：{message}": "Delete failed: {message}",
  "任务 #{id} 已暂停": "Task #{id} paused",
  "任务 #{id} 已继续{queued}": "Task #{id} resumed{queued}",
  "，已进入队列": ", queued",
  "暂停失败：{message}": "Pause failed: {message}",
  "继续失败：{message}": "Resume failed: {message}",
  "任务 #{id} 已重命名": "Task #{id} renamed",
  "重命名失败：{message}": "Rename failed: {message}",
  "任务 #{id} 已取消置顶": "Task #{id} unpinned",
  "任务 #{id} 已置顶": "Task #{id} pinned",
  "取消置顶失败：{message}": "Unpin failed: {message}",
  "置顶失败：{message}": "Pin failed: {message}",
  "任务 #{id} 已进入归档队列": "Task #{id} queued for archival",
  "归档失败：{message}": "Archive failed: {message}",
  "#{id}：{warning}": "#{id}: {warning}",
  "已删除 {n} 个任务（{details}）": "Deleted {n} tasks ({details})",
  "已删除 {n} 个任务": "Deleted {n} tasks",
  "；": "; ",
  "#{id}（{message}）": "#{id} ({message})",
  "{n} 个任务删除失败：{details}{more}": "{n} tasks failed to delete: {details}{more}",
  " 等": " and more",
  "已将 {n} 个任务加入归档队列": "Queued {n} tasks for archival",
  "{n} 个任务无法归档：{details}": "{n} tasks could not be archived: {details}",
  状态已变化: "Status has changed",

  "一次最多控制 100 个任务": "Control at most 100 tasks at a time",
  "已暂停 {n} 个任务": "Paused {n} tasks",
  "已继续 {n} 个任务{queued}": "Resumed {n} tasks{queued}",
  "，部分任务已进入队列": ", some tasks queued",
  "{n} 个任务操作失败：{details}{more}": "{n} tasks failed: {details}{more}",
  "批量暂停失败：{message}": "Bulk pause failed: {message}",
  "批量继续失败：{message}": "Bulk resume failed: {message}",
  "一次最多修改 100 个任务的分类": "Change categories for at most 100 tasks at a time",
  未分类: "Uncategorized",

  "已将 {n} 个任务移动到「{category}」": "Moved {n} tasks to \u201c{category}\u201d",
  任务已不存在: "Task no longer exists",

  "{n} 个任务未能移动：{details}{more}": "{n} tasks could not be moved: {details}{more}",
  "修改分类失败：{message}": "Failed to change category: {message}",
  当前任务: "Current Tasks",

  已归档: "Archived",

  "搜索描述 / 目标 / ID": "Search description / goal / ID",
  清除搜索: "Clear search",

  状态: "Status",

  全部状态: "All statuses",

  任务分类: "Task categories",

  全部分类: "All categories",

  "{shown}/{total} 条": "{shown}/{total}",
  "已选 {n} 个": "{n} selected",
  取消选择: "Clear selection",

  "暂停 {n}": "Pause {n}",
  "继续 {n}": "Resume {n}",
  "归档 {n}": "Archive {n}",
  "暂无任务，点击右上角「新建任务」开始。": "No tasks yet. Click \u201cNew Task\u201d in the top right to start.",
  "没有匹配的任务。": "No matching tasks.",
  选择本页全部任务: "Select all tasks on this page",

  名称: "Name",

  描述: "Description",

  目标: "Goal",

  目标进度: "Goal progress",

  "严重 / 高 / 中 / 低": "Critical / High / Medium / Low",
  漏洞: "Findings",

  "严/高/中/低": "C/H/M/L",
  "运行中 Worker": "Running Workers",
  操作: "Actions",

  "按{label}倒序排序": "Sort by {label} descending",
  "{label}当前正序，点击切换排序方向": "{label}: ascending — click to toggle sort direction",
  "{label}当前倒序，点击切换排序方向": "{label}: descending — click to toggle sort direction",
  "已开启并发限制：最多同时运行 {n} 个任务": "Concurrency limit enabled: at most {n} tasks run at once",
  已关闭任务并发限制: "Task concurrency limit disabled",

  "保存失败：{message}": "Save failed: {message}",
  任务并发设置: "Task concurrency settings",

  并发设置: "Concurrency settings",

  任务并发限制: "Task concurrency limit",

  "限制同时运行的任务数量。达到上限后，新任务会按创建顺序排队并在空位出现时自动启动。":
    "Limit how many tasks run at once. When the limit is reached, new tasks queue in creation order and start automatically as slots free up.",
  开启任务并发限制: "Enable task concurrency limit",

  默认关闭: "Off by default",

  同时运行上限: "Max concurrent runs",

  取消: "Cancel",

  保存: "Save",

  "选择任务 {id}": "Select task {id}",
  已置顶: "Pinned",

  "输入 {input} · 缓存 {cache} · 输出 {output}": "In {input} · Cached {cache} · Out {output}",
  入: "In",

  " · 缓 ": " · Cached ",
  " · 出 ": " · Out ",
  查看任务详情: "View task details",

  "任务 #{id} 名称": "Task #{id} name",
  未命名: "Untitled",

  "重命名任务 #{id}": "Rename task #{id}",
  重命名: "Rename",

  "取消置顶任务 #{id}": "Unpin task #{id}",
  "置顶任务 #{id}": "Pin task #{id}",
  取消置顶: "Unpin",

  置顶: "Pin",

  继续任务: "Resume task",

  暂停任务: "Pause task",

  该状态不可暂停或继续: "This state cannot be paused or resumed",

  排队中的任务必须先暂停: "Queued tasks must be paused first",

  运行中或尚未结束的任务必须先暂停: "Running or unfinished tasks must be paused first",

  "任务被未归档任务 #{id} 直接继承，请先归档依赖任务":
    "Task is directly inherited by un-archived task #{id}; archive the dependent task first",
  归档任务: "Archive task",

  "归档 {n} 个任务": "Archive {n} tasks",
  "归档会停止任务调度，将图谱、LLM 历史、文件以及独占资产和流量压缩到本地冷存储。归档完成后可从“已归档”中还原。":
    "Archiving stops task scheduling and compresses the graph, LLM history, files, and exclusive assets and traffic into local cold storage. Archived tasks can be restored from the \u201cArchived\u201d tab.",
  确认归档: "Confirm archive",

  "归档任务 #{id}": "Archive task #{id}",
  "{size} · 节省 {pct}%": "{size} · {pct}% saved",
  "永久删除 {n} 个任务归档？": "Permanently delete {n} task archives?",
  "将永久删除约 {size} 的归档包及 {rows} 条关联数据快照。此操作不可恢复。":
    "This permanently deletes about {size} of archive bundles and {rows} related data snapshots. This cannot be undone.",
  永久删除: "Delete permanently",

  "读取归档列表失败：{message}": "Failed to load archive list: {message}",
  "已将 {n} 个任务加入还原队列": "Queued {n} tasks for restore",
  "{n} 个任务无法还原": "{n} tasks could not be restored",
  "还原失败：{message}": "Restore failed: {message}",
  "已将 {n} 个归档加入永久删除队列": "Queued {n} archives for permanent deletion",
  "{n} 个归档无法删除": "{n} archives could not be deleted",
  "永久删除失败：{message}": "Permanent deletion failed: {message}",
  已重新加入处理队列: "Requeued for processing",

  "重试失败：{message}": "Retry failed: {message}",
  "搜索任务名称 / 描述 / ID": "Search task name / description / ID",
  处理状态: "Processing status",

  等待归档: "Waiting to archive",

  归档中: "Archiving",

  可还原: "Restorable",

  等待还原: "Waiting to restore",

  还原中: "Restoring",

  等待删除: "Queued for deletion",

  删除中: "Deleting",

  归档失败: "Archive failed",

  还原失败: "Restore failed",

  删除失败: "Delete failed",

  "{n} 个归档": "{n} archives",
  "还原 {n}": "Restore {n}",
  "永久删除 {n}": "Delete {n} permanently",
  暂无任务归档: "No task archives yet",

  "暂停或终态任务可从当前任务列表归档。": "Paused or finished tasks can be archived from the current task list.",
  选择当前页归档: "Select archives on this page",

  任务: "Tasks",

  原状态: "Original status",

  分类: "Category",

  归档时间: "Archived at",

  压缩大小: "Compressed size",

  数据量: "Data size",

  "选择任务归档 #{id}": "Select archive of task #{id}",
  "任务 #{id}": "Task #{id}",
  "压缩前 {size}": "Before compression: {size}",
  重试归档操作: "Retry archive operation",

  重试: "Retry",

  还原任务: "Restore task",

  永久删除归档: "Delete archive permanently",

  同时清理关联数据: "Also clean up related data",

  全部删除: "Delete all",

  "选中下方全部关联数据，包括资产、流量、文件、漏洞和 LLM 请求/响应记录。":
    "Selects all related data below, including assets, traffic, files, findings, and LLM request/response records.",
  关联资产: "Related assets",

  "删除仅属于该任务的资产；共享资产只解除当前任务关联。":
    "Deletes assets that belong only to this task; shared assets are merely unlinked from this task.",
  关联流量: "Related traffic",

  "按关联资产的精确主机名删除；仍被其他任务引用的共享主机流量会保留。":
    "Deletes by the exact hostname of related assets; traffic for shared hostnames still referenced by other tasks is kept.",
  任务文件: "Task files",

  "删除该任务工作目录中的上传文件、命令输出和其他产物。":
    "Deletes uploaded files, command outputs, and other artifacts in this task\u2019s working directory.",
  关联漏洞: "Related findings",

  "永久删除该任务产生的独立漏洞记录与漏洞报告。":
    "Permanently deletes standalone finding records and finding reports produced by this task.",
  "LLM 请求/响应记录": "LLM request/response records",
  "永久删除该任务录制的 LLM 请求、响应、Token 与错误详情。":
    "Permanently deletes the LLM requests, responses, tokens, and error details recorded by this task.",
  删除任务: "Delete task",

  "确认删除任务 #{id}？": "Delete task #{id}?",
  "「": "\u201c",
  "」的执行记录与探索链路将被永久删除。":
    "\u201d and its execution records and exploration links will be permanently deleted.",
  "该任务的执行记录与探索链路将被永久删除。":
    "The execution records and exploration links of this task will be permanently deleted.",
  删除: "Delete",

  修改分类: "Change category",

  "修改所选 {n} 个任务的分类": "Change category of {n} selected tasks",
  "目标分类对所选任务统一生效；选「未分类」会把它们移出当前分类。":
    "The target category applies to all selected tasks; choosing \u201cUncategorized\u201d removes them from their current category.",
  目标分类: "Target category",

  选择分类: "Select category",

  "还没有任何分类，先用「分类管理」创建一个。":
    "No categories yet \u2014 create one with \u201cCategory Management\u201d first.",
  移动: "Move",

  "删除所选 {n}": "Delete selected {n}",
  "确认删除所选 {n} 个任务？": "Delete the {n} selected tasks?",
  "这些任务的执行记录与探索链路将被永久删除，下方清理选项对所选任务统一生效。":
    "The execution records and exploration links of these tasks will be permanently deleted; the cleanup options below apply to all selected tasks.",
  "…等 {n} 个": "… and {n} more",
  "删除中 {done}/{total}": "Deleting {done}/{total}",
  "删除 {n} 个任务": "Delete {n} tasks",
  "最多关联 {n} 个任务": "Link up to {n} tasks",
  "搜索任务 ID、描述或目标": "Search task ID, description, or goal",
  没有匹配的任务: "No matching tasks",

  未知任务: "Unknown task",

  "已创建分类「{name}」": "Created category \u201c{name}\u201d",
  "创建分类失败：{message}": "Failed to create category: {message}",
  未知分类: "Unknown category",

  "搜索分类，或输入新名称后回车创建": "Search categories, or type a new name and press Enter to create",
  "创建分类「{name}」": "Create category \u201c{name}\u201d",
  输入名称以搜索或创建分类: "Type a name to search or create a category",

  未配置资产范围: "No asset scope configured",

  "{kind}：{value}": "{kind}: {value}",
  " · 另 {n} 条": " · and {n} more",
  "企业 #{id}": "Company #{id}",
  搜索企业名称或资产范围: "Search company name or asset scope",

  没有匹配的企业: "No matching companies",

  "{n} 个资产": "{n} assets",
  域名: "Domain",

  关键词: "Keyword",

  松开以移动: "Release to move",

  "{n} 个任务": "{n} tasks",
  "拖动任务 #{id}": "Drag task #{id}",
  拖动任务: "Drag task",

  分类已创建: "Category created",

  分类已更新: "Category updated",

  "更新分类失败：{message}": "Failed to update category: {message}",
  "分类已删除，关联任务已移入未分类": "Category deleted; its tasks moved to Uncategorized",
  "删除分类失败：{message}": "Failed to delete category: {message}",
  "目标分类不存在，请刷新后重试": "Target category no longer exists; refresh and try again",
  "任务 #{id} 已移至「{category}」": "Task #{id} moved to \u201c{category}\u201d",
  "移动任务失败：{message}": "Failed to move task: {message}",
  保存中: "Saving",

  创建分类: "Create category",

  保存修改: "Save changes",

  分类管理: "Category management",

  任务分类管理: "Task category management",

  "分类用于任务筛选与归档；修改不会影响任务执行，删除后任务会移入未分类。":
    "Categories are used for task filtering and archiving; editing them does not affect task execution, and tasks in a deleted category move to Uncategorized.",
  新建分类: "New category",

  分类名称: "Category name",

  "例如：外网评估": "e.g., External Network Assessment",
  "当前有 {n} 个任务使用该分类。重命名后会同步更新任务列表。":
    "{n} tasks currently use this category. Renaming updates the task list accordingly.",
  "创建后可在新建任务和任务列表筛选中使用。": "Once created, it can be used in New Task and the task list filters.",
  分类任务: "Categorized Tasks",

  未分类任务: "Uncategorized Tasks",

  "该分类包含 {n} 个任务。": "This category contains {n} tasks.",
  "当前有 {n} 个任务尚未分类。": "{n} tasks are currently uncategorized.",
  该分类暂无任务: "No tasks in this category",

  暂无未分类任务: "No uncategorized tasks",

  "此处将在任务归入后显示内容。": "Tasks will appear here once they are assigned to this category.",
  删除分类: "Delete category",

  关闭: "Close",

  "删除分类「{name}」？": "Delete category \u201c{name}\u201d?",
  未命名分类: "Untitled category",

  "分类删除后，其中 {n} 个任务会自动移入“未分类”，任务数据不会被删除。":
    "After the category is deleted, its {n} tasks automatically move to \u201cUncategorized\u201d; no task data is deleted.",
  "上传失败：{message}": "Upload failed: {message}",
  请填写描述与目标: "Description and goal are required",

  "最多关联 {n} 个来源任务": "Link up to {n} source tasks",
  任务已创建: "Task created",

  "创建失败：{message}": "Creation failed: {message}",
  新建任务: "New Task",

  "填写测试对象与目标，高级参数可按需展开。": "Describe the test target and goals; expand advanced options as needed.",
  "名称（可选）": "Name (optional)",
  "给任务起个便于识别的名字，例如：Acme 官网渗透": "Give the task a recognizable name, e.g., Acme website pentest",
  "可选，单个分类；用于任务列表筛选和归档，不影响 Agent 执行。":
    "Optional, a single category; used for task list filtering and archiving, does not affect Agent execution.",
  "测试对象与背景，例如：测试 example.com 这个站点": "Test target and background, e.g., test the site example.com",
  上传文件: "Upload files",

  "已上传 {n} 个文件，绝对路径已追加到描述末尾（可编辑）":
    "{n} files uploaded; absolute paths appended to the end of the description (editable)",
  "可多选；上传后把文件的绝对路径追加到描述，供 worker 用 Read/Bash 打开":
    "Multiple files allowed; uploaded files\u2019 absolute paths are appended to the description so workers can open them with Read/Bash",
  "要达成什么，例如：拿下后台管理权限、获取服务器权限":
    "What to achieve, e.g., gain admin access, obtain server privileges",
  关联任务: "Related tasks",

  "最多关联 {n} 个任务。实时只读继承所选任务的持久化黑板、资产范围及相关流量；新任务写入独立黑板。":
    "Link up to {n} tasks. The new task read-only inherits the selected tasks\u2019 persistent blackboard, asset scope, and related traffic in real time; it writes to its own blackboard.",
  关联企业资产范围: "Related company asset scope",

  "创建任务时会将所选企业当前已有资产加入“测试资产”，并将域名、IP、CIDR、ICP 和企业关键词提供给 Agent 作为范围上下文；不会自动生成意图或强制改变执行目标。":
    "On creation, the selected companies\u2019 existing assets are added to the test assets, and their domains, IPs, CIDRs, ICPs, and keywords are provided to the Agent as scope context; this does not auto-generate intents or forcibly change execution goals.",
  "任务级资产拦截 / 允许规则（可选）": "Task-level asset block / allow rules (optional)",
  "仅对本任务生效，不写入全局规则。判定顺序：先按「拦截」规则（含全局）匹配，命中即禁止测试；未命中且本任务配置了「允许」规则时，须命中某条允许规则才放行，否则同样不允许测试；未配置任何允许规则则不启用白名单。":
    "Applies only to this task and is not written to the global rules. Matching order: block rules (including global) are checked first \u2014 a hit forbids testing; if none hits and this task has allow rules configured, an allow rule must match to permit testing, otherwise testing is still forbidden; with no allow rules configured, no whitelist is enforced.",
  "LLM 配置链": "LLM profile chain",
  "按列表顺序故障转移；第一项为当前配置，仅在明确额度不足时切换下一项。":
    "Fails over in list order; the first entry is the active configuration and switches to the next only when the quota is clearly exhausted.",
  高级设置: "Advanced settings",

  "超时 · 心跳 · 首个意图": "Timeout · Heartbeat · First intent",
  "任务超时（分钟，可选）": "Task timeout (minutes, optional)",
  "留空 = 不限时": "Leave empty = no limit",
  "到点后触发优雅收尾（各 agent 写回 + planner 终局判定），任务进入 timeout 终态。":
    "When the timeout is reached, a graceful wrap-up is triggered (each agent writes back + planner makes the final call) and the task enters the timeout terminal state.",
  "planner 心跳（分钟）": "Planner heartbeat (minutes)",
  "默认 10": "Default 10",
  "距上轮规划结束/任务开始满该时长且期间无触发，自动触发一轮规划（兜底卡死 + 唤醒去监督在跑的 worker）。下限 10 分钟。":
    "If this duration elapses since the last planning round ended (or task start) with no trigger in between, a planning round fires automatically (a stuck-task fallback + waking up to supervise running workers). Minimum 10 minutes.",
  "直接下发首个意图（描述+目标）": "Dispatch the first intent immediately (description + goal)",
  "开启后创建即把「描述+目标」作为一条意图下发，worker 免等首轮规划直接开跑，跑完再由 planner 接手判定/补充。CTF 等常一个 work 直接解决的场景推荐开启；关闭则走标准的先规划再执行。":
    "When enabled, creation dispatches the description + goal as an intent right away; workers start immediately without waiting for the first planning round, and the planner takes over to judge/supplement afterward. Recommended for scenarios like CTFs that a single work run often solves; when disabled, the standard plan-then-execute flow applies.",
  资产覆盖度功能: "Asset coverage",

  "默认开启：计算并展示测试覆盖度、态势图显示测试进度、自动累积测试范围。关闭后不再计算/展示覆盖度，态势图仅展示资产不显示进度，agent 也不再获得范围类工具。关闭不影响「关联企业资产范围」。":
    "Enabled by default: computes and displays test coverage, shows test progress on the situation map, and automatically accumulates the test scope. When disabled, coverage is no longer computed or displayed, the situation map shows assets without progress, and agents no longer receive scope-related tools. Disabling does not affect Related Company Asset Scope.",
  创建中: "Creating",

  创建: "Create",

  创建时间: "Created At",

  运行时长: "Duration",
} satisfies Record<string, string>;

export default messages;

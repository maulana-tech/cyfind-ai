/**
 * Skills library page (system/skills) translations
 * (keys are the original zh-CN strings).
 */

const messages = {
  从未调用: "Never called",

  "暂无 Skill，点击左侧「新建」或「上传压缩包」开始":
    "No Skills yet — click “New Skill” or “Upload ZIP” on the left to start",
  "Skill 总数": "Total Skills",
  "{n} 个被调用过": "{n} have been called",
  累计调用: "Total calls",

  未使用: "Unused",

  "从未被任何 agent 加载": "Never loaded by any agent",
  全部用过: "All have been used",

  未命中调用: "Missed calls",

  "{n} 个不存在的 skill": "{n} skills that don't exist",
  无: "None",

  技能库总览: "Skill Library Overview",

  "选择左侧的 Skill 查看详情与调用记录，或从这里快速了解整体使用情况。":
    "Select a Skill on the left to see its details and call history, or get a quick overview of usage here.",
  调用排行: "Top calls",

  "还没有任何 Skill 调用记录。": "No Skill calls recorded yet.",
  "{n} 次": "{n} calls",
  最近调用: "Recent calls",

  "暂无记录。": "No records yet.",
  "未使用的 Skill": "Unused Skills",
  "（{n}）": "({n})",
  "所有 Skill 都被调用过。": "Every Skill has been called.",
  "已安装 Skill：{name}（{files} 个文件）": "Skill installed: {name} ({files} files)",
  "是否覆盖同名 Skill？": "Overwrite the existing Skill with the same name?",

  "上传失败：{message}": "Upload failed: {message}",
  读取文件失败: "Failed to read the file",

  "已创建文件夹：{path}": "Folder created: {path}",
  "已创建文件：{path}": "File created: {path}",
  "创建失败：{message}": "Creation failed: {message}",
  "已删除：{path}": "Deleted: {path}",
  "删除失败：{message}": "Delete failed: {message}",
  "已删除 Skill：{name}": "Skill deleted: {name}",
  已保存: "Saved",

  "保存失败：{message}": "Save failed: {message}",
  "关联「{name}」": "Linked “{name}”",
  "取消关联「{name}」": "Unlinked “{name}”",
  "操作失败：{message}": "Operation failed: {message}",
  "授予「{name}」可见": "Granted “{name}” visibility",
  "取消「{name}」可见": "Revoked “{name}” visibility",
  "请填写 name": "Please enter name",

  "description 为必填项": "description is required",

  "已创建 Skill": "Skill created",

  新建文件: "New file",

  新建文件夹: "New folder",

  删除文件夹: "Delete folder",

  删除文件: "Delete file",

  "删除 Skill": "Delete Skill",
  "技能库 · agentskills.io 规范 · 按 Agent 授权可见":
    "Skill library · agentskills.io spec · visibility granted per Agent",
  "{n} 个未命中调用": "{n} missed calls",
  "Agent 点名调用、但技能库里不存在的 skill。按被点名次数排序。":
    "Skills an Agent explicitly requested but that aren't in the library. Sorted by request count.",
  "新建 Skill": "New Skill",
  "上传包含 SKILL.md 的 .zip 压缩包": "Upload a .zip archive containing SKILL.md",
  "上传中…": "Uploading…",
  上传压缩包: "Upload ZIP",

  "被调用 {n} 次 · 最近 {time}": "Called {n} times · last {time}",
  "暂无 Skill，点击「新建」开始": "No Skills yet — click “New Skill” to start",
  调用统计: "Call stats",

  总调用次数: "Total calls",

  覆盖任务数: "Tasks covered",

  "调用方：": "Called by: ",
  "加载调用明细…": "Loading call details…",

  "最近 {n} 次调用": "Last {n} calls",
  "任务 #{id}": "Task #{id}",
  对话会话: "Conversation session",

  "还没有调用记录。": "No calls recorded yet.",
  "关联 MCP": "Linked MCP",
  "（加载 Skill 时才披露/解锁其工具）": "(tools are only disclosed/unlocked when the Skill loads)",
  "暂无 MCP，可在「MCP」页添加。": "No MCP yet — add one on the “MCP” page.",
  "可见性（按 Agent 授权）": "Visibility (granted per Agent)",
  "（暂无 Agent）": "(no Agents yet)",
  "保存中…": "Saving…",
  保存: "Save",

  "加载中…": "Loading…",
  "删除 Skill「{name}」？": "Delete Skill “{name}”?",
  "删除文件夹「{path}」？": "Delete folder “{path}”?",
  "删除文件「{path}」？": "Delete file “{path}”?",
  "将删除该 Skill 的全部文件、MCP 关联与可见性配置。此操作不可撤销。":
    "This deletes all files of the Skill, its MCP links, and its visibility settings. This action cannot be undone.",
  "将一并删除该文件夹下的所有文件。此操作不可撤销。":
    "All files under this folder will also be deleted. This action cannot be undone.",
  "此操作不可撤销。": "This action cannot be undone.",
  取消: "Cancel",

  "删除中…": "Deleting…",
  删除: "Delete",

  基本信息: "Basics",

  可见性: "Visibility",

  名称: "Name",

  "小写字母 / 数字 / 连字符，1–64 字符": "Lowercase letters / digits / hyphens, 1–64 characters",
  描述: "Description",

  "这个 skill 做什么、何时使用。": "What this skill does and when to use it.",
  "需要 sqlmap、python3": "requires sqlmap, python3",
  正文: "Body",

  "（留空自动生成骨架）": "(leave empty to auto-generate a skeleton)",
  "## 执行方法\n\n1. 先探测错误\n2. 区分盲注类型\n\n脚本放 scripts/ 目录。":
    "## Approach\n\n1. Probe for errors first\n2. Distinguish the blind injection type\n\nPut scripts in the scripts/ directory.",
  "加载 Skill 时才披露并解锁所选 MCP 的工具。":
    "The selected MCP tools are only disclosed and unlocked when the Skill loads.",
  "选中的 Agent 创建后即可见此 Skill。": "The selected Agents will see this Skill once it is created.",
  "创建中…": "Creating…",
  创建: "Create",
} satisfies Record<string, string>;

export default messages;

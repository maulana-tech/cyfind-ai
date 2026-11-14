/**
 * Chat page (conversation rail, chat view, composer) — keys are the original zh-CN strings.
 */

const messages = {
  实时: "Live",

  移除: "Remove",

  上传文件: "Upload files",

  发送旁路问题: "Send side question",

  停止本次运行: "Stop this run",

  发送消息: "Send message",

  "（{name}）": " ({name})",
  默认: "Default",

  更换: "Change",

  "选择 LLM 配置": "Select LLM configuration",
  "发送失败：{message}": "Failed to send: {message}",
  "上传失败：{message}": "Upload failed: {message}",
  "选择 Agent…": "Select an Agent…",
  自定义: "Custom",

  "开始和「{name}」对话": "Start a chat with \u201c{name}\u201d",
  "输入消息，@ 引用记录，Enter 发送": "Type a message, @ to reference records, Enter to send",
  "切换 LLM 失败：{message}": "Failed to switch LLM configuration: {message}",
  "停止失败：{message}": "Failed to stop: {message}",
  "agent 循环轮次（模型调用次数）": "Agent loop turns (model calls)",
  "{n} 轮": "{n} turns",
  "向上滚动加载更早的消息…": "Scroll up to load earlier messages…",
  "Agent 正在回复，可输入 /btw 提问…": "The Agent is replying — type /btw to ask a side question…",
  "选择对话「{title}」": "Select conversation \u201c{title}\u201d",
  双击重命名: "Double-click to rename",

  已置顶: "Pinned",

  新对话: "New conversation",

  "Agent 正在运行": "Agent is running",
  运行中: "Running",

  "管理对话「{title}」": "Manage conversation \u201c{title}\u201d",
  重命名: "Rename",

  取消置顶: "Unpin",

  置顶: "Pin",

  删除: "Delete",

  "删除对话「{title}」？": "Delete conversation \u201c{title}\u201d?",
  "此操作不可撤销。": "This action cannot be undone.",
  取消: "Cancel",

  "展开「{name}」": "Expand \u201c{name}\u201d",
  "收起「{name}」": "Collapse \u201c{name}\u201d",
  当前对话在此分组内: "The current conversation is in this group",

  "{n} 个对话运行中": "{n} conversations running",
  "共 {n} 个": "Total {n}",
  "{a} / {b} 个": "{a} / {b}",
  "删除失败：{message}": "Delete failed: {message}",
  对话不存在: "Conversation does not exist",

  "已删除 {n} 个对话": "Deleted {n} conversations",
  "#{id}（{error}）": "#{id} ({error})",
  "；": "; ",
  "{n} 个对话删除失败：{details}{more}": "{n} conversations failed to delete: {details}{more}",
  " 等": " and more",
  "批量删除失败：{message}": "Bulk delete failed: {message}",
  "取消置顶失败：{message}": "Unpin failed: {message}",
  "置顶失败：{message}": "Pin failed: {message}",
  "重命名失败：{message}": "Rename failed: {message}",
  新建对话: "New conversation",

  "按 Agent 筛选对话": "Filter conversations by Agent",
  "全部 Agent": "All Agents",
  "{name}（{count}）": "{name} ({count})",
  选择当前筛选的全部对话: "Select all conversations under the current filter",

  "已选 {n} 个": "{n} selected",
  完成: "Done",

  多选: "Multi-select",

  暂无对话: "No conversations yet",

  "该 Agent 暂无对话": "No conversations for this Agent yet",
  加载更多: "Load more",

  对话已被删除: "The conversation has been deleted",

  "正在加载对应对话…": "Loading the conversation…",
  "删除选中的 {n} 个对话？": "Delete the {n} selected conversations?",
  "对话消息和执行记录将一并删除，此操作不可撤销。":
    "Conversation messages and execution records will also be deleted. This action cannot be undone.",
  删除中: "Deleting",

  确认删除: "Confirm delete",
} satisfies Record<string, string>;

export default messages;

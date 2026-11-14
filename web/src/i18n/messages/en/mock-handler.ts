/**
 * Mock API handler (lib/mock/handler.ts) error messages, archive phases and
 * demo response labels (source keys are the original zh-CN strings).
 */

const messages = {
  任务不存在: "Task not found",

  排队中的任务必须先暂停: "Queued tasks must be paused first",

  运行中的任务必须先暂停: "Running tasks must be paused first",

  任务已经在归档队列中: "Task is already in the archive queue",

  "任务被未归档任务 #{id} 直接继承，暂不能归档":
    "Task is directly inherited by unarchived task #{id} and cannot be archived yet",
  归档不存在: "Archive not found",

  当前归档状态不可还原: "The current archive state cannot be restored",

  当前归档状态不可永久删除: "The current archive state cannot be permanently deleted",

  "归档仍被任务 #{id} 依赖，无法永久删除":
    "Archive is still referenced by task #{id} and cannot be permanently deleted",
  等待归档: "Waiting to archive",

  压缩任务数据: "Compressing task data",

  归档完成: "Archive complete",

  等待还原: "Waiting to restore",

  恢复任务数据: "Restoring task data",

  等待永久删除: "Waiting to delete permanently",

  删除归档包: "Deleting archive package",

  "task_ids 数量必须为 1-100": "task_ids must contain 1-100 entries",
  任务分类不存在: "Task category not found",

  分类名称不能为空: "Category name cannot be empty",

  分类名称已存在: "Category name already exists",

  新任务: "New task",

  "请填写模板名称、描述和目标": "Fill in the template name, description, and goal",
  模板名称已存在: "Template name already exists",

  任务状态已变化: "Task state has changed",

  终态任务不可控制: "Tasks in a terminal state cannot be controlled",

  任务已经暂停: "Task is already paused",

  任务未暂停: "Task is not paused",

  未关联资产: "Unassigned assets",

  资产不存在: "Asset not found",

  任务或资产不存在: "Task or asset not found",

  资产未关联当前任务: "Asset is not linked to the current task",

  "资产 #{id}": "Asset #{id}",
  请填写有效测试范围: "Enter a valid test scope",

  "第 {n} 条范围无效：{error}": "Scope entry {n} is invalid: {error}",
  无法识别: "Unrecognized",

  请选择资产并填写来源说明: "Select assets and fill in the source description",

  用户在测试资产页手工新增: "Manually added by the user on the test assets page",

  "任务创建时关联企业：{name}": "Company linked at task creation: {name}",
  关联企业不存在或无效: "Associated company does not exist or is invalid",

  企业: "Company",

  企业名称不能为空: "Company name cannot be empty",

  企业已存在: "Company already exists",

  企业不存在: "Company not found",

  "企业范围包含无效规则，未覆盖原有范围":
    "The company scope contains invalid rules; the original scope was not replaced",
  意图不存在: "Intent not found",

  "Worker 状态已变化": "Worker state has changed",
  "request_id 不能为空": "request_id cannot be empty",
  "request_id 已用于其他 Worker 消息": "request_id was already used for a different Worker message",
  "仅已暂停的 Worker 可以发送消息，请先暂停": "Only paused Workers can receive messages; pause it first",
  消息不能为空: "Message cannot be empty",

  "消息不能超过 4000 个字符": "Message cannot exceed 4000 characters",
  "LLM 配置不存在": "LLM profile not found",
  "LLM 配置未设置 API Key": "LLM profile has no API key set",
  "任务 LLM 配置链额度已耗尽": "The task LLM profile chain quota is exhausted",
  全局配置: "Global profile",

  "批量操作最多支持 100 个 ID": "Batch operations support at most 100 IDs",
  漏洞不存在: "Finding not found",

  "复测 #{id} · {name}": "Retest #{id} · {name}",
  "请复测漏洞 #{id}": "Please retest finding #{id}",
  "演示环境未执行真实验证，无法确认漏洞当前状态。":
    "No real verification was performed in the demo environment; the current state of the finding cannot be confirmed.",
  "演示复测进行中（未向目标发送请求）": "Demo retest in progress (no requests sent to the target)",
  演示复测已停止: "Demo retest stopped",

  证据不存在: "Evidence not found",

  "（demo）我已把该建议注入为一条高优意图，work agent 会尽快执行。":
    "(demo) I have injected that suggestion as a high-priority intent; the work agent will execute it shortly.",
  新对话: "New conversation",

  "（demo）工具执行输出示例。": "(demo) Sample tool execution output.",
  "审批已处理或不存在，请刷新记录": "The approval was already processed or does not exist; refresh the records",
  无效审批动作: "Invalid approval action",

  审批记录不存在: "Approval record not found",

  无效审批状态: "Invalid approval status",

  无效判定来源: "Invalid decision source",

  人工允许执行: "Manually allowed execution",

  人工拒绝执行: "Manually denied execution",

  "演示模式未执行工具。": "The tool was not executed in demo mode.",
  演示模式不支持旁路提问: "Side questions are not supported in demo mode",

  后台功能枚举意图从前序子域发现中选定:
    "Admin functionality enumeration intent selected from earlier subdomain findings",
  "订单接口测试意图从 API 任务目标中选定": "Order API testing intent selected from the API task goal",
  "q 参数注入 payload，响应回显 MSSQL 报错。":
    "Injected a payload via the q parameter; the response reflects the MSSQL error.",
  "本人订单 id=1001，作为正常对照。": "Own order id=1001, used as a normal baseline.",
  "改 id=1002 越权读到他人订单。": "Changed id=1002 to read another user's order (IDOR).",
  "Fastjson @type JNDI payload，触发回连。": "Fastjson @type JNDI payload that triggers the callback.",
  "二次请求确认命令执行落地。": "Follow-up request confirming command execution.",
  "Jenkins Script Console 未授权可达。": "Jenkins Script Console is reachable without authentication.",
  "scriptText 执行 Groovy 命令返回 SYSTEM。": "scriptText executes a Groovy command and returns SYSTEM.",
  "psexec 以 svc_deploy 登录域控 DC01。": "psexec logs into domain controller DC01 as svc_deploy.",
} satisfies Record<string, string>;

export default messages;

/**
 * Mock API handler (lib/mock/handler.ts) error messages, archive phases and
 * demo response labels (source keys are the original zh-CN strings).
 */

const messages = {
  "Task not found": "Task not found",
  "Queued tasks must be paused first": "Queued tasks must be paused first",
  "Running tasks must be paused first": "Running tasks must be paused first",
  "Task is already in the archive queue": "Task is already in the archive queue",
  "Task is directly inherited by unarchived task #{id} and cannot be archived yet":
    "Task is directly inherited by unarchived task #{id} and cannot be archived yet",
  "Archive not found": "Archive not found",
  "The current archive state cannot be restored": "The current archive state cannot be restored",
  "The current archive state cannot be permanently deleted": "The current archive state cannot be permanently deleted",
  "Archive is still referenced by task #{id} and cannot be permanently deleted":
    "Archive is still referenced by task #{id} and cannot be permanently deleted",
  "Waiting to archive": "Waiting to archive",
  "Compressing task data": "Compressing task data",
  "Archive complete": "Archive complete",
  "Waiting to restore": "Waiting to restore",
  "Restoring task data": "Restoring task data",
  "Waiting to delete permanently": "Waiting to delete permanently",
  "Deleting archive package": "Deleting archive package",
  "task_ids must contain 1-100 entries": "task_ids must contain 1-100 entries",
  "Task category not found": "Task category not found",
  "Category name cannot be empty": "Category name cannot be empty",
  "Category name already exists": "Category name already exists",
  "New task": "New task",
  "Fill in the template name, description, and goal": "Fill in the template name, description, and goal",
  "Template name already exists": "Template name already exists",
  "Task state has changed": "Task state has changed",
  "Tasks in a terminal state cannot be controlled": "Tasks in a terminal state cannot be controlled",
  "Task is already paused": "Task is already paused",
  "Task is not paused": "Task is not paused",
  "Unassigned assets": "Unassigned assets",
  "Asset not found": "Asset not found",
  "Task or asset not found": "Task or asset not found",
  "Asset is not linked to the current task": "Asset is not linked to the current task",
  "Asset #{id}": "Asset #{id}",
  "Enter a valid test scope": "Enter a valid test scope",
  "Scope entry {n} is invalid: {error}": "Scope entry {n} is invalid: {error}",
  Unrecognized: "Unrecognized",
  "Select assets and fill in the source description": "Select assets and fill in the source description",
  "Manually added by the user on the test assets page": "Manually added by the user on the test assets page",
  "Company linked at task creation: {name}": "Company linked at task creation: {name}",
  "Associated company does not exist or is invalid": "Associated company does not exist or is invalid",
  Company: "Company",
  "Company name cannot be empty": "Company name cannot be empty",
  "Company already exists": "Company already exists",
  "Company not found": "Company not found",
  "The company scope contains invalid rules; the original scope was not replaced":
    "The company scope contains invalid rules; the original scope was not replaced",
  "Intent not found": "Intent not found",
  "Worker state has changed": "Worker state has changed",
  "request_id cannot be empty": "request_id cannot be empty",
  "request_id was already used for a different Worker message":
    "request_id was already used for a different Worker message",
  "Only paused Workers can receive messages; pause it first":
    "Only paused Workers can receive messages; pause it first",
  "Message cannot be empty": "Message cannot be empty",
  "Message cannot exceed 4000 characters": "Message cannot exceed 4000 characters",
  "LLM profile not found": "LLM profile not found",
  "LLM profile has no API key set": "LLM profile has no API key set",
  "The task LLM profile chain quota is exhausted": "The task LLM profile chain quota is exhausted",
  "Global profile": "Global profile",
  "Batch operations support at most 100 IDs": "Batch operations support at most 100 IDs",
  "Finding not found": "Finding not found",
  "Retest #{id} · {name}": "Retest #{id} · {name}",
  "Please retest finding #{id}": "Please retest finding #{id}",
  "No real verification was performed in the demo environment; the current state of the finding cannot be confirmed.":
    "No real verification was performed in the demo environment; the current state of the finding cannot be confirmed.",
  "Demo retest in progress (no requests sent to the target)":
    "Demo retest in progress (no requests sent to the target)",
  "Demo retest stopped": "Demo retest stopped",
  "Evidence not found": "Evidence not found",
  "(demo) I have injected that suggestion as a high-priority intent; the work agent will execute it shortly.":
    "(demo) I have injected that suggestion as a high-priority intent; the work agent will execute it shortly.",
  "New conversation": "New conversation",
  "(demo) Sample tool execution output.": "(demo) Sample tool execution output.",
  "The approval was already processed or does not exist; refresh the records":
    "The approval was already processed or does not exist; refresh the records",
  "Invalid approval action": "Invalid approval action",
  "Approval record not found": "Approval record not found",
  "Invalid approval status": "Invalid approval status",
  "Invalid decision source": "Invalid decision source",
  "Manually allowed execution": "Manually allowed execution",
  "Manually denied execution": "Manually denied execution",
  "The tool was not executed in demo mode.": "The tool was not executed in demo mode.",
  "Side questions are not supported in demo mode": "Side questions are not supported in demo mode",
  "Admin functionality enumeration intent selected from earlier subdomain findings":
    "Admin functionality enumeration intent selected from earlier subdomain findings",
  "Order API testing intent selected from the API task goal":
    "Order API testing intent selected from the API task goal",
  "Injected a payload via the q parameter; the response reflects the MSSQL error.":
    "Injected a payload via the q parameter; the response reflects the MSSQL error.",
  "Own order id=1001, used as a normal baseline.": "Own order id=1001, used as a normal baseline.",
  "Changed id=1002 to read another user's order (IDOR).": "Changed id=1002 to read another user's order (IDOR).",
  "Fastjson @type JNDI payload that triggers the callback.": "Fastjson @type JNDI payload that triggers the callback.",
  "Follow-up request confirming command execution.": "Follow-up request confirming command execution.",
  "Jenkins Script Console is reachable without authentication.":
    "Jenkins Script Console is reachable without authentication.",
  "scriptText executes a Groovy command and returns SYSTEM.":
    "scriptText executes a Groovy command and returns SYSTEM.",
  "psexec logs into domain controller DC01 as svc_deploy.": "psexec logs into domain controller DC01 as svc_deploy.",
} satisfies Record<string, string>;

export default messages;

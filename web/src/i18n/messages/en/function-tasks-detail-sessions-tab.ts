/**
 * Task detail → Sessions tab (session list, transcript, worker controls).
 */

const messages = {
  "Unnamed profile": "Unnamed profile",
  "Main Agent": "Main Agent",
  Planner: "Planner",
  "System Audit": "System Audit",
  In: "In",
  Cache: "Cache",
  Out: "Out",
  input: "input",
  cache: "cache",
  output: "output",
  "Main Agent · Session #{n}": "Main Agent · Session #{n}",
  "Planner · Situation Assessment": "Planner · Situation Assessment",
  "System Events · LLM Failover": "System Events · LLM Failover",
  "From #{n}": "From #{n}",
  Live: "Live",
  "Delete this intent (a reason is required; choose soft or hard delete)":
    "Delete this intent (a reason is required; choose soft or hard delete)",
  "Current asset: {label}": "Current asset: {label}",
  "From task #{n}": "From task #{n}",
  "Upload failed: {message}": "Upload failed: {message}",
  "Failed to create session: {message}": "Failed to create session: {message}",
  "Enter a reason for deletion": "Enter a reason for deletion",
  "Send message to Worker #{id}": "Send message to Worker #{id}",
  "Worker #{id} paused": "Worker #{id} paused",
  "Worker #{id} resumed, waiting to be picked up again": "Worker #{id} resumed, waiting to be picked up again",
  " ({intents} intents / {facts} facts / {findings} findings included)":
    " ({intents} intents / {facts} facts / {findings} findings included)",
  "Worker #{id} and its exclusive downstream permanently deleted{extra}":
    "Worker #{id} and its exclusive downstream permanently deleted{extra}",
  "Worker #{id} deleted (reason recorded; the planner will re-plan accordingly)":
    "Worker #{id} deleted (reason recorded; the planner will re-plan accordingly)",
  "Worker action failed: {message}": "Worker action failed: {message}",
  "Load failed": "Load failed",
  "Load failed: {error}": "Load failed: {error}",
  "Failed to send: {message}": "Failed to send: {message}",
  "Please try again later": "Please try again later",
  "Messages can be at most {max} characters": "Messages can be at most {max} characters",
  "Message sent to Worker #{id}; execution resumed immediately":
    "Message sent to Worker #{id}; execution resumed immediately",
  Sessions: "Sessions",
  "Live connection OK": "Live connection OK",
  "Live connection lost — reconnecting automatically (history remains visible)":
    "Live connection lost — reconnecting automatically (history remains visible)",
  Reconnecting: "Reconnecting",
  "Task total": "Task total",
  "Input {input} · Output {output} · Cache read {cacheRead} · Cache write {cacheWrite}":
    "Input {input} · Output {output} · Cache read {cacheRead} · Cache write {cacheWrite}",
  "New Main Agent session (clears context; task state is kept)":
    "New Main Agent session (clears context; task state is kept)",
  "New Main Agent session": "New Main Agent session",
  New: "New",
  "Load earlier Workers": "Load earlier Workers",
  "No running Worker sessions.": "No running Worker sessions.",
  "Worker Session": "Worker Session",
  "Current profile: {label}": "Current profile: {label}",
  "Model unavailable": "Model unavailable",
  "No LLM profile available": "No LLM profile available",
  "From task #{id} · read-only history": "From task #{id} · read-only history",
  "Scroll up to load earlier history": "Scroll up to load earlier history",
  "↑ Earlier history": "↑ Earlier history",
  "Run duration (first → last step)": "Run duration (first → last step)",
  Interactive: "Interactive",
  "This intent was deleted by the user": "This intent was deleted by the user",
  " (execution stopped, the planner has been notified; the intent and its outputs are kept — history is viewable below)":
    " (execution stopped, the planner has been notified; the intent and its outputs are kept — history is viewable below)",
  "Deletion reason: ": "Deletion reason: ",
  "Loading earlier history…": "Loading earlier history…",
  "Loading activity stream…": "Loading activity stream…",
  Retry: "Retry",
  "No conversation yet. Message the Main Agent below to steer the exploration or step in.":
    "No conversation yet. Message the Main Agent below to steer the exploration or step in.",
  "No activity yet.": "No activity yet.",
  Remove: "Remove",
  "Message the Main Agent": "Message the Main Agent",
  "Main Agent is running — type /btw to ask a side question…":
    "Main Agent is running — type /btw to ask a side question…",
  "Message the Main Agent; @ to reference findings, assets, …":
    "Message the Main Agent; @ to reference findings, assets, …",
  "Upload files": "Upload files",
  "Send side question": "Send side question",
  "Stop current run": "Stop current run",
  "Send message": "Send message",
  "Message Worker #{id}": "Message Worker #{id}",
  "Message Worker #{id}; @ to reference records and adjust its direction…":
    "Message Worker #{id}; @ to reference records and adjust its direction…",
  "Pause current Worker": "Pause current Worker",
  "Resume without sending a message": "Resume without sending a message",
  "Resume now": "Resume now",
  Resume: "Resume",
  "Delete Worker #{id}?": "Delete Worker #{id}?",
  "Hard delete": "Hard delete",
  " permanently removes this intent, and its": " permanently removes this intent, and its",
  "downstream nodes that only it supports": "downstream nodes that only it supports",
  " (cascaded to leaves to avoid orphaned data); shared nodes, goals, and task root facts are kept.":
    " (cascaded to leaves to avoid orphaned data); shared nodes, goals, and task root facts are kept.",
  "This cannot be undone.": "This cannot be undone.",
  "The planner is notified and will re-plan accordingly.": "The planner is notified and will re-plan accordingly.",
  "Soft delete": "Soft delete",
  " marks the intent as “Deleted” and records the reason; the intent node, execution records, and registered facts and findings":
    " marks the intent as “Deleted” and records the reason; the intent node, execution records, and registered facts and findings",
  "are all kept": "are all kept",
  ". The planner receives “deleted by the user + reason” and re-plans accordingly.":
    ". The planner receives “deleted by the user + reason” and re-plans accordingly.",
  "Keeps data, fully traceable": "Keeps data, fully traceable",
  "Cascaded removal, cannot be undone": "Cascaded removal, cannot be undone",
  "Deletion reason (required)": "Deletion reason (required)",
  "Explain why this intent is being deleted, e.g. wrong direction / goal no longer valid / duplicate of another intent…":
    "Explain why this intent is being deleted, e.g. wrong direction / goal no longer valid / duplicate of another intent…",
  Back: "Back",
  "Delete permanently": "Delete permanently",
  "Confirm delete": "Confirm delete",
  "Start a new session?": "Start a new session?",
  "The current session is archived (you can switch back anytime) and the Main Agent continues with a clean context. The task's graph, assets, and goals are unaffected.":
    "The current session is archived (you can switch back anytime) and the Main Agent continues with a clean context. The task's graph, assets, and goals are unaffected.",
  Cancel: "Cancel",
  "Starting…": "Starting…",
  "Start new session": "Start new session",
} satisfies Record<string, string>;

export default messages;

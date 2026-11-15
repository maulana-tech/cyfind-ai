/**
 * Finding detail page translations (keys are the original zh-CN strings).
 */

const messages = {
  "Severity changed to “{label}”": "Severity changed to “{label}”",
  "Processing status changed to “{label}”": "Processing status changed to “{label}”",
  "Update failed: {message}": "Update failed: {message}",
  "Finding {id} not found": "Finding {id} not found",
  "Loading…": "Loading…",
  "Back to findings list": "Back to findings list",
  Uncategorized: "Uncategorized",
  "Source task #{id} · read-only": "Source task #{id} · read-only",
  Overview: "Overview",
  "Chain view": "Chain view",
  Summary: "Summary",
  "(no summary)": "(no summary)",
  "Evidence / PoC": "Evidence / PoC",
  "(no evidence)": "(no evidence)",
  "Detailed report": "Detailed report",
  "Detailed report copied": "Detailed report copied",
  "Traffic evidence has changed; the detailed report is out of date.":
    "Traffic evidence has changed; the detailed report is out of date.",
  "No detailed report yet.": "No detailed report yet.",
  Status: "Status",
  "Finding ID": "Finding ID",
  Severity: "Severity",
  "Processing status": "Processing status",
  "Vulnerability type": "Vulnerability type",
  "Assets involved": "Assets involved",
  "Owning task": "Owning task",
  "Discovered at": "Discovered at",
  "— (task deleted)": "— (task deleted)",
} satisfies Record<string, string>;

export default messages;

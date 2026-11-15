/**
 * Status/severity label translations (keys are the zh-CN labels from lib/status.ts).
 * Render sites wrap them with t() at render time — the data file stays zh.
 */

const status = {
  Unclaimed: "Unclaimed",
  Executing: "Executing",
  Paused: "Paused",
  Completed: "Completed",
  "Execution Error": "Execution Error",
  "Budget Exhausted": "Budget Exhausted",
  Stopped: "Stopped",
  Deleted: "Deleted",
  Created: "Created",
  Queued: "Queued",
  Running: "Running",
  Failed: "Failed",
  "Timed Out": "Timed Out",
  Critical: "Critical",
  High: "High",
  Medium: "Medium",
  Low: "Low",
  Pending: "Pending",
  "In Progress": "In Progress",
  Confirmed: "Confirmed",
  Handled: "Handled",
  Fixed: "Fixed",
  "False Positive": "False Positive",
  Ignored: "Ignored",
  Duplicate: "Duplicate",
  "Risk Accepted": "Risk Accepted",
  Exploring: "Exploring",
  Stalled: "Stalled",
  Idle: "Idle",
  Active: "Active",
  Met: "Met",
  Abandoned: "Abandoned",
  Allow: "Allow",
  Block: "Block",
  Observed: "Observed",
  Deprecated: "Deprecated",
  "Pending Send": "Pending Send",
  Sending: "Sending",
  Sent: "Sent",
  Skipped: "Skipped",
} satisfies Record<string, string>;

export default status;

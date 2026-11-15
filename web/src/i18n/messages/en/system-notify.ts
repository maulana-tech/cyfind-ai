/**
 * Notification-push page (system/notify) translations.
 *
 * Keys are the original zh-CN strings.
 */

const messages = {
  "Please fill in the channel name": "Please fill in the channel name",
  "Channel added": "Channel added",
  "Test message sent ({ms} ms), please confirm in the group":
    "Test message sent ({ms} ms), please confirm in the group",
  "Test failed: {message}": "Test failed: {message}",
  "Push enabled": "Push enabled",
  "Push paused": "Push paused",
  "Push to DingTalk / Feishu / WeCom and other channels when a vulnerability is found · each channel can set its push timing and filter rules independently":
    "Push to DingTalk / Feishu / WeCom and other channels when a vulnerability is found · each channel can set its push timing and filter rules independently",
  "Master switch": "Master switch",
  "Push master switch": "Push master switch",
  Channels: "Channels",
  "Enabled / total": "Enabled / total",
  "Delivered today": "Delivered today",
  "Longest backlog": "Longest backlog",
  "Push may be stuck": "Push may be stuck",
  "Global settings": "Global settings",
  "Back-link address": "Back-link address",
  'The address the "View detail" button in the message points to. Leave empty to omit the button.':
    'The address the "View detail" button in the message points to. Leave empty to omit the button.',
  "Digest cycle (minutes)": "Digest cycle (minutes)",
  'Only effective for channels in "digest" mode.': 'Only effective for channels in "digest" mode.',
  "Save global settings": "Save global settings",
  "Delivery records": "Delivery records",
  "Add channel": "Add channel",
  Digest: "Digest",
  "Add notification channel": "Add notification channel",
  "Default rate limit {n}/minute": "Default rate limit {n}/minute",
  "No rate limit": "No rate limit",
  "Channel type": "Channel type",
  "The channel type cannot be changed — changing the type means a different set of credentials, so create a new channel instead.":
    "The channel type cannot be changed — changing the type means a different set of credentials, so create a new channel instead.",
  "Channel name": "Channel name",
  "Incident-response group / daily-broadcast group": "Incident-response group / daily-broadcast group",
  "This channel's form is not yet defined (the frontend is missing a CHANNEL_FIELDS entry); please complete it and try again.":
    "This channel's form is not yet defined (the frontend is missing a CHANNEL_FIELDS entry); please complete it and try again.",
  "Push timing": "Push timing",
  "Realtime · send one message per vulnerability": "Realtime · send one message per vulnerability",
  "Digest · merge into one message per cycle": "Digest · merge into one message per cycle",
  'To do "high-risk realtime, the rest digest", create two channels: one realtime + high-risk threshold, and one digest + no level limit.':
    'To do "high-risk realtime, the rest digest", create two channels: one realtime + high-risk threshold, and one digest + no level limit.',
  "Rate limit (per minute)": "Rate limit (per minute)",
  "0 = unlimited": "0 = unlimited",
  "Leave empty to use the channel default; 0 means no rate limit. Exceeding the limit does not drop messages, it only delays sending.":
    "Leave empty to use the channel default; 0 means no rate limit. Exceeding the limit does not drop messages, it only delays sending.",
  "Filter rules (empty means no filtering)": "Filter rules (empty means no filtering)",
  "Minimum level": "Minimum level",
  "Only push these vulnerability types": "Only push these vulnerability types",
  "SQL injection\nCommand execution": "SQL injection\nCommand execution",
  "One keyword per line, case-insensitive substring match. Empty = all types.":
    "One keyword per line, case-insensitive substring match. Empty = all types.",
  "Exclude these vulnerability types": "Exclude these vulnerability types",
  "Information disclosure": "Information disclosure",
  "Exclude takes priority over include: when both match, it is excluded.":
    "Exclude takes priority over include: when both match, it is excluded.",
  "Restrict to task IDs": "Restrict to task IDs",
  "Restrict to asset IDs": "Restrict to asset IDs",
  "Leaving task/asset empty = unrestricted; once filled, the vulnerability is required to intersect with it.":
    "Leaving task/asset empty = unrestricted; once filled, the vulnerability is required to intersect with it.",
  "Receive status changes": "Receive status changes",
  "Also push when a vulnerability's disposition status changes (realtime mode only)":
    "Also push when a vulnerability's disposition status changes (realtime mode only)",
  "Enable this channel": "Enable this channel",
  "Send a test message": "Send a test message",
  min: "min",
  h: "h",
  "Failed to load push config: {message}": "Failed to load push config: {message}",
  "Failed to load channel list: {message}": "Failed to load channel list: {message}",
} satisfies Record<string, string>;

export default messages;

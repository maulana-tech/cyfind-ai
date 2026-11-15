/**
 * Notification-push page (system/notify) translations.
 *
 * Keys are the original zh-CN strings.
 */

const messages = {
  // page
  请填写渠道名称: "Please fill in the channel name",
  已添加渠道: "Channel added",
  "已发出测试消息（{ms} ms），请到群里确认": "Test message sent ({ms} ms), please confirm in the group",
  "测试失败：{message}": "Test failed: {message}",
  推送已开启: "Push enabled",
  推送已暂停: "Push paused",
  "发现漏洞时推送到钉钉 / 飞书 / 企业微信等渠道 · 每个渠道可独立设推送时机与过滤规则":
    "Push to DingTalk / Feishu / WeCom and other channels when a vulnerability is found · each channel can set its push timing and filter rules independently",
  总开关: "Master switch",
  推送总开关: "Push master switch",
  渠道: "Channels",
  "启用 / 总数": "Enabled / total",
  今日送达: "Delivered today",
  最久积压: "Longest backlog",
  推送可能卡住了: "Push may be stuck",
  全局设置: "Global settings",
  回链地址: "Back-link address",
  "消息里「查看详情」按钮指向的地址。留空则不带按钮。":
    'The address the "View detail" button in the message points to. Leave empty to omit the button.',
  "汇总周期（分钟）": "Digest cycle (minutes)",
  "仅对「汇总」模式的渠道生效。": 'Only effective for channels in "digest" mode.',
  保存全局设置: "Save global settings",
  投递记录: "Delivery records",
  添加渠道: "Add channel",
  汇总: "Digest",
  添加通知渠道: "Add notification channel",
  "默认限流 {n} 条/分钟": "Default rate limit {n}/minute",
  不限流: "No rate limit",
  渠道类型: "Channel type",
  "渠道类型不可修改——改了类型等于换一套凭据，请新建渠道。":
    "The channel type cannot be changed — changing the type means a different set of credentials, so create a new channel instead.",
  渠道名称: "Channel name",
  "应急响应群 / 日常播报群": "Incident-response group / daily-broadcast group",
  "该渠道的表单尚未定义（前端缺 CHANNEL_FIELDS 条目），请补全后再试。":
    "This channel's form is not yet defined (the frontend is missing a CHANNEL_FIELDS entry); please complete it and try again.",
  推送时机: "Push timing",
  "实时 · 每条漏洞单独发一条": "Realtime · send one message per vulnerability",
  "汇总 · 按周期合并成一条": "Digest · merge into one message per cycle",
  "想做「高危实时、其余汇总」就建两个渠道：一个实时 + 门槛高危，一个汇总 + 不限级别。":
    'To do "high-risk realtime, the rest digest", create two channels: one realtime + high-risk threshold, and one digest + no level limit.',
  "限流（条/分钟）": "Rate limit (per minute)",
  "0 = 不限": "0 = unlimited",
  "留空用渠道默认值；0 表示不限流。超限不会丢消息，只会推迟发送。":
    "Leave empty to use the channel default; 0 means no rate limit. Exceeding the limit does not drop messages, it only delays sending.",
  "过滤规则（留空即不过滤）": "Filter rules (empty means no filtering)",
  最低级别: "Minimum level",
  只推这些漏洞类型: "Only push these vulnerability types",
  "SQL注入\n命令执行": "SQL injection\nCommand execution",
  "每行一个关键词，大小写不敏感的子串匹配。留空=全部类型。":
    "One keyword per line, case-insensitive substring match. Empty = all types.",
  排除这些漏洞类型: "Exclude these vulnerability types",
  信息泄露: "Information disclosure",
  "排除优先于包含：同时命中时会被排除。": "Exclude takes priority over include: when both match, it is excluded.",
  "限定任务 ID": "Restrict to task IDs",
  "限定资产 ID": "Restrict to asset IDs",
  "任务/资产留空=不限；填写后要求与漏洞有交集。":
    "Leaving task/asset empty = unrestricted; once filled, the vulnerability is required to intersect with it.",
  接收状态变更: "Receive status changes",
  "漏洞处置状态变更时也推送（仅实时模式）":
    "Also push when a vulnerability's disposition status changes (realtime mode only)",
  启用该渠道: "Enable this channel",
  发送测试消息: "Send a test message",

  // stat-tile (system/notify/_components/stat-tile)
  分钟: "min",
  小时: "h",
  "读取推送配置失败：{message}": "Failed to load push config: {message}",
  "读取渠道列表失败：{message}": "Failed to load channel list: {message}",
} satisfies Record<string, string>;

export default messages;

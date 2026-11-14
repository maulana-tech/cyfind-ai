// Package notify implements the IM / email push channel adapter layer for vulnerability findings.
//
// Layering: this package is a **leaf package** that depends only on the standard library. It
// knows nothing of the database or the server. The channel config is passed in as
// map[string]any (corresponding to the notification_channels.config JSONB column), and the
// content to push is passed in as a Message. The benefit of this split is that the genuinely
// error-prone parts — signature computation, UTF-8 truncation, filter matching — can be unit
// tested without PostgreSQL, and the host only needs to do the orchestration on the server side.
//
// Concurrency convention: a Channel implementation must be **stateless**. The same Channel
// instance is reused concurrently by multiple channel configs (even multiple bot instances of
// the same channel), so all credentials are passed in via the cfg argument, and caching
// something like a webhook URL into the implementation's own fields is not allowed.
package notify

// Channel type identifiers. The values are also the valid set for notification_channels.kind,
// validated by an allowlist on the server side (same as findings.status — no DB CHECK, to make
// adding channels later easy).
const (
	KindDingTalk = "dingtalk" // DingTalk custom bot
	KindFeishu   = "feishu"   // Feishu (incl. Lark) custom bot
	KindWeCom    = "wecom"    // WeCom group bot
	KindWebhook  = "webhook"  // generic Webhook: custom method/headers/JSON template
	KindTelegram = "telegram" // Telegram Bot API
	KindEmail    = "email"    // SMTP email
)

// Event types, corresponding to notification_events.kind.
const (
	EventFindingCreated       = "finding_created"
	EventFindingStatusChanged = "finding_status_changed"
)

// InitKind is the fallback value for an empty kind in the config.
const InitKind = KindDingTalk

// severityRank maps a vulnerability level to a comparable ordinal. An unknown level returns 0,
// so any min_severity setting keeps an unknown level out — when in doubt, do not push, to avoid
// false-positive screen-flooding.
var severityRank = map[string]int{
	"low":      1,
	"medium":   2,
	"high":     3,
	"critical": 4,
}

// SeverityRank returns the level's ordinal; an unknown level returns 0.
func SeverityRank(severity string) int { return severityRank[severity] }

// SeverityLabel returns the level name with an emoji, used for the message title and card colors.
// An unknown level is echoed as-is, not fabricated.
func SeverityLabel(severity string) string {
	switch severity {
	case "critical":
		return "🔴 Critical"
	case "high":
		return "🟠 High"
	case "medium":
		return "🟡 Medium"
	case "low":
		return "🔵 Low"
	default:
		return severity
	}
}

// StatusLabel translates a disposition status into a readable label, used in status-change messages.
func StatusLabel(status string) string {
	switch status {
	case "pending":
		return "Pending"
	case "in_progress":
		return "In progress"
	case "confirmed":
		return "Confirmed"
	case "resolved":
		return "Resolved"
	case "fixed":
		return "Fixed"
	case "false_positive":
		return "False positive"
	case "ignored":
		return "Ignored"
	case "duplicate":
		return "Duplicate"
	case "risk_accepted":
		return "Risk accepted"
	default:
		return status
	}
}

// AtLeast reports whether severity meets the min threshold. An empty min means no threshold, so
// everything passes. Note that an unknown severity has ordinal 0 and is rejected by any non-empty
// min (see the severityRank comment).
func AtLeast(severity, min string) bool {
	if min == "" {
		return true
	}
	return SeverityRank(severity) >= SeverityRank(min)
}

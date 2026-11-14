package notify

import (
	"fmt"
	"strings"
)

// This file is the message rendering shared by the "Markdown-family" channels (DingTalk, WeCom).
// Feishu uses card JSON, Telegram uses HTML, and email uses HTML, each rendered in its own adapter.

// maxAssetsShown is the most assets listed in a message. A vulnerability may anchor dozens of
// assets, and listing them all would overflow the message with no information value — no one reads
// the domains past the 4th in an IM.
const maxAssetsShown = 3

// maxSummaryRunes is how many characters the summary is compressed to. An IM message is a "prompt to
// go look at the detail", not the report itself, and the full content is in the platform.
const maxSummaryRunes = 120

// markdownReservedBytes is reserved for the message header (the digest line + level distribution +
// a possible truncation hint) and footer (the platform link). When packing by whole item, this part
// is deducted from the budget to guarantee the header/footer are not truncated — once the
// header/footer is truncated, the reader cannot even tell "which batch this is, and how many items
// are not shown".
const markdownReservedBytes = 320

// markdownEscape escapes markdown metacharacters.
//
// Why it must be done: the vulnerability title, summary, type, and asset display names all come from
// **untrusted sources** — the title and summary come from model output (the model read the tested
// target's response), and an asset's url is the full URL from the scan (including a target-controlled
// query string). Without escaping, a vulnerability with a title of
//
//	Login SQL injection\n[Urgent: click here to verify your account](http://attacker.tld)
//
// would render as a **clickable external link** in the security engineer's DingTalk/Feishu; and
// `![](http://attacker.tld/beacon)` would be fetched by the client at render time, which is
// equivalent to reporting "this vulnerability has been viewed" and leaking the reader's IP. Even
// benign content, an injected bold or quote block, can push the serious vulnerability below the
// fold.
//
// The escape set covers the character classes for title/link/emphasis/list/quote/strikethrough that
// change the structure or produce a clickable element. `\` must be handled first, otherwise it would
// re-escape the backslashes added afterward.
func markdownEscape(s string) string {
	replacer := strings.NewReplacer(
		`\`, `\\`,
		"`", "\\`",
		"*", `\*`,
		"_", `\_`,
		"[", `\[`,
		"]", `\]`,
		"(", `\(`,
		")", `\)`,
		"!", `\!`,
		"#", `\#`,
		">", `\>`,
		"|", `\|`,
		"~", `\~`,
	)
	return replacer.Replace(s)
}

// markdownText compresses untrusted text into one line and escapes it, for use in the markdown body.
// Single-lining is the other half beyond escaping: a newline itself can forge a new list item or
// quote block, which escaping characters cannot stop.
func markdownText(s string, maxRunes int) string {
	return markdownEscape(OneLine(s, maxRunes))
}

// markdownTitle returns the message title (the title bar/card title of an IM platform), with the
// content being the **unescaped original**.
//
// It deliberately does not escape here: this title is shared by renderers in four contexts — the
// markdown body, Telegram's HTML, Feishu card's plain_text, and the generic Webhook's JSON and the
// email subject. Each context's escape rules differ (markdown escaping stuffed into HTML leaves a
// visible backslash, and stuffed into JSON pollutes the data), so escaping must be the responsibility
// of each output end, see writeItem / feishuItemLines / telegramEscape. markdown escaping was once
// added in the shared function, and the result was a visible backslash like `\(1\)` appearing in a
// Telegram message.
func markdownTitle(m Message) string {
	if m.Batch {
		return fmt.Sprintf("Vulnerability digest · %d total", len(m.Items))
	}
	if len(m.Items) == 0 {
		return "Vulnerability notification"
	}
	it := m.Items[0]
	return fmt.Sprintf("[%s] %s", SeverityLabel(it.Severity), OneLine(it.Title(), 0))
}

// markdownBody renders the message body, returning the body and the **number of items actually
// written**.
//
// The return value kept is the number of items this delivery actually delivered, by which the caller
// marks only the first kept as delivered — the items kept out by the channel's length cap must be
// left for the next batch, not marked successful along with the rest. This is exactly the source of
// "silent loss": the message was truncated, but the delivery record shows all delivered, with no
// place to see that the latter half was never sent.
//
// maxBytes<=0 means no limit.
func markdownBody(m Message, maxBytes int) (string, int) {
	if !m.Batch {
		if len(m.Items) == 0 {
			return "", 0
		}
		var b strings.Builder
		writeItem(&b, m.Items[0], "", true)
		// A single message is sent even if over-long (the final truncation is the fallback): partial
		// info of one vulnerability is better than sending none.
		return TruncateBytes(b.String(), maxBytes), 1
	}

	footer := ""
	if m.HomeURL != "" {
		footer = fmt.Sprintf("\n[View all in the platform](%s)\n", m.HomeURL)
	}
	kept := packItemCount(m.Items, maxBytes, markdownReservedBytes, footer, byteSize, func(it Item, idx int) string {
		var b strings.Builder
		writeItem(&b, it, fmt.Sprintf("%d. ", idx+1), false)
		return b.String()
	})

	items := m.Items[:kept]
	var b strings.Builder
	b.WriteString(markdownBatchIntro(m, items, len(m.Items)))
	for i, it := range items {
		writeItem(&b, it, fmt.Sprintf("%d. ", i+1), false)
	}
	b.WriteString(footer)
	return TruncateBytes(b.String(), maxBytes), kept
}

// markdownBatchIntro renders the start of a digest message: the time window, item count, and level
// distribution. With these, the recipient of a digest can judge whether this batch needs immediate
// attention without clicking into the platform.
//
// items is the items **actually packed in**, and total is the batch's intended total. When the two
// differ, it must explicitly state "how many more are in the next message" — otherwise the reader
// assumes the number written in the message header is the total, and those never-sent items do not
// exist at all in the UI.
func markdownBatchIntro(m Message, items []Item, total int) string {
	var b strings.Builder
	if m.WindowMinutes > 0 {
		fmt.Fprintf(&b, "**%[2]d new vulnerabilities in the last %[1]d minutes**", m.WindowMinutes, total)
	} else {
		fmt.Fprintf(&b, "**%d new vulnerabilities**", total)
	}
	if extra := total - len(items); extra > 0 {
		fmt.Fprintf(&b, " (this message shows the first %d; the remaining %d continue in the next message)", len(items), extra)
	}
	// Give the distribution by level so the reader sees at a glance whether there is a critical item.
	// It counts only the items **actually included in this message**, keeping "Critical 3" consistent
	// with the items you can count below.
	counts := map[string]int{}
	for _, it := range items {
		counts[it.Severity]++
	}
	var parts []string
	for _, sev := range []string{"critical", "high", "medium", "low"} {
		if n := counts[sev]; n > 0 {
			parts = append(parts, fmt.Sprintf("%s %d", SeverityLabel(sev), n))
		}
	}
	if len(parts) > 0 {
		b.WriteString("\n" + strings.Join(parts, " · "))
	}
	b.WriteString("\n\n")
	return b.String()
}

// writeItem renders a single vulnerability item.
//
// prefix is the number for a digest list; when single=true it renders the full version (with summary
// and back-link), while a digest list renders only a one-line summary — otherwise a 50-item digest
// becomes a long document.
//
// All externally sourced content (title/type/assets/summary) goes through markdownText: single-lining
// + escaping. The back-link is assembled from the admin-configured public_base_url, is not untrusted
// content, and must be a clickable link, so it is output as-is.
func writeItem(b *strings.Builder, it Item, prefix string, single bool) {
	line := fmt.Sprintf("%s**%s · %s**", prefix, SeverityLabel(it.Severity), markdownText(it.Title(), 0))
	if !single {
		// Digest mode: present on one line, with the assets and summary compressed and appended.
		var extras []string
		if a := assetLine(it.Assets, maxAssetsShown); a != "" {
			extras = append(extras, markdownText(a, 0))
		}
		if it.Summary != "" {
			extras = append(extras, markdownText(it.Summary, 60))
		}
		if len(extras) > 0 {
			line += " — " + strings.Join(extras, " · ")
		}
		b.WriteString(line + "\n")
		return
	}
	b.WriteString(line + "\n")
	if it.IsStatusChange() {
		fmt.Fprintf(b, "**Status change**: %s → %s\n",
			markdownText(StatusLabel(it.FromStatus), 0), markdownText(StatusLabel(it.ToStatus), 0))
	}
	if it.VulnClass != "" && it.VulnClass != it.Title() {
		fmt.Fprintf(b, "**Type**: %s\n", markdownText(it.VulnClass, 0))
	}
	if a := assetLine(it.Assets, maxAssetsShown); a != "" {
		fmt.Fprintf(b, "**Assets**: %s\n", markdownText(a, 0))
	}
	if it.Summary != "" {
		if s := markdownText(it.Summary, maxSummaryRunes); s != "" {
			fmt.Fprintf(b, "**Summary**: %s\n", s)
		}
	}
	if it.DetailURL != "" {
		fmt.Fprintf(b, "[View detail](%s)\n", it.DetailURL)
	}
}

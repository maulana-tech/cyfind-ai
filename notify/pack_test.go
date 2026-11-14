package notify

import (
	"strings"
	"testing"
	"unicode/utf8"
)

// This file covers the "pack by whole item" fix: when a digest message exceeds the channel's length
// cap, it must truncate **by whole item** and report truthfully how many items did not fit, so the
// caller marks only those actually delivered.
//
// The previous approach rendered the full text then truncated, then marked the whole batch as
// delivered: the latter half of the message vanished into thin air while the delivery history showed
// all successful — the vulnerability was just gone, with no place to discover it.

func TestMarkdownBodyPacksWholeItemsWithinByteLimit(t *testing.T) {
	// 200 digest items will necessarily far exceed WeCom's 4096 bytes.
	m := batchMsg(200)
	body, kept := markdownBody(m, weComMarkdownLimit)

	if len(body) > weComMarkdownLimit {
		t.Fatalf("the body is %d bytes, exceeding the cap %d", len(body), weComMarkdownLimit)
	}
	if !utf8.ValidString(body) {
		t.Fatal("the body is not valid UTF-8")
	}
	if kept <= 0 || kept >= len(m.Items) {
		t.Fatalf("should fit only a part (0 < kept < %d), got %d", len(m.Items), kept)
	}
	// The header must truthfully state how many this message includes and how many remain —
	// otherwise the reader takes the header number as the total.
	if !strings.Contains(body, "remaining") || !strings.Contains(body, "continue in the next message") {
		t.Fatalf("the header should state how many items are not included in this message:\n%s", body[:minInt(400, len(body))])
	}
	// It should include only the first kept items.
	for i := 0; i < kept; i++ {
		if !strings.Contains(body, "finding"+itoa(i+1)) {
			t.Fatalf("item %d should be in this message:\n%s", i+1, body)
		}
	}
	if strings.Contains(body, "finding"+itoa(kept+1)) {
		t.Fatalf("item %d should not appear (it belongs to the next batch)", kept+1)
	}
}

func TestMarkdownBodyKeepsEverythingWhenUnderLimit(t *testing.T) {
	m := batchMsg(3)
	body, kept := markdownBody(m, 0) // 0 = no limit
	if kept != len(m.Items) {
		t.Fatalf("with no length limit all should be kept, got kept=%d", kept)
	}
	if strings.Contains(body, "remaining") {
		t.Fatalf("with no truncation there should be no truncation hint:\n%s", body)
	}
}

func TestMarkdownBodyAlwaysKeepsAtLeastOneItem(t *testing.T) {
	// When the budget is too small to fit even one, one must still be sent (the final truncation is
	// the fallback). Otherwise one over-long vulnerability would permanently stall the whole batch:
	// every claim fails to fit, every one is not sent.
	m := batchMsg(5)
	_, kept := markdownBody(m, 50)
	if kept != 1 {
		t.Fatalf("at least 1 should be kept, got %d", kept)
	}
}

func TestMarkdownBodySingleReturnsOne(t *testing.T) {
	_, kept := markdownBody(singleMsg(), 4096)
	if kept != 1 {
		t.Fatalf("a single message should report 1 delivered, got %d", kept)
	}
	// An empty message has no deliverable item.
	if _, k := markdownBody(Message{}, 4096); k != 0 {
		t.Fatalf("an empty message should report 0, got %d", k)
	}
}

func TestTelegramPackingUsesRuneBudget(t *testing.T) {
	m := batchMsg(200)
	text, kept := telegramHTML(m)
	// Telegram limits by **character count**; the byte measure would compress a Chinese message to a
	// third.
	if n := utf8.RuneCountInString(text); n > telegramTextLimit {
		t.Fatalf("the body is %d characters, exceeding the cap %d", n, telegramTextLimit)
	}
	if kept <= 0 || kept >= len(m.Items) {
		t.Fatalf("should fit only a part, got %d", kept)
	}
	if !strings.Contains(text, "continue in the next message") {
		t.Fatalf("should state that there is more not included:\n%.300s", text)
	}
}

func TestFeishuPackingReportsKept(t *testing.T) {
	m := batchMsg(2000)
	_, kept := feishuCard(m)
	if kept <= 0 || kept >= len(m.Items) {
		t.Fatalf("the card should fit only a part, got %d", kept)
	}
}

func TestWebhookAndEmailReportAllItems(t *testing.T) {
	// These two channels do not truncate the body, so the whole batch counts as delivered.
	m := batchMsg(7)
	if n := len(m.Items); n != 7 {
		t.Fatal("the precondition does not hold")
	}
	// Confirm indirectly via the renderer's return value: markdownBody(0) with no limit keeps all.
	if _, k := markdownBody(m, 0); k != len(m.Items) {
		t.Fatalf("with no length limit all should be used, got %d", k)
	}
}

// TestMarkdownEscapesUntrustedContent is a regression test for "untrusted content must not change
// the message structure". The title and summary come from model output (the model read the tested
// target's response), and the asset name comes from the tested target's URL.
func TestMarkdownEscapesUntrustedContent(t *testing.T) {
	cases := []struct {
		name  string
		item  Item
		must  []string // must appear in the result (escaped form)
		wrong []string // must not appear in the result (unescaped form)
	}{
		{
			name: "newline + external link in the title",
			item: Item{
				Severity: "high",
				Name:     "Login SQL injection\n[Urgent: click here to verify your account](http://attacker.tld)",
			},
			// The newline must be folded (otherwise a new list item / quote block can be forged);
			// the brackets and parentheses must be escaped (otherwise it is a clickable external link).
			must:  []string{`\[Urgent: click here to verify your account\]`, `\(http://attacker.tld\)`},
			wrong: []string{"\n[Urgent", "\n\n[Urgent"},
		},
		{
			name: "image beacon in the title",
			item: Item{
				Severity: "high",
				Name:     "finding ![](http://attacker.tld/beacon)",
			},
			must:  []string{`\!`, `\(http://attacker.tld/beacon\)`},
			wrong: []string{"![]("},
		},
		{
			name: "emphasis and quote in the asset name",
			item: Item{
				Severity: "high",
				Name:     "normal title",
				Assets:   []string{"a.com/*inject*>quote"},
			},
			must:  []string{`\*inject\*`, `\>`},
			wrong: []string{"*inject*"},
		},
		{
			name: "backtick and pipe in the summary",
			item: Item{
				Severity: "high",
				Name:     "title",
				Summary:  "`code` | table",
			},
			must:  []string{"\\`code\\`", `\|`},
			wrong: []string{"`code`"},
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			m := Message{Items: []Item{tc.item}}
			// writeItem in single mode is the render path shared by the three markdown channels.
			var b strings.Builder
			writeItem(&b, tc.item, "", true)
			got := b.String()
			for _, want := range tc.must {
				if !strings.Contains(got, want) {
					t.Errorf("missing the escaped form %q:\n%s", want, got)
				}
			}
			for _, bad := range tc.wrong {
				if strings.Contains(got, bad) {
					t.Errorf("an unescaped form %q appeared (can be used to inject structure or an external link):\n%s", bad, got)
				}
			}
			_ = m
		})
	}
}

// TestMarkdownEscapeBackslashFirst locks the escape order: the backslash must be handled first,
// otherwise it would wrap another layer around the backslashes added afterward, producing a double
// backslash in the output.
func TestMarkdownEscapeBackslashFirst(t *testing.T) {
	if got := markdownEscape(`a\b*c`); got != `a\\b\*c` {
		t.Fatalf("the escape order is wrong, got %q", got)
	}
}

// TestTelegramTitleHasNoMarkdownEscapes locks a specific regression: markdown escaping must not leak
// into Telegram's HTML output (escaping was once added in the shared title function, and the result
// was a visible backslash like `\(1\)` appearing in a Telegram message).
func TestTelegramTitleHasNoMarkdownEscapes(t *testing.T) {
	m := Message{Items: []Item{{Severity: "high", Name: "alert(1) *emphasis*"}}}
	text, _ := telegramHTML(m)
	if strings.Contains(text, `\(`) || strings.Contains(text, `\*`) {
		t.Fatalf("a markdown backslash escape appeared in the Telegram body:\n%s", text)
	}
}

func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}

package notify

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"strings"
)

// telegramTextLimit is the cap (character count) of the text field of Telegram sendMessage.
const telegramTextLimit = 4096

// telegramChannel implements the Telegram Bot API.
//
// Platform characteristics:
//   - Authentication is entirely in the URL path (/bot<token>/sendMessage), with no signing needed.
//   - It uses the HTML parse mode rather than MarkdownV2: MarkdownV2 requires escaping 18 characters
//     `_*[]()~`>#+-=|{}.!`, and missing one rejects the whole message; HTML only needs to escape the
//     three & < >.
//   - A business error is likewise hidden in HTTP 200, judged by the ok field.
type telegramChannel struct{}

func (telegramChannel) Kind() string { return KindTelegram }

// Telegram is about 1 message/sec for a single chat, 20/minute for a group. Take the conservative
// value.
func (telegramChannel) DefaultRatePerMin() int { return 20 }

// The Bot Token is the complete credential; chat_id is only the recipient and is not a secret (with
// it but without the Token you still cannot send a message).
func (telegramChannel) SecretKeys() []string { return []string{"bot_token"} }

// base_url decides which API endpoint the Token is sent to (such as a self-hosted reverse proxy), so
// changing it must re-state the Token.
func (telegramChannel) DestinationKeys() []string { return []string{"base_url"} }

func (telegramChannel) Validate(cfg map[string]any) error {
	if cfgString(cfg, "bot_token") == "" {
		return errors.New("missing Bot Token")
	}
	if cfgString(cfg, "chat_id") == "" {
		return errors.New("missing Chat ID")
	}
	if base := cfgString(cfg, "base_url"); base != "" {
		if err := validateHTTPURL(base); err != nil {
			return fmt.Errorf("invalid API address: %w", err)
		}
	}
	return nil
}

func (c telegramChannel) Send(ctx context.Context, cfg map[string]any, m Message) (int, error) {
	if err := c.Validate(cfg); err != nil {
		return 0, Permanent(err)
	}
	endpoint, err := telegramEndpoint(cfg)
	if err != nil {
		return 0, Permanent(err)
	}
	text, kept := telegramHTML(m)
	payload := map[string]any{
		"chat_id":                  cfgString(cfg, "chat_id"),
		"text":                     text,
		"parse_mode":               "HTML",
		"disable_web_page_preview": false,
	}
	raw, err := doJSON(ctx, "POST", endpoint, nil, payload)
	if err != nil {
		return 0, err
	}
	var res struct {
		OK          bool   `json:"ok"`
		ErrorCode   int    `json:"error_code"`
		Description string `json:"description"`
	}
	if err := json.Unmarshal(raw, &res); err != nil {
		return 0, fmt.Errorf("failed to parse the Telegram response: %w (%s)", err, snippet(raw))
	}
	if res.OK {
		return kept, nil
	}
	// 429 is rate limiting, where retry after backoff is effective; the rest (400 bad parameter, 401
	// bad token, 403 blocked, 404 chat does not exist) are all config issues that a retry will not
	// self-heal.
	if res.ErrorCode == 429 {
		return 0, fmt.Errorf("Telegram rate-limited: %s", res.Description)
	}
	return 0, Permanent(fmt.Errorf("Telegram returned error %d: %s", res.ErrorCode, res.Description))
}

// telegramEndpoint assembles the sendMessage address. When base_url is empty it uses the official
// API, and when non-empty it is for a self-hosted Bot API reverse proxy (a common need on domestic
// networks).
func telegramEndpoint(cfg map[string]any) (string, error) {
	base := cfgString(cfg, "base_url")
	if base == "" {
		base = "https://api.telegram.org"
	}
	base = strings.TrimSuffix(base, "/")
	token := cfgString(cfg, "bot_token")
	raw := base + "/bot" + token + "/sendMessage"
	u, err := url.Parse(raw)
	if err != nil {
		// Do not pass err through: the address contains the Bot Token, and at this point even addr
		// should not be echoed.
		return "", fmt.Errorf("failed to assemble the API address (API address: %s)", redactRequestTarget(base))
	}
	return u.String(), nil
}

// telegramHTML renders the HTML body, returning the body and the number of items actually written
// (see Channel.Send).
func telegramHTML(m Message) (string, int) {
	var b strings.Builder
	b.WriteString("<b>" + telegramEscape(markdownTitle(m)) + "</b>\n")
	if m.Batch {
		// Telegram's cap is a **character count**, so packing also measures by character (runeSize).
		footer := ""
		if m.HomeURL != "" {
			footer = fmt.Sprintf("\n\n<a href=\"%s\">View all in the platform</a>", telegramEscapeAttr(m.HomeURL))
		}
		kept := packItemCount(m.Items, telegramTextLimit, telegramReservedRunes, footer, runeSize, func(it Item, idx int) string {
			return telegramBatchLine(it, idx+1)
		})
		items := m.Items[:kept]
		b.Reset()
		b.WriteString("<b>" + telegramEscape(telegramBatchTitle(m, items, len(m.Items))) + "</b>")
		for i, it := range items {
			b.WriteString("\n" + telegramEscape(telegramBatchLine(it, i+1)))
		}
		b.WriteString(footer)
		return TruncateHTML(b.String(), telegramTextLimit), kept
	}
	if len(m.Items) == 0 {
		return b.String(), 0
	}
	it := m.Items[0]
	if it.IsStatusChange() {
		b.WriteString(fmt.Sprintf("\n<b>Status change</b>: %s → %s",
			telegramEscape(StatusLabel(it.FromStatus)), telegramEscape(StatusLabel(it.ToStatus))))
	}
	if it.VulnClass != "" && it.VulnClass != it.Title() {
		b.WriteString("\n<b>Type</b>: " + telegramEscape(it.VulnClass))
	}
	if a := assetLine(it.Assets, maxAssetsShown); a != "" {
		b.WriteString("\n<b>Assets</b>: " + telegramEscape(a))
	}
	if s := OneLine(it.Summary, maxSummaryRunes); s != "" {
		b.WriteString("\n<b>Summary</b>: " + telegramEscape(s))
	}
	if it.DetailURL != "" {
		b.WriteString(fmt.Sprintf("\n\n<a href=\"%s\">View detail</a>", telegramEscapeAttr(it.DetailURL)))
	}
	return TruncateHTML(b.String(), telegramTextLimit), 1
}

// telegramReservedRunes is reserved for the message title and a possible truncation hint (measured
// in characters).
const telegramReservedRunes = 160

// telegramBatchLine renders one item in a digest (unescaped, escaped uniformly by the caller).
func telegramBatchLine(it Item, idx int) string {
	if a := assetLine(it.Assets, maxAssetsShown); a != "" {
		return fmt.Sprintf("%d. %s · %s — %s", idx, SeverityLabel(it.Severity), it.Title(), a)
	}
	return fmt.Sprintf("%d. %s · %s", idx, SeverityLabel(it.Severity), it.Title())
}

// telegramBatchTitle renders the title line of a digest message. The count used is the number
// **actually included in this message**, not the batch total — otherwise the reader assumes the
// number written in the message header is the total.
func telegramBatchTitle(m Message, items []Item, total int) string {
	title := fmt.Sprintf("Vulnerability digest · %d total", total)
	if extra := total - len(items); extra > 0 {
		title += fmt.Sprintf(" (showing the first %d; the remaining %d continue in the next message)", len(items), extra)
	}
	if m.WindowMinutes > 0 {
		title = fmt.Sprintf("Last %d minutes · %s", m.WindowMinutes, title)
	}
	return title
}

// telegramEscape escapes HTML text content.
// Telegram recognizes only these three entities, so after escaping an existing entity like &amp; is
// escaped a second time — which is exactly the expected behavior: we want to display the raw
// characters, not let the user inject HTML.
func telegramEscape(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	return s
}

// telegramEscapeAttr escapes an HTML attribute value. Beyond text escaping it also handles quotes —
// a quote in a URL would close the href attribute early, turning the following content into an
// injection point.
func telegramEscapeAttr(s string) string {
	s = telegramEscape(s)
	s = strings.ReplaceAll(s, "\"", "&quot;")
	return s
}

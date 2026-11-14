package notify

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
)

// weComMarkdownLimit is the hard cap (bytes, not characters) of the WeCom group bot's markdown
// content. This is the tightest limit among all six channels, and the main reason TruncateBytes
// exists.
const weComMarkdownLimit = 4096

// weComChannel implements the WeCom group bot.
//
// Platform characteristics:
//   - It authenticates only via the key on the URL and does not support signing — so the webhook
//     address itself is the entire credential.
//   - The markdown content cap is 4096 **bytes**, and over-long is rejected as a whole (not
//     truncated). A Chinese character is 3 bytes, meaning the body has only a bit over a thousand
//     characters to write, so client-side truncation is required.
//   - Rate limit is 20 messages/minute, likewise covered by client-side rate limiting.
type weComChannel struct{}

func (weComChannel) Kind() string { return KindWeCom }

func (weComChannel) DefaultRatePerMin() int { return 20 }

// WeCom has only one credential, the Webhook (the key on the URL), and it does not support signing —
// the whole address is the entire credential, with no other field to mask.
func (weComChannel) SecretKeys() []string { return []string{"webhook"} }

// WeCom has only one field, the Webhook, which is both the destination and the credential, so there
// is no "credential left over after the address changes".
func (weComChannel) DestinationKeys() []string { return []string{"webhook"} }

func (weComChannel) Validate(cfg map[string]any) error {
	hook := cfgString(cfg, "webhook")
	if hook == "" {
		return errors.New("missing Webhook address")
	}
	if err := validateHTTPURL(hook); err != nil {
		return fmt.Errorf("invalid Webhook address: %w", err)
	}
	return nil
}

func (c weComChannel) Send(ctx context.Context, cfg map[string]any, m Message) (int, error) {
	if err := c.Validate(cfg); err != nil {
		return 0, Permanent(err)
	}
	// A digest batch can be very long (50 items × one line each + prefix), and 4096 bytes is easily
	// exceeded. Truncation is done here rather than relying on a platform error: a rejection means
	// the whole batch is lost, while truncation at least delivers the first several items.
	content, kept := markdownBody(m, weComMarkdownLimit)
	payload := map[string]any{
		"msgtype":  "markdown",
		"markdown": map[string]any{"content": content},
	}
	raw, err := doJSON(ctx, "POST", cfgString(cfg, "webhook"), nil, payload)
	if err != nil {
		return 0, err
	}
	var res struct {
		ErrCode int    `json:"errcode"`
		ErrMsg  string `json:"errmsg"`
	}
	if err := json.Unmarshal(raw, &res); err != nil {
		return 0, fmt.Errorf("failed to parse the WeCom response: %w (%s)", err, snippet(raw))
	}
	if res.ErrCode != 0 {
		// 45009 is "interface calls exceeded the limit" — the platform's rate-limit window rolls, so
		// retrying after backoff is effective, hence it is explicitly classified as retryable.
		// Reaching here means the client rate_per_min is configured too aggressively; retry is only a
		// fallback, and the real fix is to lower this channel's rate limit.
		if res.ErrCode == 45009 {
			return 0, fmt.Errorf("WeCom rate-limited %d: %s", res.ErrCode, res.ErrMsg)
		}
		// 93000 is an invalid webhook key — a permanent failure, which a retry will not self-heal.
		return 0, Permanent(fmt.Errorf("WeCom returned error %d: %s", res.ErrCode, res.ErrMsg))
	}
	return kept, nil
}

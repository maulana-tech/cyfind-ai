package notify

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/url"
	"strconv"
	"time"
)

// dingTalkChannel implements the DingTalk custom bot.
//
// Platform characteristics (which determine the implementation trade-offs here):
//   - A single bot is rate-limited to 20 messages/minute, and over-sending is silently dropped
//     (HTTP may still be 200), so rate limiting must be done on the client, see DefaultRatePerMin.
//   - Security settings are one of three: signing / custom keyword / IP allowlist. Signing is the
//     only option that does not depend on the message content, so only signing is supported (a bare
//     webhook with none of the three enabled is also supported).
//   - Both success and failure return HTTP 200, distinguished by the errcode in the body — not
//     checking errcode would record a delivery failure as success.
type dingTalkChannel struct{}

func (dingTalkChannel) Kind() string { return KindDingTalk }

func (dingTalkChannel) DefaultRatePerMin() int { return 20 }

// DingTalk's Webhook address carries the access_token and is itself a credential, so it is masked as
// a whole.
func (dingTalkChannel) SecretKeys() []string { return []string{"webhook", "secret"} }

// The destination is DingTalk's Webhook address itself; changing the address must also re-state the
// signing secret for the new address.
func (dingTalkChannel) DestinationKeys() []string { return []string{"webhook"} }

func (dingTalkChannel) Validate(cfg map[string]any) error {
	hook := cfgString(cfg, "webhook")
	if hook == "" {
		return errors.New("missing Webhook address")
	}
	if err := validateHTTPURL(hook); err != nil {
		return fmt.Errorf("invalid Webhook address: %w", err)
	}
	return nil
}

// Send delivers one message. With a back-link and a single item it uses an ActionCard (with a
// button), otherwise markdown.
func (c dingTalkChannel) Send(ctx context.Context, cfg map[string]any, m Message) (int, error) {
	hook := cfgString(cfg, "webhook")
	if err := c.Validate(cfg); err != nil {
		return 0, Permanent(err)
	}
	endpoint, err := dingTalkSignedURL(hook, cfgString(cfg, "secret"), time.Now())
	if err != nil {
		return 0, Permanent(err)
	}

	title := markdownTitle(m)
	// DingTalk markdown body has no explicit byte cap, but a cap is still applied to protect against
	// abnormal evidence-field bloat.
	text, kept := markdownBody(m, 20000)

	var payload any
	if !m.Batch && len(m.Items) == 1 && m.Items[0].DetailURL != "" {
		payload = map[string]any{
			"msgtype": "actionCard",
			"actionCard": map[string]any{
				"title":          title,
				"text":           text,
				"btnOrientation": "0",
				"singleTitle":    "View detail",
				"singleURL":      m.Items[0].DetailURL,
			},
		}
	} else {
		payload = map[string]any{
			"msgtype":  "markdown",
			"markdown": map[string]any{"title": title, "text": text},
		}
	}

	raw, err := doJSON(ctx, "POST", endpoint, nil, payload)
	if err != nil {
		return 0, err
	}
	// DingTalk hides a business error inside the 200 response.
	var res struct {
		ErrCode int    `json:"errcode"`
		ErrMsg  string `json:"errmsg"`
	}
	if err := json.Unmarshal(raw, &res); err != nil {
		return 0, fmt.Errorf("failed to parse the DingTalk response: %w (%s)", err, snippet(raw))
	}
	if res.ErrCode != 0 {
		// 301000 is a signature-verification failure, 310000 is a keyword mismatch — both are
		// config errors, which a retry will not self-heal.
		return 0, Permanent(fmt.Errorf("DingTalk returned error %d: %s", res.ErrCode, res.ErrMsg))
	}
	return kept, nil
}

// dingTalkSignedURL appends the timestamp and sign parameters to the webhook per the official signing
// rule.
//
// Rule: the string to sign = timestamp + "\n" + secret, and the HMAC-SHA256 **key is also secret**,
// with the result base64-encoded then URL-encoded. The timestamp is in milliseconds. When secret is
// empty it returns as-is, to support a bot that has not enabled signing.
func dingTalkSignedURL(hook, secret string, now time.Time) (string, error) {
	if secret == "" {
		return hook, nil
	}
	ts := strconv.FormatInt(now.UnixMilli(), 10)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(ts + "\n" + secret))
	sign := base64.StdEncoding.EncodeToString(mac.Sum(nil))

	u, err := url.Parse(hook)
	if err != nil {
		// Do not pass err through: url.Parse's error text carries the full address (including the
		// access_token).
		return "", fmt.Errorf("failed to parse the Webhook address: %s", redactRequestTarget(hook))
	}
	q := u.Query()
	q.Set("timestamp", ts)
	q.Set("sign", sign)
	u.RawQuery = q.Encode()
	return u.String(), nil
}

// validateHTTPURL validates that the address is usable and the protocol is supported, and makes an
// intranet judgment for a literal-IP target.
//
// Two points of care:
//
//  1. **The error message must be redacted**. url.Parse's own returned *url.Error has an Error() that
//     carries the **full original address**, and the addresses of these channels embed credentials
//     (DingTalk access_token, WeCom key, Telegram bot token, Feishu hook id). This once did a direct
//     `return err`, so the "illegal address format" error carried the credential out, into the test
//     interface's 400 response, the last_error persisted on each delivery, the server log, and the
//     delivery-history interface.
//
//  2. **A literal IP is judged intranet directly**, while a domain is left to the dial stage
//     (blockInternalDial is the final effective point, and also covers DNS rebinding). Doing it once
//     here is so a hint can be given at config-save time rather than waiting for the first delivery
//     to fail.
//
// Restricting the protocol is defensive: things like file:/// or gopher:// would cause unexpected
// behavior in http.Client (although already blocked by the scheme check, there is no reason to open
// this surface).
func validateHTTPURL(raw string) error {
	u, err := url.Parse(raw)
	if err != nil {
		return fmt.Errorf("the address cannot be parsed (%s)", redactRequestTarget(raw))
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return fmt.Errorf("only http/https is supported, got %q", u.Scheme)
	}
	if u.Host == "" {
		return errors.New("missing host")
	}
	if ip := net.ParseIP(u.Hostname()); ip != nil && isBlockedDialIP(ip) && !allowLocalTargets() {
		return fmt.Errorf("refusing to deliver to the loopback/link-local address %s (if delivery to a local service is really needed, set %s=1)", ip, AllowLocalTargetsEnv)
	}
	return nil
}

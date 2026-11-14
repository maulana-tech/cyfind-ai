package notify

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"
	"syscall"
	"time"
)

// allowLocalTargets decides whether delivering a message to a loopback / link-local address is
// allowed.
//
// Rejected by default. These address ranges are not where an IM bot or a public email server would
// appear, while what they can reach is very sensitive: another service's admin port on the same
// machine, and a cloud environment's metadata endpoint (169.254.169.254, from which instance
// credentials can be read). The delivery address is set by an admin, but an admin session borrowed
// via XSS/CSRF, or a second person sharing the same JWT, could read the response content back by
// changing the config — doJSON writes the first 200 bytes of a 4xx/5xx response body into last_error,
// and the delivery-history interface echoes it, which is a semi-blind read primitive.
//
// But a "local SMTP relay" (postfix on 127.0.0.1:25) is a common configuration for self-hosted email,
// and a blanket ban would get people stuck. So leave an explicit escape hatch rather than hardcoding
// an allow: setting CYFIND_NOTIFY_ALLOW_LOCAL=1 allows it.
//
// It is exported as AllowLocalTargetsEnv so tests can explicitly turn it on — this package's and the
// server package's cases heavily use an httptest fake receiver on 127.0.0.1, and without turning it
// on they would all be blocked by the guard.
const AllowLocalTargetsEnv = "CYFIND_NOTIFY_ALLOW_LOCAL"

func allowLocalTargets() bool {
	v := strings.TrimSpace(os.Getenv(AllowLocalTargetsEnv))
	return v == "1" || strings.EqualFold(v, "true")
}

// isBlockedDialIP reports whether the target IP belongs to an address range that is "not allowed to
// deliver to by default".
//
// It only rejects loopback, link-local (including the cloud metadata 169.254.169.254), unspecified,
// and multicast. It **does not reject** RFC1918 private networks: an intranet self-hosted Mattermost
// / SMTP relay is a very common legitimate use, and blocking them too would make the feature directly
// unusable in a real environment. This trade-off is deliberate — the defense should block the
// genuinely sensitive targets while not scrapping a normal deployment along with them.
func isBlockedDialIP(ip net.IP) bool {
	if ip == nil {
		return true
	}
	// An IPv4-mapped IPv6 (::ffff:127.0.0.1) must be restored to IPv4 before judging, otherwise it
	// bypasses the check.
	if v4 := ip.To4(); v4 != nil {
		ip = v4
	}
	return ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() ||
		ip.IsInterfaceLocalMulticast() || ip.IsUnspecified() || ip.IsMulticast()
}

// blockInternalDial is the http.Transport dialer's Control hook, which checks the target address
// **at connection establishment**.
//
// Why it is set at the dial stage rather than only validated at config-save time: this is the final
// effective point. It covers both situations that bypass config validation — DNS rebinding (resolving
// to a public IP at validation, to an intranet one at the real connection) and a redirect (although
// we already reject a cross-host jump, a same-host jump could still point the path elsewhere).
func blockInternalDial(_, address string, _ syscall.RawConn) error {
	if allowLocalTargets() {
		return nil
	}
	host, _, err := net.SplitHostPort(address)
	if err != nil {
		return err
	}
	ip := net.ParseIP(host)
	if ip == nil {
		return fmt.Errorf("cannot resolve the target address %q", host)
	}
	if isBlockedDialIP(ip) {
		return fmt.Errorf("refusing to deliver to the loopback/link-local address %s (if delivery to a local service is really needed, set %s=1)", ip, AllowLocalTargetsEnv)
	}
	return nil
}

// notifyTransport adds just one dial guard on top of the default Transport.
// It uses Clone to keep all of the default's tuning (connection pool, HTTP/2, timeouts, proxy, etc.),
// to avoid changing other behavior just to add one check.
var notifyTransport = func() *http.Transport {
	t, ok := http.DefaultTransport.(*http.Transport)
	if !ok {
		return &http.Transport{}
	}
	clone := t.Clone()
	clone.DialContext = (&net.Dialer{Timeout: 10 * time.Second, Control: blockInternalDial}).DialContext
	return clone
}()

// httpClient is the client shared by all channel deliveries.
//
// It deliberately does **not** reuse the project's global egress proxy (the server-side GlobalProxy):
// that proxy is for pentest target traffic, often an unstable tunnel, and the notification's
// availability should not be held hostage by the target network's jitter. An IM push can connect
// directly. The timeout is 15 seconds — a peer slower than that is effectively already in a fault
// state.
//
// It rejects a cross-host redirect: this feature's delivery addresses are all a "fixed endpoint" form
// and normally do not redirect to another host; and these channels' credentials (DingTalk's
// access_token, WeCom's key, Telegram's bot token) are **in the URL**, so following a cross-host jump
// is equivalent to handing the credential to the redirect target. A same-host jump (such as appending
// a trailing slash) is still allowed.
var httpClient = &http.Client{
	Timeout:   15 * time.Second,
	Transport: notifyTransport,
	CheckRedirect: func(req *http.Request, via []*http.Request) error {
		if len(via) >= 5 {
			return errors.New("too many redirects")
		}
		if len(via) > 0 && req.URL.Host != via[0].URL.Host {
			return fmt.Errorf("refusing a cross-host redirect (%s → %s)", via[0].URL.Host, req.URL.Host)
		}
		return nil
	},
}

// respBodyLimit limits the size of the response body read. A peer in an abnormal state may spit back
// oversized content, while we only need the error code and a short error description to show in the
// delivery history.
const respBodyLimit = 8 << 10

// doJSON sends one request and returns the response body (already length-limited).
//
// When payload is nil it sends an empty body (for GET or when the platform does not require a body).
// The key-values in headers are attached as-is, for the generic Webhook's custom headers.
//
// Error classification is this function's core responsibility: a network-layer failure and 5xx/408/429
// are classified as "retryable", and the rest of 4xx as "permanent failure" — retrying a 403 just
// prints the same error to the log 3 times.
func doJSON(ctx context.Context, method, url string, headers map[string]string, payload any) ([]byte, error) {
	var body io.Reader
	if payload != nil {
		raw, err := json.Marshal(payload)
		if err != nil {
			// A serialization failure is a local bug (a wrong config field type), which a retry will
			// not improve.
			return nil, Permanent(fmt.Errorf("failed to build the request body: %w", err))
		}
		body = bytes.NewReader(raw)
	}
	req, err := http.NewRequestWithContext(ctx, method, url, body)
	if err != nil {
		// An illegal URL — most likely the user filled the address in wrong, a permanent failure.
		// Here, too, err must not be passed through: url.Parse's error text contains the full address.
		return nil, Permanent(fmt.Errorf("illegal request address: %s", redactRequestTarget(url)))
	}
	if payload != nil {
		req.Header.Set("Content-Type", "application/json; charset=utf-8")
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	resp, err := httpClient.Do(req)
	if err != nil {
		// Connection refused, DNS failure, timeout — mostly transient faults, handed to backoff retry.
		//
		// The error text must be redacted before being passed out. Reason: http.Client.Do returns a
		// *url.Error whose Error() is `Op "full URL": underlying error`, and these channels'
		// credentials are **in the URL** (DingTalk access_token, WeCom key, Feishu hook id, Telegram
		// /bot<token>/). Without redaction, the credential would flow along this error string to four
		// places: notification_deliveries' last_error (stored in plaintext), the delivery-history
		// interface's response (**bypassing the channel config's masking**), the server log, and the
		// 502 text the test-send interface returns to the frontend.
		return nil, fmt.Errorf("request failed: %s", redactTransportError(err))
	}
	defer resp.Body.Close()
	raw, readErr := io.ReadAll(io.LimitReader(resp.Body, respBodyLimit))
	if readErr != nil {
		return nil, fmt.Errorf("failed to read the response: %w", readErr)
	}
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return raw, nil
	}
	// 429 (rate limit) and 408 (timeout) are worth retrying; the rest of 4xx are config or permission
	// issues where retry is pointless.
	if resp.StatusCode == http.StatusTooManyRequests || resp.StatusCode == http.StatusRequestTimeout {
		return nil, fmt.Errorf("the peer rate-limited or timed out (HTTP %d): %s", resp.StatusCode, snippet(raw))
	}
	if resp.StatusCode >= 500 {
		return nil, fmt.Errorf("the peer service is abnormal (HTTP %d): %s", resp.StatusCode, snippet(raw))
	}
	return nil, Permanent(fmt.Errorf("the peer refused the request (HTTP %d): %s", resp.StatusCode, snippet(raw)))
}

// snippet compresses a response body into a short one-line text, for an error message. A response may
// carry newlines and a lot of whitespace, and stuffing it straight into last_error would break the
// delivery-history page's layout.
func snippet(raw []byte) string {
	return OneLine(string(raw), 200)
}

// redactRequestTarget compresses a delivery address into "scheme://host/…", for an error message.
//
// This is this package's only address-redaction measure, deliberately made **blunt enough**:
// everything but the scheme and host is discarded. The reason is that there is no "generic and safe"
// way to judge which segment of a URL is the credential:
//
//	DingTalk  credential in query      /robot/send?access_token=xxx
//	WeCom     credential in query      /cgi-bin/webhook/send?key=xxx
//	Feishu    credential in the **path tail** /open-apis/bot/v2/hook/<hook_id>
//	Telegram  credential in the **path middle** /bot<token>/sendMessage
//
// Trying to "keep only the useful part" would require patching per channel, and missing any one is a
// credential leak. Keeping the host is already enough for diagnosis (DNS cannot resolve, cannot
// connect, wrong certificate can all be located), and which specific bot it is, is recognized by the
// masked suffix hint in the channel config.
//
// On a parse failure it returns a fixed placeholder — it never echoes the original string.
func redactRequestTarget(raw string) string {
	u, err := url.Parse(raw)
	if err != nil || u.Host == "" {
		return "(address unparseable)"
	}
	return u.Scheme + "://" + u.Host + "/…"
}

// redactTransportError strips the address from a transport-layer error, keeping only the underlying
// reason.
//
// A *url.Error has the structure {Op, URL, Err}, and its Error() prints the URL too. Here it
// explicitly takes the Err field, bypassing its Error() — more reliable than doing a string
// replacement afterward, because a replacement would have to correctly handle the various variants
// after URL encoding/escaping, which is easy to miss.
func redactTransportError(err error) string {
	var uerr *url.Error
	if errors.As(err, &uerr) {
		host := ""
		if u, parseErr := url.Parse(uerr.URL); parseErr == nil {
			host = u.Host
		}
		if uerr.Err != nil {
			return fmt.Sprintf("%s %s: %s", uerr.Op, host, uerr.Err)
		}
		return fmt.Sprintf("%s %s: unknown error", uerr.Op, host)
	}
	// A non-*url.Error (such as an error returned by the redirect policy) may also carry an address,
	// so uniformly go through redaction.
	return redactURLsInText(err.Error())
}

// redactURLsInText replaces http(s) addresses appearing in a piece of text with the redacted form.
//
// Used as a fallback for errors where the structured field is unavailable (a redirect-policy error, a
// third-party library's custom error). It recognizes only the http/https prefix and splits by
// whitespace and quotes — an address will not contain these two kinds of characters.
func redactURLsInText(s string) string {
	var b strings.Builder
	for i := 0; i < len(s); {
		rest := s[i:]
		if strings.HasPrefix(rest, "http://") || strings.HasPrefix(rest, "https://") {
			end := len(rest)
			if j := strings.IndexAny(rest, " \t\n\"'"); j >= 0 {
				end = j
			}
			b.WriteString(redactRequestTarget(rest[:end]))
			i += end
			continue
		}
		b.WriteByte(s[i])
		i++
	}
	return b.String()
}

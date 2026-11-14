package notify

import (
	"context"
	"crypto/tls"
	"encoding/base64"
	"errors"
	"fmt"
	"mime"
	"net"
	"net/smtp"
	"strconv"
	"strings"
	"time"
)

// emailDialTimeout / emailSessionTimeout bound connection establishment and the whole SMTP session
// respectively. net/smtp has no timeout mechanism of its own, and without these two, a stuck peer
// would leave the delivery goroutine hanging there forever — and the dispatcher is a single goroutine
// processing serially, which means the whole notification system stalls.
const (
	emailDialTimeout    = 10 * time.Second
	emailSessionTimeout = 45 * time.Second
)

// emailChannel implements SMTP email delivery.
type emailChannel struct{}

func (emailChannel) Kind() string { return KindEmail }

// Email has no platform rate limit, but it should not be used to screen-flood; give a lenient default.
func (emailChannel) DefaultRatePerMin() int { return 60 }

// Mask only the password. The SMTP host, account, and recipients are not secrets, and masking them
// only makes editing a hassle.
func (emailChannel) SecretKeys() []string { return []string{"password"} }

// host/port decide which server the password is handed to; tls decides whether the transport is
// encrypted. A change to any of the three requires re-stating the password — incidentally forcing the
// "turn off TLS" step to explicitly include the credential rather than being changed offhand.
func (emailChannel) DestinationKeys() []string { return []string{"host", "port", "tls"} }

func (emailChannel) Validate(cfg map[string]any) error {
	if cfgString(cfg, "host") == "" {
		return errors.New("missing SMTP server address")
	}
	port := cfgInt(cfg, "port")
	if port <= 0 || port > 65535 {
		return errors.New("invalid SMTP port (should be 1-65535)")
	}
	if cfgString(cfg, "from") == "" {
		return errors.New("missing sender address")
	}
	if len(cfgStrings(cfg, "to")) == 0 {
		return errors.New("at least one recipient address is required")
	}
	return nil
}

func (c emailChannel) Send(ctx context.Context, cfg map[string]any, m Message) (int, error) {
	if err := c.Validate(cfg); err != nil {
		return 0, Permanent(err)
	}
	host := cfgString(cfg, "host")
	port := cfgInt(cfg, "port")
	from := cfgString(cfg, "from")
	to := cfgStrings(cfg, "to")
	username := cfgString(cfg, "username")
	password := cfgString(cfg, "password")
	implicitTLS := cfgBool(cfg, "tls")

	msg, err := buildEmailMessage(from, to, m)
	if err != nil {
		return 0, Permanent(err)
	}

	addr := net.JoinHostPort(host, strconv.Itoa(port))
	client, err := emailDial(ctx, addr, host, implicitTLS)
	if err != nil {
		return 0, err
	}
	defer client.Close()

	// STARTTLS: upgrade if the peer supports it. Credentials cannot be sent over a plaintext session
	// (see the auth note below).
	if !implicitTLS {
		if ok, _ := client.Extension("STARTTLS"); ok {
			if err := client.StartTLS(&tls.Config{ServerName: host, MinVersion: tls.VersionTLS12}); err != nil {
				return 0, fmt.Errorf("STARTTLS failed: %w", err)
			}
		}
	}
	if username != "" {
		if err := client.Auth(smtp.PlainAuth("", username, password, host)); err != nil {
			// smtp.PlainAuth refuses to send credentials over an unencrypted connection (unless the
			// target is localhost). This is the **correct** security behavior and must not be
			// bypassed, but the reason needs to be translated clearly — otherwise the user only sees
			// "unencrypted connection" and does not know what to do.
			if strings.Contains(err.Error(), "unencrypted connection") {
				return 0, Permanent(fmt.Errorf("refusing to send credentials: the connection is not encrypted. Please enable TLS, or use port 465 (implicit TLS), or check \"Enable TLS\" (%w)", err))
			}
			return 0, Permanent(fmt.Errorf("SMTP authentication failed: %w", err))
		}
	}
	if err := client.Mail(from); err != nil {
		return 0, smtpStageError(fmt.Sprintf("sender %s was rejected", from), err)
	}
	for _, rcpt := range to {
		if err := client.Rcpt(rcpt); err != nil {
			return 0, smtpStageError(fmt.Sprintf("recipient %s was rejected", rcpt), err)
		}
	}
	w, err := client.Data()
	if err != nil {
		return 0, fmt.Errorf("SMTP DATA failed: %w", err)
	}
	if _, err := w.Write([]byte(msg)); err != nil {
		return 0, fmt.Errorf("failed to write the email body: %w", err)
	}
	if err := w.Close(); err != nil {
		return 0, fmt.Errorf("failed to submit the email: %w", err)
	}
	// A Quit failure does not affect the fact that "the email has been received by the server", so its
	// error is ignored.
	_ = client.Quit()
	// Email has no length truncation (the whole HTML body is sent), so the whole batch counts as
	// delivered.
	return len(m.Items), nil
}

// emailDial establishes the SMTP connection.
//
// implicitTLS=true uses a "TLS on connect" approach like 465; false uses a 25/587 plaintext connection
// followed by STARTTLS. The two cannot be mixed: sending a plaintext greeting to port 465 is
// disconnected outright.
//
// The session deadline is set right **at connection establishment** (rather than added afterward),
// because net/smtp's Client hides the underlying connection in an unexported field that the outside
// cannot get; once the connection is handed over, only the pre-set deadline can serve as a fallback.
// This also incidentally covers a block during the handshake stage.
// Hooking blockInternalDial on Control shares the same guard with the HTTP-family channels. Without
// it, SMTP would be the gap in the whole SSRF defense: filling host with 169.254.169.254 or 127.0.0.1
// would connect directly, and when smtp.NewClient's handshake fails it wraps the line the peer
// returned into the error, which is echoed via last_error by the delivery-history interface, forming
// a semi-blind read primitive; the timing difference of "connection refused vs timeout" can also be
// used to probe ports. The dial stage is the final effective point, and also covers DNS rebinding.
func emailDial(ctx context.Context, addr, host string, implicitTLS bool) (*smtp.Client, error) {
	d := &net.Dialer{Timeout: emailDialTimeout, Control: blockInternalDial}
	var conn net.Conn
	var err error
	if implicitTLS {
		conn, err = tls.DialWithDialer(d, "tcp", addr, &tls.Config{ServerName: host, MinVersion: tls.VersionTLS12})
	} else {
		conn, err = d.DialContext(ctx, "tcp", addr)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to connect to the SMTP server: %w", err)
	}
	_ = conn.SetDeadline(time.Now().Add(emailSessionTimeout))
	client, err := smtp.NewClient(conn, host)
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("SMTP handshake failed: %w", err)
	}
	return client, nil
}

// smtpStageError classifies a stage's failure into "retryable" and "permanent failure" by the SMTP
// reply code.
//
// Why it must be distinguished: SMTP's 4xx and 5xx semantics are completely different —
//   - 4xx (450 greylist, 451 local error, 452 insufficient storage) is a **temporary** rejection, and
//     the correct practice is to retry later; the greylist especially is hit on almost every first
//     delivery.
//   - 5xx (550 user does not exist, 553 illegal address) is a permanent rejection, where retry is
//     pointless.
//
// If everything were judged a permanent failure, a mail server with greylisting enabled would make
// **every** push fall into failed after the first attempt — and this kind of failure is exactly where
// automatic retry should be most useful. The reply code takes the first three digits of the error
// text; when the code cannot be obtained it is treated as retryable (better to try once more than to
// kill a possible transient fault because it could not be parsed).
func smtpStageError(what string, err error) error {
	code := smtpReplyCode(err.Error())
	if code >= 500 && code < 600 {
		return Permanent(fmt.Errorf("%s: %w", what, err))
	}
	return fmt.Errorf("%s: %w", what, err)
}

// smtpReplyCode takes the leading three-digit reply code from the SMTP error text, returning 0 when
// it cannot be obtained. net/smtp does not export an error-code field, so it can only be taken from
// the text; the format is "450 4.7.1 ...".
func smtpReplyCode(text string) int {
	if len(text) < 3 {
		return 0
	}
	n, err := strconv.Atoi(text[:3])
	if err != nil {
		return 0
	}
	return n
}

// buildEmailMessage assembles a complete RFC 5322 email.
//
// The body is base64-encoded for two reasons: one, SMTP stipulates a single line no longer than 1000
// bytes, and an HTML body (especially a digest email) easily has over-long lines; two, base64
// naturally does not produce a line starting with ".", saving the hassle of SMTP dot escaping.
func buildEmailMessage(from string, to []string, m Message) (string, error) {
	var b strings.Builder
	fmt.Fprintf(&b, "From: %s\r\n", from)
	fmt.Fprintf(&b, "To: %s\r\n", strings.Join(to, ", "))
	// A non-ASCII subject must be RFC 2047 encoded, otherwise it is displayed garbled by the client.
	fmt.Fprintf(&b, "Subject: %s\r\n", mime.QEncoding.Encode("utf-8", htmlTitle(m)))
	b.WriteString("MIME-Version: 1.0\r\n")
	b.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n")
	b.WriteString("Content-Transfer-Encoding: base64\r\n")
	// Email has no hard length cap, so the body is not truncated.
	b.WriteString("\r\n")
	encoded := base64.StdEncoding.EncodeToString([]byte(htmlBody(m, 0)))
	// base64 wraps at 76 characters, per RFC 2045.
	for len(encoded) > 76 {
		b.WriteString(encoded[:76] + "\r\n")
		encoded = encoded[76:]
	}
	b.WriteString(encoded + "\r\n")
	return b.String(), nil
}

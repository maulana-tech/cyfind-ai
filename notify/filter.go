package notify

import (
	"encoding/json"
	"fmt"
	"slices"
	"strings"
)

// Filter is the contract for the notification_channels.filter JSONB column: a channel instance's
// filter conditions. All fields are optional, and the default is "no filtering" — which is exactly
// the fallback semantics for a malformed config, see ParseFilter.
type Filter struct {
	// MinSeverity is the minimum-level threshold (low/medium/high/critical); empty = no threshold.
	MinSeverity string `json:"min_severity"`
	// An empty TaskIDs / AssetIDs array means unrestricted; non-empty requires the event to
	// intersect with it.
	TaskIDs  []int64 `json:"task_ids"`
	AssetIDs []int64 `json:"asset_ids"`
	// An empty VulnClassInclude means accept all; non-empty requires vulnclass to hit any one of
	// the keywords. VulnClassExclude excludes on hitting any one keyword (exclude takes priority
	// over include). Matching is a case-insensitive substring — safer than regex: a user's bad
	// regex will not silently break the channel.
	VulnClassInclude []string `json:"vulnclass_include"`
	VulnClassExclude []string `json:"vulnclass_exclude"`
	// OnStatusChange decides whether this channel receives vulnerability-status-change events
	// (meaningful only in realtime mode).
	OnStatusChange bool `json:"on_status_change"`
}

// ParseFilter parses a channel's filter config.
//
// **It never returns an error.** This is a deliberate design choice: a malformed filter config
// always degrades to a zero-value Filter (= no filtering = everything matches), because for a
// vulnerability notification system, **over-pushing one item is far better than silently missing
// one high-risk item**. Making a parse failure mean "do not push" would give the user a channel
// that looks configured but actually pushes nothing — the worst failure mode.
func ParseFilter(raw []byte) Filter {
	var f Filter
	if len(raw) == 0 {
		return f
	}
	// On a parse failure f stays the zero value, i.e. no filtering.
	_ = json.Unmarshal(raw, &f)
	return f
}

// ValidMinSeverity reports whether s is a valid level threshold (an empty string means no threshold).
func ValidMinSeverity(s string) bool {
	if s == "" {
		return true
	}
	_, ok := severityRank[s]
	return ok
}

// Validate validates the **value-restricted** fields of the filter config, called when saving a channel.
//
// Why it must be caught on write: Match's judgment for an unknown threshold is `rank >= 0`, which
// is always true — that is, a typo in min_severity ("hgih") would **silently break** the filter
// into "push everything". This is consistent with this package's "rather over-push than miss"
// trade-off (nothing is missed), but the consequence is that the user thinks they are doing tiered
// pushing while actually flooding all vulnerabilities into the group, with no sign that they
// misconfigured. This kind of "silent degradation" should be caught right at the entrance.
//
// Note that Validate is used only on the **write** path. The read path still uses ParseFilter's
// lenient semantics, so a bad value already existing in historical data does not make the whole
// channel unreadable.
func (f Filter) Validate() error {
	if !ValidMinSeverity(f.MinSeverity) {
		return fmt.Errorf("minimum level %q is invalid; options: low / medium / high / critical, or leave empty for no limit", f.MinSeverity)
	}
	return nil
}

// Match decides whether an event should be delivered to a channel with the given filter.
//
// **It never returns an error**, for the same reason as ParseFilter: any internal exception is
// treated as "match". Decision order: event type → level threshold → task/asset scope →
// vulnerability-type keywords.
func Match(f Filter, s Snapshot) bool {
	// A status-change event is received only by a channel that explicitly enabled it. Off by
	// default, because the vast majority of users expect "push" to mean "a new vulnerability was
	// found", not a running account of every status transition.
	if s.Kind == EventFindingStatusChanged && !f.OnStatusChange {
		return false
	}
	if !AtLeast(s.Severity, f.MinSeverity) {
		return false
	}
	if len(f.TaskIDs) > 0 && !slices.Contains(f.TaskIDs, s.TaskID) {
		return false
	}
	if len(f.AssetIDs) > 0 && !intersectsInt(f.AssetIDs, s.AssetIDs) {
		return false
	}
	// Exclude takes priority: hitting any one exclude keyword is out, even if it also hits the
	// include list.
	if len(f.VulnClassExclude) > 0 && containsAnyFold(s.VulnClass, f.VulnClassExclude) {
		return false
	}
	if len(f.VulnClassInclude) > 0 && !containsAnyFold(s.VulnClass, f.VulnClassInclude) {
		return false
	}
	return true
}

func intersectsInt(a, b []int64) bool {
	// A linear scan is fine for small sets; both sides are on the order of "a few dozen picked by
	// hand", so building a map costs more than it saves.
	for _, v := range b {
		if slices.Contains(a, v) {
			return true
		}
	}
	return false
}

// containsAnyFold reports whether s contains any one of the keywords (case-insensitive).
func containsAnyFold(s string, keywords []string) bool {
	lower := strings.ToLower(s)
	for _, kw := range keywords {
		kw = strings.ToLower(strings.TrimSpace(kw))
		if kw != "" && strings.Contains(lower, kw) {
			return true
		}
	}
	return false
}

package notify

// Snapshot is the contract for the notification_events.snapshot JSONB column. The writer is the
// db layer's finding-store transaction, and the reader is the server layer's delivery engine and
// filter matching. The definition lives in this package because it is the "notification domain"
// payload: db only serializes it and does not understand the field meanings.
//
// Why vulnerability fields are stored redundantly rather than re-queried at render time: a
// vulnerability is later renamed, re-leveled, and re-statused, while the push content should
// reflect the conclusion **at the time of the event** — re-querying would get the dangerously
// misleading "later changed to low". Also, fan-out and rendering therefore need not JOIN the
// three tables findings/tasks/assets.
type Snapshot struct {
	// Event type: finding_created / finding_status_changed
	Kind      string  `json:"kind"`
	FindingID int64   `json:"finding_id"`
	TaskID    int64   `json:"task_id"`
	VulnClass string  `json:"vulnclass"`
	Name      string  `json:"name"`
	Severity  string  `json:"severity"`
	Summary   string  `json:"summary"`
	AssetIDs  []int64 `json:"asset_ids"`
	// Non-empty only when kind=finding_status_changed.
	FromStatus string `json:"from_status,omitempty"`
	ToStatus   string `json:"to_status,omitempty"`
}

// Item is one vulnerability to be pushed, for a channel to render.
type Item struct {
	FindingID int64
	Name      string
	VulnClass string
	Severity  string
	Summary   string
	// Assets is the resolved asset display names (e.g. domain/IP). Filled by the server layer —
	// this package does not touch the database and cannot get the names.
	Assets []string
	// DetailURL is the vulnerability-detail back-link; empty means public_base_url is not
	// configured, and it is omitted when rendering.
	DetailURL string
	// For a status-change event only; when both are non-empty it renders as "Pending → Fixed".
	FromStatus string
	ToStatus   string
}

// IsStatusChange reports whether the item is a status-change event.
func (i Item) IsStatusChange() bool { return i.FromStatus != "" || i.ToStatus != "" }

// Title returns the item's display title: it prefers the manually assigned name, falls back to
// the vulnerability type vulnclass, and uses a placeholder when both are empty — it never outputs
// an empty title.
func (i Item) Title() string {
	if i.Name != "" {
		return i.Name
	}
	if i.VulnClass != "" {
		return i.VulnClass
	}
	return "(unnamed finding)"
}

// Message is the complete content of one channel send.
type Message struct {
	// Length is 1 for a single push; a whole batch for a digest push.
	// An empty slice is illegal, and the caller must guarantee at least one.
	Items []Item
	// When Batch=true, it renders as a digest message (a different title, with the time window
	// and item count).
	Batch bool
	// WindowMinutes is the digest cycle (minutes), used only when Batch=true for the "last N
	// minutes" text. It is deliberately passed in explicitly by config rather than computed as
	// time.Since at render time: rendering stays deterministic, which is better for testing.
	WindowMinutes int
	// HomeURL is the platform dashboard address (global public_base_url); empty omits the
	// dashboard entry.
	HomeURL string
}

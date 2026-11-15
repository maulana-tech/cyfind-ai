package server

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/maulana-tech/cyfind-ai/db"
	"github.com/maulana-tech/cyfind-ai/notify"
)

// Global setting keys (stored in the settings key/value table, no dedicated table needed).
const (
	// settingNotifyEnabled is the master push switch. Default on: it exists as a
	// one-click kill switch during maintenance, not as the feature's enable
	// condition — the real enable condition is "whether any channel is configured".
	settingNotifyEnabled = "notify_enabled"
	// settingNotifyPublicBaseURL is the externally reachable address used to build
	// finding-detail back-links (e.g. https://cyfind.example.com). Left empty, messages
	// carry no back-link button. The project has no reusable external-address config,
	// so this adds one.
	settingNotifyPublicBaseURL = "notify_public_base_url"
	// settingNotifyDigestMinutes is the digest-mode interval (in minutes).
	settingNotifyDigestMinutes = "notify_digest_interval_min"
)

const (
	// notifyTick is the delivery engine's polling interval. 3 seconds is the upper
	// bound on this engine's responsiveness, and the main source of latency between
	// "finding persisted" and "message reaching the IM".
	notifyTick = 3 * time.Second
	// notifyLease is the lease duration taken when claiming a delivery. It must be
	// noticeably larger than the worst-case cost of a single send (the notify
	// package's HTTP client times out at 15s), otherwise the same row can be
	// delivered by two dispatchers at once.
	notifyLease = 3 * time.Minute
	// notifyFanOutPerTick caps how many events are dispatched per round, so that
	// enabling a channel for the first time does not expand the entire historical
	// backlog into delivery tasks all at once.
	notifyFanOutPerTick = 200
	// notifyDefaultDigestMinutes is the default digest interval.
	notifyDefaultDigestMinutes = 30
	// notifyUnlimitedBurstPerTick is the per-round delivery cap for a channel with
	// no rate limit set. It exists to keep "one channel configured unlimited + one
	// scan producing thousands of findings" from turning a single round into a
	// long blocking stall.
	notifyUnlimitedBurstPerTick = 50
	// notifyMaxSendsPerChannelPerTick is how many items a single channel may deliver
	// per round.
	//
	// This cap is derived backwards from the lease duration: claiming a row stamps it
	// with a lease (notifyLease = 3 minutes), and if a round serially delivers enough
	// items that the worst-case cost exceeds the lease, the later ones' leases expire
	// before they are sent. Within one process this is harmless (Run is a single
	// goroutine running serially, ticks never re-enter), but with two processes
	// sharing one database the peer re-claims the lease-expired rows and sends them
	// again, double-increments attempts, and judges them failed while the original
	// process is still delivering.
	//
	// Value: 3-minute lease / 30-second per-send timeout = 6 uses the lease exactly
	// with zero headroom, so it cannot be used; 5 keeps the worst case at 150s,
	// leaving 30s of headroom. This relationship is pinned by
	// TestNotifyTickBudgetFitsWithinLease — changing notifyLease, notifySendTimeout,
	// or this value alone will break that assertion.
	notifyMaxSendsPerChannelPerTick = 5
	// notifySendTimeout is the timeout for a single send. It also determines the value
	// of the previous constant; their product must not exceed notifyLease, see
	// TestNotifyTickBudgetFitsWithinLease.
	notifySendTimeout = 30 * time.Second
)

// notifyBackoff is the retry back-off sequence, indexed by the number of attempts
// already made. The 3 chances (including the first) correspond to
// db.MaxNotifyAttempts; the two must be changed together.
var notifyBackoff = []time.Duration{
	time.Second,
	5 * time.Second,
	30 * time.Second,
}

// Notifier is the delivery engine for finding notifications.
//
// It runs as an independent goroutine alongside Scheduler (see server.New). It
// deliberately does not reuse Scheduler's tick: push responsiveness (3s) has a
// different cadence from the triggers' business rhythm, and the two failures are
// independent — a stuck push must not affect agent triggering.
type Notifier struct {
	s  *Server
	pg *db.DB

	// mu guards buckets. Channels are few and contention is low, so a single mutex
	// is enough; it is not worth introducing a finer-grained structure for it.
	mu      sync.Mutex
	buckets map[int64]*notifyBucket
}

// notifyBucket is a single channel's token bucket.
//
// We use a token bucket rather than a "count per minute, then reset" sliding window
// because the window's boundary effect is bad: sending 20 at the end of a window and
// another 20 the next instant looks to the platform like 40 in one second and gets
// rate-limited. A token bucket refills at a constant rate and naturally avoids such
// bursts.
type notifyBucket struct {
	tokens   float64
	lastFill time.Time
}

func newNotifier(s *Server) *Notifier {
	return &Notifier{s: s, pg: s.m.pg, buckets: map[int64]*notifyBucket{}}
}

// Run loops until ctx ends. Started once by server.New.
func (n *Notifier) Run(ctx context.Context) {
	if n.pg == nil {
		return
	}
	t := time.NewTicker(notifyTick)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			n.step(ctx)
		}
	}
}

// step runs one round: first dispatch new events, then deliver due tasks.
//
// A failure in either step is only logged, never breaks the loop — a notification
// failure must never escalate into a process-level problem. Each tick is
// independent; the next round retries naturally.
func (n *Notifier) step(ctx context.Context) {
	if !n.enabled() {
		return
	}
	if _, _, err := n.pg.FanOutPendingEvents(ctx, notifyFanOutPerTick); err != nil {
		log.Printf("[notify] failed to dispatch events: %v", err)
		return
	}
	channels, err := n.pg.ListNotificationChannels(ctx)
	if err != nil {
		log.Printf("[notify] failed to read channels: %v", err)
		return
	}
	baseURL := n.publicBaseURL()
	for _, ch := range channels {
		if !ch.IsEnabled() {
			continue
		}
		// The token bucket meters in message count (equivalent to HTTP request count),
		// not finding count. In realtime mode the two are the same (one finding, one
		// message); in digest mode a whole batch of findings is combined into one
		// message and so consumes a single token.
		//
		// Both modes ask the token bucket first, then claim up to the granted amount —
		// the order must not be reversed, otherwise a delivery blocked by the rate
		// limit would already have consumed a retry attempt.
		now := time.Now()
		if ch.Mode == db.NotifyModeDigest {
			tokens, claimLimit := digestTickPlan()
			if n.takeTokens(ch.ID, ch.RatePerMin, tokens, now) <= 0 {
				continue
			}
			n.stepDigest(ctx, ch, claimLimit, baseURL)
			continue
		}
		allow := n.takeTokens(ch.ID, ch.RatePerMin, notifyMaxSendsPerChannelPerTick, now)
		if allow <= 0 {
			continue
		}
		n.stepRealtime(ctx, ch, allow, baseURL)
	}
}

// digestTickPlan returns a digest channel's token consumption and upper bound on
// batch size for this round.
//
// The two return values are two different units, which is exactly why this is its
// own function:
//
//   - tokens is message count. A batch of findings combines into one message and
//     one HTTP request, so it is always 1. rate_per_min therefore still applies to
//     digest (at most that many digest messages per minute).
//   - claimLimit is how many findings this batch may hold at most. It is bounded only
//     by an in-memory cap and has nothing to do with the request budget.
//
// Once, to make rate_per_min apply to digest, the per-round request budget
// (notifyMaxSendsPerChannelPerTick, derived from the lease) was passed down directly
// as the batch size. The result was that a rate_per_min=20 channel refilled only 1
// token within a 3-second tick, so each digest message held just 1 finding — digest
// degenerated into "realtime push with digest wording", and readers received a
// stream of "1 new finding in the last 30 minutes" while db.MaxDigestBatchSize was
// never reachable.
//
// This symptom is hard to catch in end-to-end tests (the existing cases all pass a
// manually large limit to stepDigest, bypassing the quota math in step), so the
// decision is pinned here by TestDigestTickPlanDecouplesBatchSizeFromSendBudget.
func digestTickPlan() (tokens, claimLimit int) {
	return 1, db.MaxDigestBatchSize
}

// stepRealtime claims and delivers a channel's realtime tasks, one message per finding.
func (n *Notifier) stepRealtime(ctx context.Context, ch *db.NotificationChannel, allow int, baseURL string) {
	deliveries, err := n.pg.ClaimRealtimeDeliveries(ctx, ch.ID, allow, notifyLease)
	if err != nil {
		log.Printf("[notify] failed to claim realtime deliveries channel=%d: %v", ch.ID, err)
		return
	}
	if len(deliveries) == 0 {
		return
	}
	channel, cfg, ok := n.adapt(ch)
	if !ok {
		_ = n.pg.FailDeliveries(ctx, deliveryIDs(deliveries), fmt.Sprintf("channel kind %q is not registered", ch.Kind))
		return
	}
	for _, dl := range deliveries {
		msg, err := n.renderSingle(ctx, dl, baseURL)
		if err != nil {
			// A render failure is a local data problem; retrying will not improve it.
			_ = n.pg.FailDeliveries(ctx, []int64{dl.ID}, err.Error())
			continue
		}
		n.send(ctx, channel, cfg, msg, []*db.NotificationDelivery{dl})
	}
}

// stepDigest aggregates a channel's pending deliveries into one message and sends it
// when the batch is due.
func (n *Notifier) stepDigest(ctx context.Context, ch *db.NotificationChannel, allow int, baseURL string) {
	window := n.digestInterval()
	due, err := n.pg.DigestBatchDue(ctx, ch.ID, window)
	if err != nil {
		log.Printf("[notify] failed to decide digest batch channel=%d: %v", ch.ID, err)
		return
	}
	if !due {
		return
	}
	deliveries, err := n.pg.ClaimDigestBatch(ctx, ch.ID, allow, notifyLease)
	if err != nil {
		log.Printf("[notify] failed to claim digest batch channel=%d: %v", ch.ID, err)
		return
	}
	if len(deliveries) == 0 {
		return
	}
	channel, cfg, ok := n.adapt(ch)
	if !ok {
		_ = n.pg.FailDeliveries(ctx, deliveryIDs(deliveries), fmt.Sprintf("channel kind %q is not registered", ch.Kind))
		return
	}
	msg, included, err := n.renderBatch(ctx, deliveries, baseURL, int(window.Minutes()))
	if err != nil {
		_ = n.pg.FailDeliveries(ctx, deliveryIDs(deliveries), err.Error())
		return
	}
	// Deliveries whose snapshot was broken and never made it into the message must be
	// explicitly failed. Otherwise they stay outside included — in neither the message
	// nor the failure list — and when the send succeeds the later batch mark misses
	// them, leaving them stuck in sending forever until the lease expires and they are
	// re-claimed over and over.
	if skipped := excludeDeliveries(deliveries, included); len(skipped) > 0 {
		reason := "event snapshot could not be parsed; this finding cannot be rendered into a message"
		if fErr := n.pg.FailDeliveries(ctx, deliveryIDs(skipped), reason); fErr != nil {
			log.Printf("[notify] failed to mark bad-snapshot deliveries channel=%s ids=%v: %v", ch.Kind, deliveryIDs(skipped), fErr)
		}
		log.Printf("[notify] skipped %d deliveries with unparseable snapshots channel=%d", len(skipped), ch.ID)
	}
	// Only hand send the ones that made it into the message: included[i] corresponds
	// strictly to msg.Items[i], and send relies on this correspondence to map
	// "the channel reported it held the first K" onto the right delivery rows.
	n.send(ctx, channel, cfg, msg, included)
}

// send delivers and transitions state by result.
//
// A single batch of deliveries (possibly dozens in digest mode) shares one send
// result: either delivered, or the whole batch retries. There is no per-item retry —
// a digest message is a single message, and re-sending part of it would garble the
// batch semantics.
//
// The one exception is segmentation caused by a channel's length limit: when the
// channel reports it only held the first K, items K+1 onward must be held for the
// next batch rather than marked successful alongside the rest. Otherwise the
// truncated findings vanish entirely — neither in the message nor in the failure
// list.
func (n *Notifier) send(ctx context.Context, channel notify.Channel, cfg map[string]any, msg notify.Message, deliveries []*db.NotificationDelivery) {
	// Cap each send so that a stuck channel cannot drag down the remaining channels
	// of this round.
	sendCtx, cancel := context.WithTimeout(ctx, notifySendTimeout)
	defer cancel()
	delivered, err := channel.Send(sendCtx, cfg, msg)
	if err == nil && delivered > 0 {
		if delivered > len(deliveries) {
			// The channel cannot have reported more delivered than were submitted; if
			// it really happened, the render layer miscounted. Treating it as "all
			// delivered" and recording the problem is better than corrupting records.
			log.Printf("[notify] channel reported delivered count %d exceeding delivery count %d channel=%s, treating as all delivered",
				delivered, len(deliveries), channel.Kind())
			delivered = len(deliveries)
		}
		sent, rest := deliveries[:delivered], deliveries[delivered:]
		if err := n.pg.MarkDeliveriesSent(ctx, deliveryIDs(sent)); err != nil {
			log.Printf("[notify] failed to mark delivered channel=%s ids=%v: %v", channel.Kind(), deliveryIDs(sent), err)
		}
		if len(rest) > 0 {
			// This message hit the channel's length limit: the rest go back onto the
			// queue immediately and the next tick continues sending them. Use
			// DeferDeliveries rather than RescheduleDeliveries — this is not a failure
			// and must not consume the retry budget (the claim already optimistically
			// +1'd it, and that is decremented back there).
			if err := n.pg.DeferDeliveries(ctx, deliveryIDs(rest),
				fmt.Sprintf("this message hit the channel length limit; only the first %d were delivered, the rest are held for the next batch", delivered)); err != nil {
				log.Printf("[notify] failed to requeue segmented continuation channel=%s ids=%v: %v", channel.Kind(), deliveryIDs(rest), err)
			}
		}
		return
	}
	if err == nil {
		// The channel neither reported an error nor said how many were delivered.
		// Treat it as a failure (take the back-off path) so this delivery is not
		// re-claimed forever yet never marked done.
		err = fmt.Errorf("channel did not report a delivered count (delivered=%d)", delivered)
	}

	// Failure handling is decided per item, not by the batch's maximum attempt count.
	//
	// It used to be `if maxAttempts(deliveries) >= MaxNotifyAttempts` failing the
	// whole batch, but the items in a batch do not share the same attempt count: one
	// old delivery already retried twice (attempts=2) would drag brand-new deliveries
	// in the same batch (attempts=1) into failed with it — a new finding permanently
	// lost without using a single retry, exactly the opposite of "don't let old rows
	// drag new ones under".
	permanent := notify.IsPermanent(err)
	var failIDs, exhaustedIDs []int64
	byDelay := map[time.Duration][]int64{}
	for _, dl := range deliveries {
		switch {
		case permanent:
			failIDs = append(failIDs, dl.ID)
		case dl.Attempts >= db.MaxNotifyAttempts:
			exhaustedIDs = append(exhaustedIDs, dl.ID)
		default:
			delay := notifyBackoff[min(dl.Attempts, len(notifyBackoff)-1)]
			byDelay[delay] = append(byDelay[delay], dl.ID)
		}
	}

	if len(failIDs) > 0 {
		if fErr := n.pg.FailDeliveries(ctx, failIDs, err.Error()); fErr != nil {
			log.Printf("[notify] error marking failed state channel=%s ids=%v: %v", channel.Kind(), failIDs, fErr)
		}
	}
	if len(exhaustedIDs) > 0 {
		reason := fmt.Sprintf("still failing after %d retries: %s", db.MaxNotifyAttempts, err)
		if fErr := n.pg.FailDeliveries(ctx, exhaustedIDs, reason); fErr != nil {
			log.Printf("[notify] error marking failed state channel=%s ids=%v: %v", channel.Kind(), exhaustedIDs, fErr)
		}
	}
	// Reschedule grouped by delay: there are only 3 back-off tiers, so the number of
	// groups is naturally small and there is no need to issue one UPDATE per item
	// (that would turn a 500-item batch into 500 round-trips).
	for delay, group := range byDelay {
		if rErr := n.pg.RescheduleDeliveries(ctx, group, delay, err.Error()); rErr != nil {
			log.Printf("[notify] failed to reschedule deliveries channel=%s ids=%v: %v", channel.Kind(), group, rErr)
		}
	}
	if len(failIDs)+len(exhaustedIDs) > 0 {
		log.Printf("[notify] delivery failed channel=%d kind=%s permanent=%d retries-exhausted=%d pending-retry=%d: %s",
			deliveries[0].ChannelID, channel.Kind(), len(failIDs), len(exhaustedIDs), len(byDelay), err)
	}
}

// excludeDeliveries returns the entries of all that are not in keep (compared by
// pointer identity). Used to find the deliveries that "did not make it into the
// message" — they must be handled explicitly and cannot be left in a gray area.
func excludeDeliveries(all, keep []*db.NotificationDelivery) []*db.NotificationDelivery {
	inKeep := make(map[*db.NotificationDelivery]bool, len(keep))
	for _, dl := range keep {
		inKeep[dl] = true
	}
	var out []*db.NotificationDelivery
	for _, dl := range all {
		if !inKeep[dl] {
			out = append(out, dl)
		}
	}
	return out
}

// adapt fetches a channel implementation and parses its config.
// Returning ok=false means the kind is not registered, and the delivery should be
// failed directly rather than retried forever.
func (n *Notifier) adapt(ch *db.NotificationChannel) (notify.Channel, map[string]any, bool) {
	channel, ok := notify.Get(ch.Kind)
	if !ok {
		return nil, nil, false
	}
	var cfg map[string]any
	if len(ch.Config) > 0 {
		// On a config parse failure, hand back an empty map: the channel's own Validate
		// will report "which field is missing", and that error guides the user to a fix
		// better than a JSON parse error would.
		_ = json.Unmarshal(ch.Config, &cfg)
	}
	if cfg == nil {
		cfg = map[string]any{}
	}
	return channel, cfg, true
}

// renderSingle renders a single-finding message.
func (n *Notifier) renderSingle(ctx context.Context, dl *db.NotificationDelivery, baseURL string) (notify.Message, error) {
	snap, err := parseSnapshot(dl)
	if err != nil {
		return notify.Message{}, err
	}
	item, err := n.itemFor(ctx, snap, baseURL)
	if err != nil {
		return notify.Message{}, err
	}
	return notify.Message{Items: []notify.Item{item}, HomeURL: baseURL}, nil
}

// renderBatch renders a digest message. Snapshots are parsed one by one — a single
// bad one only skips that entry, rather than dragging the whole digest down.
//
// The return value included corresponds strictly one-to-one with msg.Items (the i-th
// delivery ↔ the i-th item). This correspondence is a hard requirement: the caller
// decides which first-K deliveries to mark delivered from "the channel reported it
// held the first K". If this skips a bad snapshot but does not drop the skipped
// delivery from included, the indices shift — an entry that should have failed gets
// marked delivered, and a good entry is wrongly judged undelivered. The bad ones are
// failed explicitly by the caller, see stepDigest.
func (n *Notifier) renderBatch(ctx context.Context, deliveries []*db.NotificationDelivery, baseURL string, windowMinutes int) (notify.Message, []*db.NotificationDelivery, error) {
	items := make([]notify.Item, 0, len(deliveries))
	included := make([]*db.NotificationDelivery, 0, len(deliveries))
	for _, dl := range deliveries {
		snap, err := parseSnapshot(dl)
		if err != nil {
			// A bad snapshot enters neither the message nor included — its handling is
			// the caller's responsibility (explicitly marked failed, rather than
			// sneaking through among the "delivered").
			log.Printf("[notify] skipping unparseable snapshot in digest batch delivery=%d: %v", dl.ID, err)
			continue
		}
		item, err := n.itemFor(ctx, snap, baseURL)
		if err != nil {
			return notify.Message{}, nil, err
		}
		items = append(items, item)
		included = append(included, dl)
	}
	if len(items) == 0 {
		return notify.Message{}, nil, fmt.Errorf("all %d deliveries in the digest batch are unparseable", len(deliveries))
	}
	return notify.Message{
		Items:         items,
		Batch:         true,
		WindowMinutes: windowMinutes,
		HomeURL:       baseURL,
	}, included, nil
}

// itemFor renders an event snapshot into a push item, resolving asset names and the
// detail back-link along the way.
func (n *Notifier) itemFor(ctx context.Context, snap notify.Snapshot, baseURL string) (notify.Item, error) {
	assets, err := n.pg.NotificationAssetNames(ctx, snap.AssetIDs)
	if err != nil {
		// A failure to resolve asset names must not block the push: not reading a name
		// is far less bad than not receiving the notification — the message just loses
		// one asset line.
		log.Printf("[notify] failed to resolve asset names finding=%d: %v", snap.FindingID, err)
	}
	item := notify.Item{
		FindingID:  snap.FindingID,
		Name:       snap.Name,
		VulnClass:  snap.VulnClass,
		Severity:   snap.Severity,
		Summary:    snap.Summary,
		Assets:     assets,
		FromStatus: snap.FromStatus,
		ToStatus:   snap.ToStatus,
	}
	if baseURL != "" {
		// The detail-page route is in web/src/app/(main)/function/findings/detail/page.tsx,
		// which reads the finding id from the query parameter id.
		item.DetailURL = fmt.Sprintf("%s/function/findings/detail?id=%d", baseURL, snap.FindingID)
	}
	return item, nil
}

// takeTokens removes at most want tokens from the channel's token bucket and returns
// the number actually taken.
//
// One token = one message (one HTTP request). In realtime mode the caller passes as
// many as it wants; in digest mode a whole batch of findings is one message, so it
// passes 1.
//
// The bucket capacity is the channel's per-minute limit, refilled at a constant rate.
// ratePerMin<=0 means no rate limit, and returns a finite but large-enough value to
// keep a single round from being dragged down by an unbounded backlog.
//
// The want upper bound is necessary: without it the bucket could only be drained
// whole, yet the caller has its own per-round cap, so the extra tokens would be
// unusable and vanish before the next refill — the accumulated burst capacity would
// be forever unreachable, and even "this round has no pending deliveries" would still
// charge one.
func (n *Notifier) takeTokens(channelID int64, ratePerMin, want int, now time.Time) int {
	if want <= 0 {
		return 0
	}
	if ratePerMin <= 0 {
		return min(want, notifyUnlimitedBurstPerTick)
	}
	n.mu.Lock()
	defer n.mu.Unlock()
	b := n.buckets[channelID]
	if b == nil {
		b = &notifyBucket{tokens: float64(ratePerMin), lastFill: now}
		n.buckets[channelID] = b
	}
	// Refill by the real elapsed time, at a rate of ratePerMin/60 per second.
	if elapsed := now.Sub(b.lastFill).Seconds(); elapsed > 0 {
		b.tokens = minF(float64(ratePerMin), b.tokens+elapsed*float64(ratePerMin)/60)
		b.lastFill = now
	}
	// Add a tiny epsilon before truncating: the token count is accumulated in floating
	// point, and refilling in two halves, 0.5 + 0.5, may yield 0.9999999999, which a
	// bare int() truncates to 0 — a mathematically full bucket from which no token can
	// be taken. 1e-9 is far smaller than one token and will not let a real shortfall
	// slip through.
	take := min(int(b.tokens+1e-9), want)
	if take <= 0 {
		return 0
	}
	b.tokens -= float64(take)
	return take
}

// enabled reads the master switch.
func (n *Notifier) enabled() bool {
	return n.pg.GetBool(settingNotifyEnabled, true)
}

// publicBaseURL returns the external address used for back-links, with trailing
// slashes stripped.
func (n *Notifier) publicBaseURL() string {
	v, ok, err := n.pg.GetSetting(settingNotifyPublicBaseURL)
	if err != nil || !ok {
		return ""
	}
	return trimTrailingSlash(v)
}

// digestInterval returns the digest interval, falling back to the default when
// invalid or unconfigured.
func (n *Notifier) digestInterval() time.Duration {
	v, ok, err := n.pg.GetSetting(settingNotifyDigestMinutes)
	if err != nil || !ok {
		return time.Duration(notifyDefaultDigestMinutes) * time.Minute
	}
	m := 0
	if _, err := fmt.Sscanf(v, "%d", &m); err != nil || m <= 0 {
		return time.Duration(notifyDefaultDigestMinutes) * time.Minute
	}
	return time.Duration(m) * time.Minute
}

// parseSnapshot parses the snapshot of the event a delivery corresponds to.
func parseSnapshot(dl *db.NotificationDelivery) (notify.Snapshot, error) {
	var snap notify.Snapshot
	if len(dl.Snapshot) == 0 {
		return snap, fmt.Errorf("event snapshot for delivery %d is empty", dl.ID)
	}
	if err := json.Unmarshal(dl.Snapshot, &snap); err != nil {
		return snap, fmt.Errorf("failed to parse event snapshot for delivery %d: %w", dl.ID, err)
	}
	if snap.Kind == "" {
		// The event kind is authoritative on the event row; the copy in the snapshot
		// may have been written by an older version.
		snap.Kind = dl.EventKind
	}
	return snap, nil
}

func deliveryIDs(deliveries []*db.NotificationDelivery) []int64 {
	out := make([]int64, 0, len(deliveries))
	for _, dl := range deliveries {
		out = append(out, dl.ID)
	}
	return out
}

func trimTrailingSlash(s string) string {
	for len(s) > 0 && s[len(s)-1] == '/' {
		s = s[:len(s)-1]
	}
	return s
}

func minF(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}

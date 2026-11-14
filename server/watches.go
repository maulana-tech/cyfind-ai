package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/Autumn-27/cyfind/db"
	"github.com/Autumn-27/cyfind/notify"
	"github.com/Autumn-27/cyfind/watch"
)

// watchAlerter forwards a watch Detection to the notify pipeline, reusing the
// finding-notification fan-out with a watch-specific event kind and a
// finding_id of 0 (the item renders from the snapshot fields alone).
type watchAlerter struct{ s *Server }

func (a watchAlerter) Alert(d watch.Detection) {
	sev := "medium"
	if d.Kind == "invariant" || d.Kind == "preexec" {
		sev = "high"
	}
	name := d.Label
	if name == "" {
		name = d.RuleID
	}
	tx := ""
	if d.TxHash != "" {
		tx = " tx=" + d.TxHash
	}
	snap := notify.Snapshot{
		Kind:     "watch_" + d.Kind,
		Name:     name,
		Severity: sev,
		Summary:  fmt.Sprintf("watch %s: %s (block %d%s)", d.Kind, d.Observed, d.Block, tx),
	}
	if _, err := a.s.m.pg.AddNotificationEvent(a.s.ctx, snap.Kind, 0, snap); err != nil {
		log.Printf("[watch] alert enqueue (watch=%s): %v", d.WatchID, err)
	}
}

// dbWatchStore adapts *db.DB to watch.Store: it maps the DB's raw rows to the
// watch package's domain types and back. The db layer stays ignorant of watch.
type dbWatchStore struct{ pg *db.DB }

func (s dbWatchStore) ListActiveWatches() ([]watch.Watch, error) {
	rows, err := s.pg.ListActiveWatches()
	if err != nil {
		return nil, err
	}
	out := make([]watch.Watch, 0, len(rows))
	for _, r := range rows {
		// A malformed conditions/rules blob skips that watch rather than failing
		// the whole sync — one bad row must not silence monitoring everywhere.
		var conds []watch.Condition
		if len(r.Conditions) > 0 {
			if err := json.Unmarshal(r.Conditions, &conds); err != nil {
				log.Printf("[watch] watch %d has invalid conditions, skipped: %v", r.ID, err)
				continue
			}
		}
		var rules []watch.RuleSpec
		if len(r.Rules) > 0 {
			if err := json.Unmarshal(r.Rules, &rules); err != nil {
				log.Printf("[watch] watch %d has invalid rules, skipped: %v", r.ID, err)
				continue
			}
		}
		var plan watch.ResponsePlan
		if len(r.Response) > 0 {
			if err := json.Unmarshal(r.Response, &plan); err != nil {
				log.Printf("[watch] watch %d has invalid response plan, skipped: %v", r.ID, err)
				continue
			}
		}
		out = append(out, watch.Watch{
			ID:         strconv.FormatInt(r.ID, 10),
			Chain:      r.Chain,
			Address:    r.Address,
			RPCURL:     r.RPCURL,
			Interval:   time.Duration(r.IntervalMS) * time.Millisecond,
			Conditions: conds,
			Rules:      rules,
			Preexec:    r.Preexec,
			Response:   plan,
		})
	}
	return out, nil
}

func (s dbWatchStore) RecordDetection(d watch.Detection) error {
	wid, _ := strconv.ParseInt(d.WatchID, 10, 64)
	_, err := s.pg.RecordWatchDetection(db.WatchDetectionRow{
		WatchID:     wid,
		Kind:        d.Kind,
		ConditionID: d.RuleID,
		Invariant:   d.Label,
		Block:       int64(d.Block),
		TxHash:      d.TxHash,
		Observed:    d.Observed,
	})
	return err
}

// startWatchRegistry builds the runtime-watch registry and syncs it against the
// active watches. Observe-only (phase 1): detections are persisted + logged, and
// each watcher derives from s.ctx so they stop on server shutdown. A no-op if
// there is no DB.
func (s *Server) startWatchRegistry() {
	if s.m == nil || s.m.pg == nil {
		return
	}
	store := dbWatchStore{pg: s.m.pg}
	// Phase 5: the reader is selected by chain FAMILY. EVM ships; a non-EVM family
	// is rejected (the registry skips that watch) rather than mis-read with EVM
	// semantics. Solana/Move readers (a different state/condition model) register
	// here when added.
	factory := func(chain, rpcURL string) (watch.Reader, error) {
		switch fam := db.OnchainFamily("", chain); fam {
		case "evm":
			return watch.NewEVMReader(rpcURL, 10*time.Second), nil
		case "solana":
			// Solana account-state monitoring (invariant + delta conditions read
			// account data). Program-log event rules and pre-exec stay EVM-only.
			return watch.NewSolanaReader(rpcURL, 10*time.Second), nil
		default:
			return nil, fmt.Errorf("watch chain family %q not supported yet (EVM + Solana)", fam)
		}
	}
	s.watches = watch.NewRegistry(store, factory, log.Printf)
	// Phase 3: watches flagged preexec also get a mempool pre-exec watcher (EVM only).
	s.watches.EnablePreexec(
		func(chain, rpcURL string) (watch.PendingSource, error) {
			if fam := db.OnchainFamily("", chain); fam != "evm" {
				return nil, fmt.Errorf("pre-exec not supported for chain family %q", fam)
			}
			return watch.NewEVMPendingSource(watch.NewEVMReader(rpcURL, 10*time.Second), 3*time.Second), nil
		},
		func(_ /*chain*/, rpcURL string) watch.Simulator {
			return watch.NewPendingBlockSimulator(watch.NewEVMReader(rpcURL, 10*time.Second))
		},
	)
	// Alert bridge: forward each detection to the notify pipeline (observe-only
	// external alerting). Uses the existing finding-notification fan-out with a
	// watch-specific event kind.
	s.watches.EnableAlerts(watchAlerter{s: s})
	// Phase 4: response tiers. No approval Gate is wired (nil) → the Act tier is
	// fail-safe (blocked); Recommend works, and ManualExecutor records intended
	// actions without signing. Wiring a real Gate (operator authorization) + a
	// signing Executor is a deliberate, separate step. Response events persist.
	s.watches.EnableResponse(nil, watch.ManualExecutor{}, func(e watch.ResponseEvent) {
		wid, _ := strconv.ParseInt(e.WatchID, 10, 64)
		if _, err := s.m.pg.RecordWatchResponse(db.WatchResponseRow{
			WatchID: wid, RuleID: e.RuleID, Kind: e.Kind, Block: int64(e.Block),
			ActionID: e.ActionID, Tier: string(e.Tier), Status: e.Status,
			Note: e.Note, ActionTxHash: e.ActionTxHash,
		}); err != nil {
			log.Printf("[watch] record response (watch=%s): %v", e.WatchID, err)
		}
	})
	go func() {
		if err := s.watches.Sync(s.ctx); err != nil {
			log.Printf("[watch] initial sync: %v", err)
		}
	}()
}

// syncWatches reconciles running watchers after a watch is created/changed/removed.
func (s *Server) syncWatches() {
	if s.watches == nil {
		return
	}
	if err := s.watches.Sync(s.ctx); err != nil {
		log.Printf("[watch] sync: %v", err)
	}
}

// --- HTTP handlers (all under /api, so the global auth wrapper covers them) ---

func (s *Server) listWatches(w http.ResponseWriter, _ *http.Request) {
	rows, err := s.m.pg.ListWatches()
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, map[string]any{"watches": rows})
}

func (s *Server) createWatch(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Chain      string          `json:"chain"`
		Address    string          `json:"address"`
		RPCURL     string          `json:"rpc_url"`
		IntervalMS int64           `json:"interval_ms"`
		Conditions json.RawMessage `json:"conditions"`
		Rules      json.RawMessage `json:"rules"`
		Preexec    bool            `json:"preexec"`
		Response   json.RawMessage `json:"response"`
		TaskID     *int64          `json:"task_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeErr(w, 400, "invalid JSON: "+err.Error())
		return
	}
	if in.Address == "" || in.RPCURL == "" {
		writeErr(w, 400, "address and rpc_url are required")
		return
	}
	id, err := s.m.pg.CreateWatch(db.WatchRow{
		Chain: in.Chain, Address: in.Address, RPCURL: in.RPCURL,
		IntervalMS: in.IntervalMS, Conditions: in.Conditions, Rules: in.Rules,
		Preexec: in.Preexec, Response: in.Response, TaskID: in.TaskID,
	})
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	s.syncWatches()
	writeJSON(w, 200, map[string]any{"id": id})
}

func (s *Server) setWatchState(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeErr(w, 400, "invalid id")
		return
	}
	var in struct {
		State string `json:"state"`
	}
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeErr(w, 400, "invalid JSON: "+err.Error())
		return
	}
	if err := s.m.pg.SetWatchState(id, in.State); err != nil {
		writeErr(w, 400, err.Error())
		return
	}
	s.syncWatches()
	writeJSON(w, 200, map[string]any{"ok": true})
}

func (s *Server) deleteWatch(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeErr(w, 400, "invalid id")
		return
	}
	if err := s.m.pg.DeleteWatch(id); err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	s.syncWatches()
	writeJSON(w, 200, map[string]any{"ok": true})
}

func (s *Server) listWatchDetections(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeErr(w, 400, "invalid id")
		return
	}
	rows, err := s.m.pg.ListWatchDetections(id, atoiDefault(r.URL.Query().Get("limit"), 100))
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, map[string]any{"detections": rows})
}

func (s *Server) listWatchResponses(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeErr(w, 400, "invalid id")
		return
	}
	rows, err := s.m.pg.ListWatchResponses(id, atoiDefault(r.URL.Query().Get("limit"), 100))
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, map[string]any{"responses": rows})
}

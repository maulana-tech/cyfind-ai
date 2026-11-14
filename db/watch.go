package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
)

// WatchRow is one runtime-watch definition (see the watch/ package and the
// web3-security-audit skill ref 13). The db layer stores Conditions as raw JSON
// and stays ignorant of the watch package — the server adapter maps rows to
// watch.Watch. Observe-only (phase 1): a watch records detections, moves nothing.
type WatchRow struct {
	ID         int64           `json:"id"`
	Chain      string          `json:"chain"`
	Address    string          `json:"address"`
	RPCURL     string          `json:"rpc_url"`
	IntervalMS int64           `json:"interval_ms"`
	Conditions json.RawMessage `json:"conditions"` // JSON array of invariant conditions
	Rules      json.RawMessage `json:"rules"`      // JSON array of detector RuleSpecs
	Preexec    bool            `json:"preexec"`    // also run a mempool pre-exec watcher
	Response   json.RawMessage `json:"response"`   // JSON ResponsePlan (phase 4)
	State      string          `json:"state"`      // active|paused
	TaskID     *int64          `json:"task_id,omitempty"`
}

// WatchResponseRow is one recorded response to a detection (phase 4).
type WatchResponseRow struct {
	ID           int64  `json:"id"`
	WatchID      int64  `json:"watch_id"`
	RuleID       string `json:"rule_id"`
	Kind         string `json:"kind"`
	Block        int64  `json:"block"`
	ActionID     string `json:"action_id"`
	Tier         string `json:"tier"`
	Status       string `json:"status"`
	Note         string `json:"note"`
	ActionTxHash string `json:"action_tx_hash"`
	CreatedAt    string `json:"created_at"`
}

// WatchDetectionRow is one recorded detection (invariant violation or rule match).
type WatchDetectionRow struct {
	ID          int64  `json:"id"`
	WatchID     int64  `json:"watch_id"`
	Kind        string `json:"kind"` // invariant|event|delta
	ConditionID string `json:"condition_id"`
	Invariant   string `json:"invariant"`
	Block       int64  `json:"block"`
	TxHash      string `json:"tx_hash"`
	Observed    string `json:"observed"`
	DetectedAt  string `json:"detected_at"`
}

// CreateWatch inserts a watch and returns its id. Conditions must be a JSON array.
func (d *DB) CreateWatch(w WatchRow) (int64, error) {
	if w.Chain == "" {
		w.Chain = "ethereum"
	}
	if w.IntervalMS <= 0 {
		w.IntervalMS = 12000
	}
	if len(w.Conditions) == 0 {
		w.Conditions = json.RawMessage("[]")
	}
	if len(w.Rules) == 0 {
		w.Rules = json.RawMessage("[]")
	}
	if len(w.Response) == 0 {
		w.Response = json.RawMessage("{}")
	}
	state := w.State
	if state == "" {
		state = "active"
	}
	var id int64
	err := d.QueryRow(`
INSERT INTO watches(chain, address, rpc_url, interval_ms, conditions, rules, preexec, response, state, task_id)
VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8::jsonb,$9,$10)
RETURNING id`, w.Chain, w.Address, w.RPCURL, w.IntervalMS, string(w.Conditions), string(w.Rules), w.Preexec, string(w.Response), state, w.TaskID).Scan(&id)
	return id, err
}

func scanWatch(rows *sql.Rows) (WatchRow, error) {
	var w WatchRow
	var cond, rules, resp string
	var taskID sql.NullInt64
	if err := rows.Scan(&w.ID, &w.Chain, &w.Address, &w.RPCURL, &w.IntervalMS, &cond, &rules, &w.Preexec, &resp, &w.State, &taskID); err != nil {
		return w, err
	}
	w.Conditions = json.RawMessage(cond)
	w.Rules = json.RawMessage(rules)
	w.Response = json.RawMessage(resp)
	if taskID.Valid {
		v := taskID.Int64
		w.TaskID = &v
	}
	return w, nil
}

const watchSelectCols = `id, chain, address, rpc_url, interval_ms, conditions::text, rules::text, preexec, response::text, state, task_id`

// RecordWatchResponse persists one response event and returns its id.
func (d *DB) RecordWatchResponse(r WatchResponseRow) (int64, error) {
	var id int64
	err := d.QueryRow(`
INSERT INTO watch_responses(watch_id, rule_id, kind, block, action_id, tier, status, note, action_tx_hash)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
RETURNING id`, r.WatchID, r.RuleID, r.Kind, r.Block, r.ActionID, r.Tier, r.Status, r.Note, r.ActionTxHash).Scan(&id)
	return id, err
}

// ListWatchResponses returns a watch's response events, newest first (limit<=0 → 100).
func (d *DB) ListWatchResponses(watchID int64, limit int) ([]WatchResponseRow, error) {
	if limit <= 0 {
		limit = 100
	}
	rows, err := d.Query(`
SELECT id, watch_id, rule_id, kind, block, action_id, tier, status, note, action_tx_hash, created_at::text
FROM watch_responses WHERE watch_id=$1 ORDER BY id DESC LIMIT $2`, watchID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []WatchResponseRow{}
	for rows.Next() {
		var r WatchResponseRow
		if err := rows.Scan(&r.ID, &r.WatchID, &r.RuleID, &r.Kind, &r.Block, &r.ActionID, &r.Tier, &r.Status, &r.Note, &r.ActionTxHash, &r.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, rows.Err()
}

// ListWatches returns all watches, newest first.
func (d *DB) ListWatches() ([]WatchRow, error) {
	rows, err := d.Query(`SELECT ` + watchSelectCols + ` FROM watches ORDER BY id DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return collectWatches(rows)
}

// ListActiveWatches returns only the watches the registry should run.
func (d *DB) ListActiveWatches() ([]WatchRow, error) {
	rows, err := d.Query(`SELECT ` + watchSelectCols + ` FROM watches WHERE state='active' ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return collectWatches(rows)
}

func collectWatches(rows *sql.Rows) ([]WatchRow, error) {
	out := []WatchRow{}
	for rows.Next() {
		w, err := scanWatch(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, w)
	}
	return out, rows.Err()
}

// GetWatch returns one watch or (nil, nil) if absent.
func (d *DB) GetWatch(id int64) (*WatchRow, error) {
	rows, err := d.Query(`SELECT `+watchSelectCols+` FROM watches WHERE id=$1`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	if !rows.Next() {
		return nil, rows.Err()
	}
	w, err := scanWatch(rows)
	if err != nil {
		return nil, err
	}
	return &w, nil
}

// SetWatchState flips a watch between 'active' and 'paused'.
func (d *DB) SetWatchState(id int64, state string) error {
	if state != "active" && state != "paused" {
		return fmt.Errorf("invalid watch state %q", state)
	}
	_, err := d.Exec(`UPDATE watches SET state=$2 WHERE id=$1`, id, state)
	return err
}

// DeleteWatch removes a watch (and its detections via ON DELETE CASCADE).
func (d *DB) DeleteWatch(id int64) error {
	_, err := d.Exec(`DELETE FROM watches WHERE id=$1`, id)
	return err
}

// RecordWatchDetection persists one violation and returns its id.
func (d *DB) RecordWatchDetection(r WatchDetectionRow) (int64, error) {
	if r.Kind == "" {
		r.Kind = "invariant"
	}
	var id int64
	err := d.QueryRow(`
INSERT INTO watch_detections(watch_id, kind, condition_id, invariant, block, tx_hash, observed)
VALUES ($1,$2,$3,$4,$5,$6,$7)
RETURNING id`, r.WatchID, r.Kind, r.ConditionID, r.Invariant, r.Block, r.TxHash, r.Observed).Scan(&id)
	return id, err
}

// ListWatchDetections returns a watch's detections, newest first (limit<=0 → 100).
func (d *DB) ListWatchDetections(watchID int64, limit int) ([]WatchDetectionRow, error) {
	if limit <= 0 {
		limit = 100
	}
	rows, err := d.Query(`
SELECT id, watch_id, kind, condition_id, invariant, block, tx_hash, observed, detected_at::text
FROM watch_detections WHERE watch_id=$1 ORDER BY id DESC LIMIT $2`, watchID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []WatchDetectionRow{}
	for rows.Next() {
		var r WatchDetectionRow
		if err := rows.Scan(&r.ID, &r.WatchID, &r.Kind, &r.ConditionID, &r.Invariant, &r.Block, &r.TxHash, &r.Observed, &r.DetectedAt); err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, rows.Err()
}

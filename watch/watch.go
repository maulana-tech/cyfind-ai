// Package watch is the engine core for CYFIND's runtime-watch mode (observe-only,
// phase 1): continuously checking that a deployed contract's invariants still
// hold on-chain, and emitting a Detection when one is violated. It is the live
// counterpart to the point-in-time audit — see
// .claude/skills/web3-security-audit/references/13-runtime-watch-mode.md.
//
// Phase 1 scope: EVM, observe-only (no on-chain response), deterministic checks
// evaluated per block via a minimal JSON-RPC reader (watch's sanctioned "chain
// source adapter" — distinct from the audit's CLI-driven reads because a watch
// is high-frequency and deterministic, not an LLM call per block). This package
// is self-contained: it is NOT yet wired into the server Manager / DB / routes;
// Detections are delivered to a Sink the host implements (the SSE broadcaster +
// notify layer, later). Response tiers (Recommend/Act) are explicitly out of
// phase 1.
package watch

import (
	"context"
	"fmt"
	"math/big"
	"strings"
	"time"
)

// Reader reads EVM state. Implemented by EVMReader (JSON-RPC) and by fakes in
// tests, so condition evaluation is testable without a network.
type Reader interface {
	// BlockNumber returns the latest block height.
	BlockNumber(ctx context.Context) (uint64, error)
	// Call performs an eth_call to `to` with ABI-encoded `data` at `block`
	// ("latest" or a 0x-hex height) and returns the raw 0x-hex result.
	Call(ctx context.Context, to, data, block string) (string, error)
	// GetLogs returns the event logs matching the filter (eth_getLogs).
	GetLogs(ctx context.Context, f LogFilter) ([]Log, error)
}

// Call is one eth_call: ABI-encoded calldata against a contract, whose result is
// decoded as a single uint256 (or, when used as a bool condition, 0/1).
type Call struct {
	To   string `json:"to"`   // contract address; defaults to the Watch address when empty
	Data string `json:"data"` // 0x-prefixed ABI-encoded calldata (selector + args)
}

// Condition is one invariant to keep checking. Two shapes in phase 1:
//   - comparison: Left <Cmp> Right must hold (both decoded as uint256),
//   - boolean:    Right nil → Left must decode to a non-zero (true) value.
type Condition struct {
	ID        string `json:"id"`
	Invariant string `json:"invariant"` // human statement, e.g. "totalAssets() >= totalSupply()"
	Left      Call   `json:"left"`
	Right     *Call  `json:"right,omitempty"`
	Cmp       string `json:"cmp,omitempty"` // ">=","==",">","<=","<","!=" (ignored when Right is nil)
}

// Watch binds a set of invariant conditions AND detector rules to a deployed
// target and a polling interval. RPCURL is the chain source the watch loop reads
// from (the sanctioned per-watch chain-source adapter endpoint).
type Watch struct {
	ID         string        `json:"id"`
	Chain      string        `json:"chain"`
	Address    string        `json:"address"`
	RPCURL     string        `json:"rpc_url"`
	Interval   time.Duration `json:"interval"`
	Conditions []Condition   `json:"conditions"` // invariant checks (eth_call comparisons)
	Rules      []RuleSpec    `json:"rules"`      // detector rules (events / state deltas)
	Preexec    bool          `json:"preexec"`    // also run a mempool pre-exec watcher (phase 3)
	Response   ResponsePlan  `json:"response"`   // response tier + pre-authorized actions (phase 4)
}

// Detection is something observed on-chain that warrants an alert: an invariant
// violated, or a detector rule matched. It carries the evidence a finding/alert
// needs (block height, the observed values, and — for event rules — a tx hash).
type Detection struct {
	WatchID  string    `json:"watch_id"`
	Kind     string    `json:"kind"`    // "invariant" | "event" | "delta"
	RuleID   string    `json:"rule_id"` // the condition/rule id
	Label    string    `json:"label"`   // the invariant statement or rule description
	Block    uint64    `json:"block"`
	TxHash   string    `json:"tx_hash,omitempty"` // event-based detections
	Observed string    `json:"observed"`          // e.g. "left=100 right=120 (>=)"
	At       time.Time `json:"at"`
}

// Log is one EVM event log (eth_getLogs result).
type Log struct {
	Address     string   `json:"address"`
	Topics      []string `json:"topics"`
	Data        string   `json:"data"`
	BlockNumber uint64   `json:"blockNumber"`
	TxHash      string   `json:"transactionHash"`
}

// LogFilter is an eth_getLogs filter. Blocks are "latest" or 0x-hex heights.
type LogFilter struct {
	Address   string
	Topics    []string
	FromBlock string
	ToBlock   string
}

// Sink receives Detections. The host wires this to the SSE broadcaster + notify
// layer; tests use a capturing implementation.
type Sink interface {
	Emit(Detection)
}

// Alerter delivers a detection to an external alert channel (the notify pipeline:
// DingTalk/email/webhook/…). Optional; nil = no external alerts. Fire-and-forget:
// an alert failure must never disturb the watch loop.
type Alerter interface {
	Alert(Detection)
}

// evaluate checks one condition against the reader at the given block. It returns
// held=true when the invariant still holds, and an `observed` string describing
// what was read either way. An RPC/decoding error is returned (held is false and
// must be ignored by the caller — a read failure is "inconclusive", not a
// violation, mirroring the retester's rule).
func (c Condition) evaluate(ctx context.Context, r Reader, addr, block string) (held bool, observed string, err error) {
	to := c.Left.To
	if to == "" {
		to = addr
	}
	leftHex, err := r.Call(ctx, to, c.Left.Data, block)
	if err != nil {
		return false, "", fmt.Errorf("left call: %w", err)
	}
	left, err := hexToUint256(leftHex)
	if err != nil {
		return false, "", fmt.Errorf("decode left: %w", err)
	}

	// Boolean condition: Left must be non-zero (true).
	if c.Right == nil {
		held = left.Sign() != 0
		return held, fmt.Sprintf("value=%s (expect nonzero)", left.String()), nil
	}

	rto := c.Right.To
	if rto == "" {
		rto = addr
	}
	rightHex, err := r.Call(ctx, rto, c.Right.Data, block)
	if err != nil {
		return false, "", fmt.Errorf("right call: %w", err)
	}
	right, err := hexToUint256(rightHex)
	if err != nil {
		return false, "", fmt.Errorf("decode right: %w", err)
	}

	held = compareUint(left, right, c.Cmp)
	observed = fmt.Sprintf("left=%s right=%s (%s)", left.String(), right.String(), c.Cmp)
	return held, observed, nil
}

// compareUint reports whether left <cmp> right holds. An unknown operator yields
// false (treated as "does not hold").
func compareUint(left, right *big.Int, cmp string) bool {
	switch strings.TrimSpace(cmp) {
	case ">=":
		return left.Cmp(right) >= 0
	case ">":
		return left.Cmp(right) > 0
	case "<=":
		return left.Cmp(right) <= 0
	case "<":
		return left.Cmp(right) < 0
	case "==":
		return left.Cmp(right) == 0
	case "!=":
		return left.Cmp(right) != 0
	default:
		return false
	}
}

// hexToUint256 parses a 0x-hex eth_call result into a big.Int. An empty result
// ("0x") decodes to 0.
func hexToUint256(h string) (*big.Int, error) {
	s := strings.TrimSpace(h)
	s = strings.TrimPrefix(s, "0x")
	s = strings.TrimPrefix(s, "0X")
	if s == "" {
		return big.NewInt(0), nil
	}
	n, ok := new(big.Int).SetString(s, 16)
	if !ok {
		return nil, fmt.Errorf("invalid hex quantity %q", h)
	}
	return n, nil
}

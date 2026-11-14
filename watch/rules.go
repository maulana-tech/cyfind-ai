package watch

import (
	"context"
	"fmt"
	"math/big"
	"strings"
)

// RuleSpec is a detector rule's configuration (stored as JSON on a Watch). Two
// types in phase 2:
//   - "event": fire when a matching event log appears (optionally only above a
//     uint256 threshold on one of its data words) — ownership/upgrade/pause
//     events, large transfers, etc.
//   - "delta": fire when a read value moves more than MaxBps basis points between
//     consecutive polls — oracle deviation, supply/price jumps.
//
// A rule's result is recorded exactly like an invariant violation: a Detection.
type RuleSpec struct {
	ID   string `json:"id"`
	Type string `json:"type"` // "event" | "delta"
	Desc string `json:"desc"` // human description (→ Detection.Label)

	// event
	Topic0    string `json:"topic0,omitempty"`     // 0x keccak event signature; empty = any event
	Address   string `json:"address,omitempty"`    // defaults to the watch address
	MinValue  string `json:"min_value,omitempty"`  // optional uint256 (hex or decimal) threshold on a data word
	WordIndex int    `json:"word_index,omitempty"` // which 32-byte data word MinValue applies to (default 0)

	// delta
	Call   Call  `json:"call,omitempty"`    // the value to read each poll
	MaxBps int64 `json:"max_bps,omitempty"` // max allowed change between polls, in basis points (10000 = 100%)
}

// evaluateEvent checks for matching logs in [from,to] and returns a Detection per
// match (subject to the optional MinValue threshold).
func evaluateEvent(ctx context.Context, r Reader, watchID, addr string, spec RuleSpec, from, to uint64) ([]Detection, error) {
	address := spec.Address
	if address == "" {
		address = addr
	}
	var topics []string
	if t := strings.TrimSpace(spec.Topic0); t != "" {
		topics = []string{t}
	}
	logs, err := r.GetLogs(ctx, LogFilter{
		Address:   address,
		Topics:    topics,
		FromBlock: toHexBlock(from),
		ToBlock:   toHexBlock(to),
	})
	if err != nil {
		return nil, err
	}

	var min *big.Int
	if v := strings.TrimSpace(spec.MinValue); v != "" {
		min, err = parseUintFlexible(v)
		if err != nil {
			return nil, fmt.Errorf("min_value: %w", err)
		}
	}

	var out []Detection
	for _, lg := range logs {
		observed := "event " + firstNonEmptyStr(spec.Topic0, "(any)")
		if min != nil {
			word, derr := dataWord(lg.Data, spec.WordIndex)
			if derr != nil {
				continue // can't read the threshold word → not a confident match
			}
			if word.Cmp(min) < 0 {
				continue // below threshold
			}
			observed = fmt.Sprintf("event %s value=%s (>= %s)", firstNonEmptyStr(spec.Topic0, "(any)"), word.String(), min.String())
		}
		out = append(out, Detection{
			WatchID:  watchID,
			Kind:     "event",
			RuleID:   spec.ID,
			Label:    firstNonEmptyStr(spec.Desc, spec.Topic0),
			Block:    lg.BlockNumber,
			TxHash:   lg.TxHash,
			Observed: observed,
		})
	}
	return out, nil
}

// evaluateDelta reads the current value and compares it to the previous poll's
// reading (kept in last[spec.ID]). The first reading only establishes a baseline.
func evaluateDelta(ctx context.Context, r Reader, watchID, addr string, spec RuleSpec, last map[string]*big.Int, block uint64) ([]Detection, error) {
	to := spec.Call.To
	if to == "" {
		to = addr
	}
	hex, err := r.Call(ctx, to, spec.Call.Data, "latest")
	if err != nil {
		return nil, err
	}
	cur, err := hexToUint256(hex)
	if err != nil {
		return nil, err
	}
	prev := last[spec.ID]
	last[spec.ID] = cur
	if prev == nil {
		return nil, nil // baseline only
	}

	exceeded, bps := bpsChangeExceeds(prev, cur, spec.MaxBps)
	if !exceeded {
		return nil, nil
	}
	return []Detection{{
		WatchID:  watchID,
		Kind:     "delta",
		RuleID:   spec.ID,
		Label:    firstNonEmptyStr(spec.Desc, "value deviation"),
		Block:    block,
		Observed: fmt.Sprintf("prev=%s cur=%s change=%s bps (max %d)", prev.String(), cur.String(), bps, spec.MaxBps),
	}}, nil
}

// bpsChangeExceeds reports whether |cur-prev|/prev in basis points exceeds max,
// and returns the change in bps as a string ("inf" when prev is 0 and cur isn't).
func bpsChangeExceeds(prev, cur *big.Int, maxBps int64) (bool, string) {
	diff := new(big.Int).Sub(cur, prev)
	diff.Abs(diff)
	if prev.Sign() == 0 {
		if cur.Sign() == 0 {
			return false, "0"
		}
		return true, "inf" // any move off zero is an unbounded change
	}
	bps := new(big.Int).Mul(diff, big.NewInt(10000))
	bps.Quo(bps, new(big.Int).Abs(prev))
	return bps.Cmp(big.NewInt(maxBps)) > 0, bps.String()
}

// dataWord extracts the i-th 32-byte word from 0x-hex event data as a big.Int.
func dataWord(data string, i int) (*big.Int, error) {
	s := strings.TrimPrefix(strings.TrimPrefix(strings.TrimSpace(data), "0x"), "0X")
	start, end := i*64, (i+1)*64
	if i < 0 || end > len(s) {
		return nil, fmt.Errorf("data word %d out of range (len=%d)", i, len(s))
	}
	return hexToUint256(s[start:end])
}

// parseUintFlexible parses a uint256 given as 0x-hex or decimal.
func parseUintFlexible(s string) (*big.Int, error) {
	s = strings.TrimSpace(s)
	if strings.HasPrefix(s, "0x") || strings.HasPrefix(s, "0X") {
		return hexToUint256(s)
	}
	n, ok := new(big.Int).SetString(s, 10)
	if !ok {
		return nil, fmt.Errorf("invalid number %q", s)
	}
	return n, nil
}

// toHexBlock renders a block height as the 0x-hex string eth_getLogs expects.
func toHexBlock(n uint64) string { return fmt.Sprintf("0x%x", n) }

// firstNonEmptyStr returns the first non-blank value, or "".
func firstNonEmptyStr(vs ...string) string {
	for _, v := range vs {
		if s := strings.TrimSpace(v); s != "" {
			return s
		}
	}
	return ""
}

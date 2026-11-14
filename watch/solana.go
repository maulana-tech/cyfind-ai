package watch

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// SolanaReader is a watch Reader for a Solana JSON-RPC endpoint. Solana has no
// eth_call / eth_getLogs, so it satisfies the (EVM-shaped) Reader interface with
// Solana-native semantics, chosen so the shared invariant/delta evaluators work
// unchanged:
//
//   - BlockNumber -> getSlot (the current confirmed slot height).
//   - Call        -> getAccountInfo, decoding a little-endian unsigned integer
//     from the account's data at a byte window. For Solana the
//     operand's `to` is the account's base58 pubkey, and `data`
//     is NOT an ABI call: it encodes the window as "0x" + 8 hex
//     (uint32 offset, big-endian) + 8 hex (uint32 length). The
//     decoded value is returned as a 0x-hex big-endian integer,
//     exactly the shape Condition.evaluate / evaluateDelta expect,
//     so account-field invariants and deltas just work.
//   - GetLogs     -> unsupported. Solana program logs are not a topic-indexed
//     eth_getLogs feed; monitoring them needs a different model
//     (a later slice). Returning an error makes an event rule go
//     "inconclusive" (logged, skipped) rather than silently miss.
//
// This is the first non-EVM reader: it enables Solana account-state monitoring
// (invariant + delta) today; program-log events and pre-exec remain EVM-only.
type SolanaReader struct {
	url  string
	http *http.Client
}

// NewSolanaReader builds a reader for a Solana RPC endpoint. A zero timeout
// defaults to 10s.
func NewSolanaReader(url string, timeout time.Duration) *SolanaReader {
	if timeout <= 0 {
		timeout = 10 * time.Second
	}
	return &SolanaReader{url: url, http: &http.Client{Timeout: timeout}}
}

// do issues a JSON-RPC 2.0 call, reusing the shared request/response plumbing.
func (r *SolanaReader) do(ctx context.Context, method string, params ...any) (json.RawMessage, error) {
	body, err := buildRPCBody(method, params...)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, r.url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := r.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close() //nolint:errcheck
	buf := new(bytes.Buffer)
	if _, err := buf.ReadFrom(resp.Body); err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("rpc http %d: %s", resp.StatusCode, strings.TrimSpace(buf.String()))
	}
	return parseRPCResult(buf.Bytes())
}

// BlockNumber implements Reader via getSlot.
func (r *SolanaReader) BlockNumber(ctx context.Context) (uint64, error) {
	res, err := r.do(ctx, "getSlot")
	if err != nil {
		return 0, err
	}
	var slot uint64
	if err := json.Unmarshal(res, &slot); err != nil {
		return 0, fmt.Errorf("decode getSlot: %w", err)
	}
	return slot, nil
}

// Call implements Reader via getAccountInfo. See the SolanaReader doc for the
// Solana meaning of `to` (account pubkey) and `data` (byte-window spec). `block`
// is ignored (reads use "confirmed" commitment).
func (r *SolanaReader) Call(ctx context.Context, to, data, _ string) (string, error) {
	offset, length, err := parseSolanaWindow(data)
	if err != nil {
		return "", err
	}
	res, err := r.do(ctx, "getAccountInfo", to, map[string]any{"encoding": "base64", "commitment": "confirmed"})
	if err != nil {
		return "", err
	}
	var acc struct {
		Value *struct {
			Data []json.RawMessage `json:"data"`
		} `json:"value"`
	}
	if err := json.Unmarshal(res, &acc); err != nil {
		return "", fmt.Errorf("decode getAccountInfo: %w", err)
	}
	if acc.Value == nil {
		return "", fmt.Errorf("account %s not found", to)
	}
	if len(acc.Value.Data) == 0 {
		return "", fmt.Errorf("account %s has no data", to)
	}
	var b64 string
	if err := json.Unmarshal(acc.Value.Data[0], &b64); err != nil {
		return "", fmt.Errorf("decode account data field: %w", err)
	}
	raw, err := base64.StdEncoding.DecodeString(b64)
	if err != nil {
		return "", fmt.Errorf("base64 account data: %w", err)
	}
	if offset+length > len(raw) {
		return "", fmt.Errorf("window [%d:%d] out of range (account data is %d bytes)", offset, offset+length, len(raw))
	}
	return "0x" + leBytesToBig(raw[offset:offset+length]).Text(16), nil
}

// GetLogs implements Reader. Unsupported for Solana (see the SolanaReader doc).
func (r *SolanaReader) GetLogs(_ context.Context, _ LogFilter) ([]Log, error) {
	return nil, fmt.Errorf("solana reader: event-log rules unsupported; use invariant/delta conditions on account data")
}

// parseSolanaWindow parses the Solana `data` spec: "0x" + 8 hex (uint32 offset,
// big-endian) + 8 hex (uint32 length). Length is bounded to 1..32 bytes (a
// uint256 fits in 32). Split out for unit tests.
func parseSolanaWindow(data string) (offset, length int, err error) {
	h := strings.TrimPrefix(strings.TrimSpace(data), "0x")
	if len(h) != 16 {
		return 0, 0, fmt.Errorf("solana call data must encode offset(4B)+length(4B) as 16 hex chars, got %d", len(h))
	}
	o, err := strconv.ParseUint(h[:8], 16, 32)
	if err != nil {
		return 0, 0, fmt.Errorf("offset: %w", err)
	}
	l, err := strconv.ParseUint(h[8:], 16, 32)
	if err != nil {
		return 0, 0, fmt.Errorf("length: %w", err)
	}
	if l == 0 || l > 32 {
		return 0, 0, fmt.Errorf("length must be 1..32 bytes, got %d", l)
	}
	return int(o), int(l), nil
}

// leBytesToBig reads a little-endian unsigned integer (Solana/Borsh layout) into
// a big.Int.
func leBytesToBig(b []byte) *big.Int {
	be := make([]byte, len(b))
	for i := range b {
		be[len(b)-1-i] = b[i]
	}
	return new(big.Int).SetBytes(be)
}

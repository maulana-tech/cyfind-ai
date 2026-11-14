package watch

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// EVMReader is a minimal EVM JSON-RPC reader over HTTP — just the two calls the
// observe-only watch needs (eth_blockNumber, eth_call). It is deliberately tiny:
// CYFIND stays chain-client-free for auditing (reads go through cast/forge in a
// worker), but a per-block watch loop cannot shell out efficiently, so this is
// the one sanctioned chain-source adapter (ref 13 §5). Read-only by construction.
type EVMReader struct {
	url  string
	http *http.Client
}

// NewEVMReader builds a reader for an RPC endpoint. A zero timeout defaults to 10s.
func NewEVMReader(url string, timeout time.Duration) *EVMReader {
	if timeout <= 0 {
		timeout = 10 * time.Second
	}
	return &EVMReader{url: url, http: &http.Client{Timeout: timeout}}
}

type rpcRequest struct {
	JSONRPC string `json:"jsonrpc"`
	ID      int    `json:"id"`
	Method  string `json:"method"`
	Params  []any  `json:"params"`
}

type rpcResponse struct {
	Result json.RawMessage `json:"result"`
	Error  *rpcError       `json:"error"`
}

type rpcError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func (e *rpcError) String() string { return fmt.Sprintf("rpc error %d: %s", e.Code, e.Message) }

// buildRPCBody marshals a JSON-RPC request. Split out so it is unit-testable
// without a network.
func buildRPCBody(method string, params ...any) ([]byte, error) {
	if params == nil {
		params = []any{}
	}
	return json.Marshal(rpcRequest{JSONRPC: "2.0", ID: 1, Method: method, Params: params})
}

// parseRPCResult extracts the result (or surfaces the rpc error) from a response
// body. Split out for unit tests.
func parseRPCResult(body []byte) (json.RawMessage, error) {
	var resp rpcResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("decode rpc response: %w", err)
	}
	if resp.Error != nil {
		return nil, fmt.Errorf("%s", resp.Error.String())
	}
	return resp.Result, nil
}

func (r *EVMReader) do(ctx context.Context, method string, params ...any) (json.RawMessage, error) {
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

// BlockNumber implements Reader.
func (r *EVMReader) BlockNumber(ctx context.Context) (uint64, error) {
	res, err := r.do(ctx, "eth_blockNumber")
	if err != nil {
		return 0, err
	}
	var hex string
	if err := json.Unmarshal(res, &hex); err != nil {
		return 0, fmt.Errorf("decode blockNumber: %w", err)
	}
	n, err := hexToUint256(hex)
	if err != nil {
		return 0, err
	}
	return n.Uint64(), nil
}

// GetLogs implements Reader (eth_getLogs).
func (r *EVMReader) GetLogs(ctx context.Context, f LogFilter) ([]Log, error) {
	filter := map[string]any{}
	if f.Address != "" {
		filter["address"] = f.Address
	}
	if len(f.Topics) > 0 {
		filter["topics"] = f.Topics
	}
	if f.FromBlock != "" {
		filter["fromBlock"] = f.FromBlock
	}
	if f.ToBlock != "" {
		filter["toBlock"] = f.ToBlock
	}
	res, err := r.do(ctx, "eth_getLogs", filter)
	if err != nil {
		return nil, err
	}
	return parseLogs(res)
}

// parseLogs decodes an eth_getLogs result array. Split out for unit tests.
func parseLogs(res json.RawMessage) ([]Log, error) {
	var raw []struct {
		Address     string   `json:"address"`
		Topics      []string `json:"topics"`
		Data        string   `json:"data"`
		BlockNumber string   `json:"blockNumber"`
		TxHash      string   `json:"transactionHash"`
	}
	if err := json.Unmarshal(res, &raw); err != nil {
		return nil, fmt.Errorf("decode logs: %w", err)
	}
	out := make([]Log, 0, len(raw))
	for _, l := range raw {
		bn, err := hexToUint256(l.BlockNumber)
		if err != nil {
			return nil, fmt.Errorf("decode log blockNumber: %w", err)
		}
		out = append(out, Log{Address: l.Address, Topics: l.Topics, Data: l.Data, BlockNumber: bn.Uint64(), TxHash: l.TxHash})
	}
	return out, nil
}

// Call implements Reader (eth_call). block is "latest" or a 0x-hex height.
func (r *EVMReader) Call(ctx context.Context, to, data, block string) (string, error) {
	if strings.TrimSpace(block) == "" {
		block = "latest"
	}
	res, err := r.do(ctx, "eth_call", map[string]string{"to": to, "data": data}, block)
	if err != nil {
		return "", err
	}
	var hex string
	if err := json.Unmarshal(res, &hex); err != nil {
		return "", fmt.Errorf("decode eth_call result: %w", err)
	}
	return hex, nil
}

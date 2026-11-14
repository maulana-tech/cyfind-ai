package watch

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

// solanaStub spins a fake Solana JSON-RPC server that routes by method and
// returns the canned result for each. It lets the reader be exercised with no
// network.
func solanaStub(t *testing.T, results map[string]any) *SolanaReader {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Method string `json:"method"`
		}
		_ = json.NewDecoder(r.Body).Decode(&req)
		res, ok := results[req.Method]
		if !ok {
			http.Error(w, "unexpected method "+req.Method, http.StatusBadRequest)
			return
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"jsonrpc": "2.0", "id": 1, "result": res})
	}))
	t.Cleanup(srv.Close)
	return NewSolanaReader(srv.URL, 2*time.Second)
}

// acctData builds a getAccountInfo result whose base64 data holds the given raw
// bytes (the on-chain account layout).
func acctData(raw []byte) any {
	return map[string]any{
		"context": map[string]any{"slot": 1},
		"value": map[string]any{
			"data":       []any{base64.StdEncoding.EncodeToString(raw), "base64"},
			"lamports":   1,
			"owner":      "11111111111111111111111111111111",
			"executable": false,
			"rentEpoch":  0,
		},
	}
}

func TestSolanaBlockNumber(t *testing.T) {
	r := solanaStub(t, map[string]any{"getSlot": 309876543})
	n, err := r.BlockNumber(context.Background())
	if err != nil {
		t.Fatalf("BlockNumber: %v", err)
	}
	if n != 309876543 {
		t.Fatalf("slot = %d, want 309876543", n)
	}
}

func TestSolanaCallDecodesLittleEndianWindow(t *testing.T) {
	// Account data: a u64 = 42 (little-endian) at offset 8, preceded by 8 filler
	// bytes. Reading the window [8:16] must yield 0x2a.
	raw := []byte{0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, // filler at [0:8]
		0x2a, 0, 0, 0, 0, 0, 0, 0} // u64 42 LE at [8:16]
	r := solanaStub(t, map[string]any{"getAccountInfo": acctData(raw)})

	// data = offset 8 (0x00000008), length 8 (0x00000008)
	got, err := r.Call(context.Background(), "SomePubkey111", "0x0000000800000008", "latest")
	if err != nil {
		t.Fatalf("Call: %v", err)
	}
	if got != "0x2a" {
		t.Fatalf("Call = %q, want 0x2a", got)
	}
}

func TestSolanaCallLargeValue(t *testing.T) {
	// 16-byte little-endian value 0x0100000000000000000000000000000f at offset 0.
	raw := []byte{0x0f, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x01}
	r := solanaStub(t, map[string]any{"getAccountInfo": acctData(raw)})
	got, err := r.Call(context.Background(), "Acct", "0x0000000000000010", "latest") // offset 0, len 16
	if err != nil {
		t.Fatalf("Call: %v", err)
	}
	want := "0x100000000000000000000000000000f"
	if got != want {
		t.Fatalf("Call = %q, want %q", got, want)
	}
}

func TestSolanaCallAccountNotFound(t *testing.T) {
	r := solanaStub(t, map[string]any{
		"getAccountInfo": map[string]any{"context": map[string]any{"slot": 1}, "value": nil},
	})
	if _, err := r.Call(context.Background(), "Missing", "0x0000000000000008", "latest"); err == nil {
		t.Fatal("expected error for missing account, got nil")
	}
}

func TestSolanaCallWindowOutOfRange(t *testing.T) {
	r := solanaStub(t, map[string]any{"getAccountInfo": acctData([]byte{1, 2, 3, 4})})
	// window [0:8] exceeds the 4-byte account data.
	if _, err := r.Call(context.Background(), "Acct", "0x0000000000000008", "latest"); err == nil {
		t.Fatal("expected out-of-range error, got nil")
	}
}

func TestSolanaGetLogsUnsupported(t *testing.T) {
	r := NewSolanaReader("http://127.0.0.1:1", time.Second)
	if _, err := r.GetLogs(context.Background(), LogFilter{}); err == nil {
		t.Fatal("expected GetLogs to be unsupported for Solana")
	}
}

func TestParseSolanaWindow(t *testing.T) {
	cases := []struct {
		data             string
		wantOff, wantLen int
		wantErr          bool
	}{
		{"0x0000000000000008", 0, 8, false},
		{"0x0000004000000008", 64, 8, false},    // offset 0x40
		{"00000000" + "00000020", 0, 32, false}, // no 0x prefix, length 32 (max)
		{"0x00000000", 0, 0, true},              // too short
		{"0x0000000000000000", 0, 0, true},      // length 0
		{"0x0000000000000021", 0, 0, true},      // length 33 > 32
		{"0xzzzzzzzz00000008", 0, 0, true},      // bad hex
	}
	for _, c := range cases {
		off, ln, err := parseSolanaWindow(c.data)
		if c.wantErr {
			if err == nil {
				t.Errorf("parseSolanaWindow(%q): expected error", c.data)
			}
			continue
		}
		if err != nil {
			t.Errorf("parseSolanaWindow(%q): %v", c.data, err)
			continue
		}
		if off != c.wantOff || ln != c.wantLen {
			t.Errorf("parseSolanaWindow(%q) = (%d,%d), want (%d,%d)", c.data, off, ln, c.wantOff, c.wantLen)
		}
	}
}

// TestSolanaReaderSatisfiesInterface is a compile-time check that SolanaReader
// is a watch.Reader.
func TestSolanaReaderSatisfiesInterface(_ *testing.T) {
	var _ Reader = (*SolanaReader)(nil)
}

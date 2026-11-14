package agent

import "testing"

// toUpsertReq is pure (no DB): it resolves family, computes the dedup key, and
// packs kind-specific detail into Extra. These tests run without PostgreSQL.

func TestToUpsertReqKeyDerivation(t *testing.T) {
	cases := []struct {
		name    string
		item    onchainInputItem
		wantFam string
		wantKey string
	}{
		{"evm contract top-level", onchainInputItem{Type: "contract", Address: "0xA"}, "evm", ""},
		{"evm function from selector", onchainInputItem{Type: "function", Address: "0xA", Selector: "0xa9059cbb", Name: "transfer"}, "evm", "0xa9059cbb"},
		{"evm function from name", onchainInputItem{Type: "function", Address: "0xA", Name: "transfer"}, "evm", "transfer"},
		{"evm external_dep from target", onchainInputItem{Type: "external_dep", Address: "0xA", Target: "0xBEEF"}, "evm", "0xbeef"},
		{"solana instruction (chain-inferred)", onchainInputItem{Chain: "solana", Type: "instruction", Address: "prog", Discriminator: "d1"}, "solana", "d1"},
		{"solana pda from seeds", onchainInputItem{Family: "solana", Type: "pda", Address: "prog", Seeds: "user+vault"}, "solana", "user+vault"},
		{"move resource (chain=sui)", onchainInputItem{Chain: "sui", Type: "resource", Address: "0x1::m", Name: "Coin"}, "move", "Coin"},
		{"explicit key overrides", onchainInputItem{Type: "function", Address: "0xA", Selector: "0xaa", Key: "override"}, "evm", "override"},
	}
	for _, c := range cases {
		req, err := c.item.toUpsertReq(0)
		if err != nil {
			t.Errorf("%s: unexpected error %v", c.name, err)
			continue
		}
		if req.Family != c.wantFam {
			t.Errorf("%s: family = %q, want %q", c.name, req.Family, c.wantFam)
		}
		if req.Key != c.wantKey {
			t.Errorf("%s: key = %q, want %q", c.name, req.Key, c.wantKey)
		}
	}
}

func TestToUpsertReqExtraPacking(t *testing.T) {
	// evm function packs signature/selector/visibility/modifiers
	req, err := onchainInputItem{
		Type: "function", Address: "0xA", Name: "transfer",
		Signature: "transfer(address,uint256)", Selector: "0xa9059cbb",
		Visibility: "external", Modifiers: []string{"onlyOwner"},
	}.toUpsertReq(0)
	if err != nil {
		t.Fatal(err)
	}
	if req.Extra["signature"] != "transfer(address,uint256)" || req.Extra["selector"] != "0xa9059cbb" || req.Extra["visibility"] != "external" {
		t.Errorf("evm function extra not packed: %#v", req.Extra)
	}
	if mods, ok := req.Extra["modifiers"].([]string); !ok || len(mods) != 1 || mods[0] != "onlyOwner" {
		t.Errorf("modifiers not packed: %#v", req.Extra["modifiers"])
	}

	// move resource packs abilities
	rreq, err := onchainInputItem{Chain: "aptos", Type: "resource", Address: "0x1::m", Name: "Coin", Abilities: []string{"key", "store"}}.toUpsertReq(0)
	if err != nil {
		t.Fatal(err)
	}
	if ab, ok := rreq.Extra["abilities"].([]string); !ok || len(ab) != 2 {
		t.Errorf("move abilities not packed: %#v", rreq.Extra["abilities"])
	}
}

func TestToUpsertReqErrors(t *testing.T) {
	cases := []struct {
		name string
		item onchainInputItem
	}{
		{"evm function without discriminator", onchainInputItem{Type: "function", Address: "0xA"}},
		{"evm external_dep without target", onchainInputItem{Type: "external_dep", Address: "0xA"}},
		{"solana instruction without discriminator/name", onchainInputItem{Chain: "solana", Type: "instruction", Address: "prog"}},
		{"kind not in family", onchainInputItem{Family: "evm", Type: "program", Address: "0xA"}},
		{"unknown kind", onchainInputItem{Family: "evm", Type: "bogus", Address: "0xA"}},
	}
	for _, c := range cases {
		if _, err := c.item.toUpsertReq(0); err == nil {
			t.Errorf("%s: expected error, got nil", c.name)
		}
	}
}

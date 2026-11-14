package db

import (
	"testing"
)

// ---------------------------------------------------------------------------
// Pure unit tests (no DB): family resolution, kind validation, and the
// pre-query validation in UpsertOnchainAsset. These always run.
// ---------------------------------------------------------------------------

func TestOnchainFamilyResolution(t *testing.T) {
	cases := []struct {
		family, chain, want string
	}{
		{"", "", "evm"},                  // nothing → default evm
		{"", "ethereum", "evm"},          // evm chain
		{"", "arbitrum", "evm"},          // unknown chain → evm
		{"", "solana", "solana"},         // inferred from chain
		{"", "eclipse", "solana"},        // solana family chain
		{"", "sui", "move"},              // move
		{"", "aptos", "move"},            // move
		{"", "movement", "move"},         // move
		{"solana", "ethereum", "solana"}, // explicit family wins over chain
		{"MOVE", "", "move"},             // case-insensitive
	}
	for _, c := range cases {
		if got := OnchainFamily(c.family, c.chain); got != c.want {
			t.Errorf("OnchainFamily(%q,%q) = %q, want %q", c.family, c.chain, got, c.want)
		}
	}
}

func TestOnchainKindValid(t *testing.T) {
	valid := map[string][]string{
		"evm":    {"contract", "function", "storage_var", "role", "external_dep", "invariant"},
		"solana": {"program", "instruction", "account", "pda", "cpi_target", "invariant"},
		"move":   {"module", "move_function", "resource", "capability", "invariant"},
		"zk":     {"circuit", "signal", "invariant"},
	}
	for fam, kinds := range valid {
		for _, k := range kinds {
			if !OnchainKindValid(fam, k) {
				t.Errorf("OnchainKindValid(%q,%q) = false, want true", fam, k)
			}
		}
	}
	// cross-family kinds must not validate
	bad := [][2]string{
		{"evm", "program"}, {"solana", "contract"}, {"move", "function"},
		{"zk", "module"}, {"evm", "signal"}, {"nope", "contract"},
	}
	for _, b := range bad {
		if OnchainKindValid(b[0], b[1]) {
			t.Errorf("OnchainKindValid(%q,%q) = true, want false", b[0], b[1])
		}
	}
}

func TestIsOnchainFamily(t *testing.T) {
	for _, f := range []string{"evm", "solana", "move", "zk"} {
		if !IsOnchainFamily(f) {
			t.Errorf("IsOnchainFamily(%q) = false", f)
		}
	}
	for _, f := range []string{"", "bitcoin", "cosmos", "EVM"} {
		if IsOnchainFamily(f) {
			t.Errorf("IsOnchainFamily(%q) = true, want false", f)
		}
	}
}

// UpsertOnchainAsset validates family/kind/address before touching the DB, so
// these error paths run on a zero-value store with no connection.
func TestUpsertOnchainValidationNoDB(t *testing.T) {
	s := &AssetStore{}
	cases := []struct {
		name string
		req  UpsertOnchainAssetReq
	}{
		{"unknown family", UpsertOnchainAssetReq{Family: "bitcoin", Type: "script", Address: "x"}},
		{"kind not in family", UpsertOnchainAssetReq{Family: "evm", Type: "program", Address: "0xabc"}},
		{"solana kind on evm chain", UpsertOnchainAssetReq{Chain: "ethereum", Type: "program", Address: "0xabc"}},
		{"missing address (top-level)", UpsertOnchainAssetReq{Family: "evm", Type: "contract", Address: ""}},
		{"missing address (member)", UpsertOnchainAssetReq{Family: "solana", Type: "instruction", Address: "", Key: "ix"}},
	}
	for _, c := range cases {
		if _, err := s.UpsertOnchainAsset(c.req); err == nil {
			t.Errorf("%s: expected error, got nil", c.name)
		}
	}
}

// ---------------------------------------------------------------------------
// DB-gated tests: exercise the real insert/dedup/chain_family path and the
// migrated schema. Skip when no PostgreSQL is reachable.
// ---------------------------------------------------------------------------

// cleanupOnchain removes every on-chain row created by these tests. Safe because
// the suite holds the advisory lock (serialized) and the addresses are unique.
func cleanupOnchain(d *DB, addrs ...string) {
	for _, a := range addrs {
		d.Exec(`DELETE FROM assets WHERE chain_family IS NOT NULL AND address = $1`, a)
	}
}

func TestOnchainSchemaMigrated(t *testing.T) {
	d, _, _ := testSetup(t)
	defer d.Close()

	var cols int
	d.QueryRow(`SELECT count(*) FROM information_schema.columns
	            WHERE table_name='assets' AND column_name IN ('address','chain','onchain_key','chain_family')`).Scan(&cols)
	if cols != 4 {
		t.Errorf("expected 4 on-chain columns present, got %d", cols)
	}
	var idx int
	d.QueryRow(`SELECT count(*) FROM pg_indexes WHERE tablename='assets' AND indexname='uq_onchain'`).Scan(&idx)
	if idx != 1 {
		t.Errorf("uq_onchain index missing (got %d)", idx)
	}
	// the widened type CHECK must admit a cross-family kind
	var ckHasProgram bool
	d.QueryRow(`SELECT EXISTS(
	    SELECT 1 FROM pg_constraint
	    WHERE conrelid='assets'::regclass AND contype='c'
	      AND pg_get_constraintdef(oid) LIKE '%program%')`).Scan(&ckHasProgram)
	if !ckHasProgram {
		t.Error("assets type CHECK was not widened to the multi-family union")
	}
}

func TestUpsertOnchainEVM(t *testing.T) {
	d, as, _ := testSetup(t)
	defer d.Close()
	const addr = "0xdeadbeefonchaintest01"
	defer cleanupOnchain(d, addr)

	cid, err := as.UpsertOnchainAsset(UpsertOnchainAssetReq{
		Type: "contract", Address: addr, Name: "Vault",
		Extra: map[string]any{"compiler": "0.8.24"}, TaskID: 1,
	})
	if err != nil {
		t.Fatal(err)
	}
	if cid == 0 {
		t.Fatal("zero contract id")
	}

	// chain_family defaulted to evm, chain to ethereum, name merged into extra
	var fam, chain, name string
	d.QueryRow(`SELECT chain_family, chain, COALESCE(extra->>'name','') FROM assets WHERE id=$1`, cid).Scan(&fam, &chain, &name)
	if fam != "evm" || chain != "ethereum" || name != "Vault" {
		t.Errorf("contract row: family=%q chain=%q name=%q; want evm/ethereum/Vault", fam, chain, name)
	}

	// a function member carries the parent contract address
	fid, err := as.UpsertOnchainAsset(UpsertOnchainAssetReq{
		Type: "function", Address: addr, Key: "0xa9059cbb", Name: "transfer",
		Extra: map[string]any{"selector": "0xa9059cbb"}, TaskID: 1,
	})
	if err != nil {
		t.Fatal(err)
	}
	if fid == cid {
		t.Fatal("function and contract should be distinct rows")
	}
	var fAddr string
	d.QueryRow(`SELECT address FROM assets WHERE id=$1`, fid).Scan(&fAddr)
	if fAddr != addr {
		t.Errorf("function parent address = %q, want %q", fAddr, addr)
	}
}

func TestUpsertOnchainDedupAndMerge(t *testing.T) {
	d, as, _ := testSetup(t)
	defer d.Close()
	const addr = "0xdeduponchaintest02"
	defer cleanupOnchain(d, addr)

	req := UpsertOnchainAssetReq{Type: "contract", Address: addr, Name: "C", TaskID: 1}
	id1, err := as.UpsertOnchainAsset(req)
	if err != nil {
		t.Fatal(err)
	}
	// re-insert same tuple with extra detail → same row, extra merged, task added
	id2, err := as.UpsertOnchainAsset(UpsertOnchainAssetReq{
		Type: "contract", Address: addr, Extra: map[string]any{"compiler": "0.8.25"}, TaskID: 2,
	})
	if err != nil {
		t.Fatal(err)
	}
	if id2 != id1 {
		t.Fatalf("dedup failed: %d vs %d", id2, id1)
	}
	var compiler string
	var nTasks int
	d.QueryRow(`SELECT COALESCE(extra->>'compiler',''), array_length(task_ids,1) FROM assets WHERE id=$1`, id1).Scan(&compiler, &nTasks)
	if compiler != "0.8.25" {
		t.Errorf("extra merge failed: compiler=%q", compiler)
	}
	if nTasks != 2 {
		t.Errorf("task_ids merge: got %d, want 2", nTasks)
	}

	// a different onchain_key under the same address is a distinct row
	fid, err := as.UpsertOnchainAsset(UpsertOnchainAssetReq{Type: "function", Address: addr, Key: "sel1"})
	if err != nil {
		t.Fatal(err)
	}
	if fid == id1 {
		t.Error("different onchain_key should not dedup to the contract row")
	}
}

func TestUpsertOnchainMultiFamily(t *testing.T) {
	d, as, _ := testSetup(t)
	defer d.Close()
	const solAddr = "proggonchaintest03"
	const moveAddr = "0x1::vaultonchaintest03"
	defer cleanupOnchain(d, solAddr, moveAddr)

	// Solana: family inferred from chain
	pid, err := as.UpsertOnchainAsset(UpsertOnchainAssetReq{Chain: "solana", Type: "program", Address: solAddr, Name: "Prog"})
	if err != nil {
		t.Fatal(err)
	}
	iid, err := as.UpsertOnchainAsset(UpsertOnchainAssetReq{Chain: "solana", Type: "instruction", Address: solAddr, Key: "deposit"})
	if err != nil {
		t.Fatal(err)
	}
	// Move: family inferred from chain=sui
	mid, err := as.UpsertOnchainAsset(UpsertOnchainAssetReq{Chain: "sui", Type: "module", Address: moveAddr, Name: "vault"})
	if err != nil {
		t.Fatal(err)
	}
	capid, err := as.UpsertOnchainAsset(UpsertOnchainAssetReq{Chain: "sui", Type: "capability", Address: moveAddr, Name: "AdminCap"})
	if err != nil {
		t.Fatal(err)
	}
	for _, id := range []int64{pid, iid, mid, capid} {
		if id == 0 {
			t.Fatal("zero id in multi-family insert")
		}
	}
	var pfam, mfam string
	d.QueryRow(`SELECT chain_family FROM assets WHERE id=$1`, pid).Scan(&pfam)
	d.QueryRow(`SELECT chain_family FROM assets WHERE id=$1`, mid).Scan(&mfam)
	if pfam != "solana" {
		t.Errorf("program chain_family = %q, want solana", pfam)
	}
	if mfam != "move" {
		t.Errorf("module chain_family = %q, want move", mfam)
	}

	// dedup holds within a family
	pid2, _ := as.UpsertOnchainAsset(UpsertOnchainAssetReq{Chain: "solana", Type: "program", Address: solAddr})
	if pid2 != pid {
		t.Errorf("solana program dedup failed: %d vs %d", pid2, pid)
	}
}

// TestOnchainCoverageLabel verifies the label fallback added for on-chain rows
// (extra->>'name', then address) — the expression used by the coverage CTEs.
func TestOnchainCoverageLabel(t *testing.T) {
	d, as, _ := testSetup(t)
	defer d.Close()
	const named = "0xlabeltest04named"
	const unnamed = "0xlabeltest04bare"
	defer cleanupOnchain(d, named, unnamed)

	nid, err := as.UpsertOnchainAsset(UpsertOnchainAssetReq{Type: "contract", Address: named, Name: "MyVault"})
	if err != nil {
		t.Fatal(err)
	}
	uid, err := as.UpsertOnchainAsset(UpsertOnchainAssetReq{Type: "contract", Address: unnamed})
	if err != nil {
		t.Fatal(err)
	}
	labelExpr := `COALESCE(url, domain, ip, app_name, root_domain, extra->>'name', address, '')`
	var namedLabel, bareLabel string
	d.QueryRow(`SELECT `+labelExpr+` FROM assets WHERE id=$1`, nid).Scan(&namedLabel)
	d.QueryRow(`SELECT `+labelExpr+` FROM assets WHERE id=$1`, uid).Scan(&bareLabel)
	if namedLabel != "MyVault" {
		t.Errorf("named on-chain label = %q, want MyVault", namedLabel)
	}
	if bareLabel != unnamed {
		t.Errorf("unnamed on-chain label = %q, want %q (address fallback)", bareLabel, unnamed)
	}
}

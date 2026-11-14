---
name: foundry-invariant
description: Invoke this skill when hunting logic / accounting bugs in a smart contract by fuzzing and invariant testing — writing Foundry invariant harnesses and handler contracts, stateless fuzz tests, and Echidna/Medusa campaigns, then recording what breaks. Use it after the invariants are stated (record_invariant) to try to break them. A broken invariant is recorded as a counterexample fact (record_counterexample), not a finding — a finding still needs a clean PoC. Harnesses run only against a local fork or test deployment.
---

# Foundry invariants & fuzzing — breaking the properties

This is the phase that surfaces **logic and accounting bugs**: the ones static
analysis and a line-by-line read miss, because they only appear after an
unexpected *sequence* of calls. You state what must always be true, then let a
fuzzer fire thousands of random sequences trying to make it false.

Precondition: the invariants are already stated as asset nodes
(`record_invariant` / the `foundry` skill). This skill's job is to **attack**
them. If no invariants are stated yet, state them first — you cannot fuzz a
property you have not written down.

## Boundaries (must-read — a violation is out of scope)

| Allowed | Forbidden |
|---|---|
| write + run harnesses against a **local fork** (`--fork-url`) or a local test deployment; read state; shrink and re-run counterexamples | sending transactions to a live chain, broadcasting, any exploit against a contract holding real funds |

**Isolated lab only.** Everything here runs locally. A counterexample is
evidence, never an action against a live target.

## 0. Tools

```bash
forge --version                              # built-in fuzzing + invariant testing
echidna --version 2>/dev/null || echo "echidna not installed (optional)"
medusa --version  2>/dev/null || echo "medusa not installed (optional)"
```

Foundry alone is enough to start; Echidna/Medusa are for deeper campaigns (§4).

## 1. Write the invariant, then the handler

An invariant test asserts a global property holds after *every* step of a random
call sequence. Two pieces:

- **`invariant_*()`** — the property, read-only, asserting the invariant.
- **a handler** — the bounded set of actions the fuzzer may fire, so it explores
  *valid* sequences instead of reverting on garbage inputs.

```solidity
// test/invariant/Vault.invariant.t.sol
contract Handler is Test {
    Vault public vault; MockERC20 public asset;
    uint256 public ghost_deposited;   // ghost: track what *should* be true
    constructor(Vault v, MockERC20 a) { vault = v; asset = a; }

    function deposit(uint256 amt) public {
        amt = bound(amt, 0, 1e24);                 // keep inputs in a sane range
        asset.mint(address(this), amt);
        asset.approve(address(vault), amt);
        vault.deposit(amt, address(this));
        ghost_deposited += amt;
    }
    function withdraw(uint256 shares) public {
        shares = bound(shares, 0, vault.balanceOf(address(this)));
        vault.redeem(shares, address(this), address(this));
    }
    function donate(uint256 amt) public {          // the adversarial action!
        amt = bound(amt, 0, 1e24);
        asset.mint(address(this), amt);
        asset.transfer(address(vault), amt);       // inflate share price directly
    }
}

contract VaultInvariant is Test {
    Vault vault; Handler handler;
    function setUp() public {
        /* deploy vault + asset */
        handler = new Handler(vault, asset);
        targetContract(address(handler));          // fuzz the handler, not the vault directly
    }
    // "no depositor can be rounded to zero shares after a donation"
    function invariant_sharesNeverRoundToZeroAfterDonation() public view {
        assertGe(vault.totalAssets(), vault.totalSupply());
    }
}
```

Key techniques:
- **`bound(x, lo, hi)`** every fuzzed input — unbounded inputs waste runs
  reverting.
- **Handler-based (actor) pattern** — the fuzzer calls handler functions; the
  handler encodes the only *legal* transitions plus the *adversarial* ones
  (`donate`, direct transfers, re-entrant callbacks). The bug usually hides in an
  action auditors forget to allow (donations, fee-on-transfer, a second actor).
- **Ghost variables** — mirror the intended accounting in the handler, then
  assert the contract agrees with the ghost.
- **`targetContract` / `targetSelector` / `targetSender`** — scope what gets
  fuzzed and who sends.
- **Multiple actors** — maintain an address set in the handler so cross-user
  bugs (one user draining another) can appear.

## 2. Configure and run

`foundry.toml`:

```toml
[invariant]
runs = 256          # independent sequences
depth = 100         # calls per sequence
fail_on_revert = false   # start false to explore; flip true to assert "nothing should ever revert"
```

```bash
forge test --match-contract VaultInvariant -vvvv
forge test --mt invariant_sharesNeverRoundToZeroAfterDonation --fork-url "$RPC_URL" -vvvv
```

Also write **stateless (property) fuzz** tests for pure functions:

```solidity
function testFuzz_depositThenRedeemNeverProfits(uint256 amt) public { ... }
```

## 3. Read the result

- **Pass** is weak evidence, not proof — it means the fuzzer did not break it
  within `runs × depth`. Raise them, add adversarial handler actions, widen
  actors, then re-run. Record a `record_fact` (confidence `inferred`) that the
  invariant *held under fuzzing with these bounds* — never claim "safe".
- **Fail** = Foundry prints the **shrunk call sequence** that broke it. This is
  the counterexample. Save the exact sequence and a way to re-run it (the test
  name, the seed, `-vvvv` trace).

On a fail, call **`record_counterexample`**:

```
record_counterexample(
  address:   <the invariant's contract address>,
  name:      <the same invariant name you used in record_invariant>,
  summary:   "totalAssets < totalSupply after deposit(1) then donate(1e21)",
  sequence:  "<the shrunk call sequence Foundry printed>",
  reproduce: "forge test --mt invariant_sharesNeverRoundToZeroAfterDonation -vvvv  (seed 0x..)",
  severity:  "high",
  intent_id: <your intent id>
)
```

This marks the invariant as a candidate break and records an `observed` fact
anchored to it, waking the planner. **It is still a lead, not a finding.** A
finding requires a clean, minimal PoC exploit (the `foundry` skill, proof phase →
`report_finding`). The counterexample is the raw material for that PoC.

## 4. Deeper campaigns — Echidna & Medusa (optional)

When Foundry invariants come up clean but you suspect a deep sequence bug, or you
want a second engine:

- **Echidna** (Trail of Bits, coverage-guided). Property mode (`echidna_*`
  returns bool) or assertion mode. Reuses the same handler-style contract.
  ```bash
  echidna . --contract VaultInvariant --config echidna.yaml
  ```
  `echidna.yaml`: `testMode: assertion`, `testLimit: 100000`, `corpusDir: corpus`.
- **Medusa** (Trail of Bits, Go, parallelized) — compatible with Foundry-style
  tests, faster on many cores.
  ```bash
  medusa fuzz --target . --test-limit 500000
  ```

Reconcile engines: a break found by any engine is a counterexample worth
recording. Keep the corpus between runs so coverage compounds.

## 5. Which invariants to write

Per DeFi primitive, the high-value properties are catalogued in the
`web3-security-audit` skill, file 05 (AMM `k` never decreases except by fees;
vault `totalAssets ≥ totalSupply`; lending health-factor monotonicity; sum of
balances == totalSupply). The fuzzing method, and what it catches vs misses, is
file 04 §4. Start from those; add protocol-specific ones from the docs/comments.

## Provisioning the tools

Run `/opt/web3/verify.sh` inside the worker to list which Web3 CLIs are present; install missing ones with the matching `deploy/web3/install-<family>.sh` (`docs/WEB3-TOOLCHAIN.md`). If a required tool is absent, record a fact that it is unavailable and fall back (manual/static) — never fabricate a result.

---
name: halmos
description: Invoke this skill to formally verify a smart contract — prove a property holds for ALL inputs within bounds (or get a counterexample) via symbolic execution, instead of sampling like a fuzzer. Use it on small, critical, well-bounded logic (core math, access control, a specific invariant) after fuzzing, when "no counterexample found in N runs" is not enough assurance. Halmos reuses Foundry-style tests so the barrier is low; Certora (CVL) is the heavier industrial option. Analysis only — it runs no transactions.
---

# Halmos — bounded formal verification for Solidity

Fuzzing *samples* the input space; formal verification *proves* over it. Where a
fuzzer says "no counterexample in 256 runs", Halmos explores **all** paths within
the bounds you set and either proves the property or hands you a concrete
counterexample. Expensive and bounded — reserve it for small, critical, logic you
cannot afford to be wrong about (core accounting math, an access-control gate, a
single high-value invariant).

## Boundaries

Analysis only: symbolic execution of the compiled code. No deployment, no
transactions, no network. A proof is an argument about the code, never an action
against a target.

## When to reach for it

- After static analysis (`slither`) and fuzzing (`foundry-invariant`), when a
  critical property passed fuzzing but you want a *proof*, not a sample.
- The logic is **bounded and small**: fixed-size loops, a pure math function, a
  modifier, one invariant. Unbounded loops / huge state blow up symbolic
  execution — fuzz those instead.

## 0. Tool

```bash
halmos --version 2>/dev/null || echo "halmos not installed"
# install: pip install halmos   (a16z; reuses the Foundry build)
```

Missing → record a fact that FV is unavailable and rely on fuzzing + manual proof
sketch.

## 1. Write a `check_` test (same shape as a Foundry test)

Halmos runs functions prefixed `check_`, treating their arguments as **symbolic**:

```solidity
// test/Vault.symbolic.t.sol
contract VaultSymbolic is Test {
    Vault vault;
    function setUp() public { /* deploy */ }

    // Prove: redeeming shares never returns more assets than were backing them.
    function check_redeemNeverOverpays(uint256 shares) public {
        vm.assume(shares <= vault.totalSupply());          // bound the symbol
        uint256 before = vault.totalAssets();
        uint256 got = vault.redeem(shares, address(this), address(this));
        assert(got <= before);                              // the property
    }
}
```

- `vm.assume(...)` constrains the symbolic input to the legal domain — the
  equivalent of `bound()` in fuzzing.
- `assert(...)` is the property to prove. Halmos tries every path; a violated
  assert yields a concrete counterexample (input values).

## 2. Run

```bash
halmos --function check_redeemNeverOverpays -vvvv
halmos --contract VaultSymbolic                 # all check_ funcs in a contract
# tame blow-ups: --loop N (unroll bound), --solver-timeout-assertion <ms>, --storage-layout
```

## 3. Read the result — and its limits

- **Proved (no counterexample)** → the property holds **for all inputs within
  your assumptions and bounds**. Record a `record_fact` (confidence `observed`)
  that states the property *and the bounds/assumptions it was proved under* —
  that qualification is the whole point; an unbounded claim is false assurance.
- **Counterexample** → Halmos prints concrete inputs that break the assert. Treat
  it exactly like a fuzzer counterexample: `record_counterexample` against the
  invariant, then turn it into a concrete Foundry PoC and `report_finding`.

**The cardinal caveat:** FV proves *the property you wrote*, under *the bounds you
set*. A wrong or incomplete spec proves nothing useful. It complements fuzzing and
manual review; it does not replace them.

## Certora (heavier, industrial)

Certora Prover uses its own spec language (CVL) and proves properties on core DeFi
protocols/bridges/stablecoins. Far steeper than Halmos; use it for the highest-
stakes modules when the team already has a Certora setup. Methodology and
trade-offs: `web3-security-audit` skill, file 04 §5.

## Provisioning the tools

Run `/opt/web3/verify.sh` inside the worker to list which Web3 CLIs are present; install missing ones with the matching `deploy/web3/install-<family>.sh` (`docs/WEB3-TOOLCHAIN.md`). If a required tool is absent, record a fact that it is unavailable and fall back (manual/static) — never fabricate a result.

---
name: move-prover
description: Invoke this skill to formally verify a Move module (Sui/Aptos) — writing specifications (spec blocks with aborts_if / ensures / invariant) and running the Move Prover to prove a property holds for ALL inputs, or get a counterexample. Use it on critical modules (coin/treasury math, capability custody, a stated invariant) where fuzzing's "no break found" is not enough. Analysis only — it proves over the code, runs nothing on-chain.
---

# Move Prover — prove the invariant, don't just sample it

Move has a **first-class formal verification tool**: the Move Prover reasons about
specifications you write inline as `spec` blocks, discharging them with an SMT
solver. Unlike Solidity (where FV via Halmos/Certora is a bolt-on), in Move it is
part of the normal workflow — so a stated invariant (`record_invariant`) can often
be *proved*, not merely fuzzed. Reserve it for critical, bounded logic (coin
supply, treasury math, capability custody, access predicates).

> Dependency: a proof outcome is recorded with `record_fact` (held, with bounds)
> or `record_counterexample` (broken); both chain-agnostic and available today.
> Invariants come from `record_invariant`.

## Boundaries

Analysis only — symbolic proof over the module. No publish, no transactions.

## When to reach for it

After `move-recon` states invariants and before/alongside `move-poc`: when a
critical property must hold for *all* inputs (not just the sequences a fuzzer
tried), or when you want to prove a capability/access predicate is airtight.

## 0. Tool

```bash
sui move test --help 2>/dev/null       # Sui bundles prover tooling via the Move toolchain
aptos move prove --help 2>/dev/null    # Aptos exposes the prover directly
# the prover needs a solver (z3/cvc5) installed
```

Missing prover/solver → record a fact that FV is unavailable; rely on `move-poc`
fuzzing + a manual proof sketch.

## 1. Write the spec

Specs live in `spec` blocks next to the code and state pre/post-conditions and
invariants:

```move
module app::vault {
    struct Vault has key { total: u64 }

    public fun withdraw(v: &mut Vault, amount: u64) { v.total = v.total - amount; }

    spec withdraw {
        // prove it can never silently underflow (abort, not wrap):
        aborts_if amount > v.total;
        // prove the post-state is exactly the debit:
        ensures v.total == old(v.total) - amount;
    }

    // a module-level invariant the prover enforces across all functions:
    spec module {
        invariant forall v: Vault : v.total <= MAX_SUPPLY;
    }
}
```

- `aborts_if` — the conditions under which the function *must* abort (proving no
  silent overflow/underflow).
- `ensures` — the post-condition over `old(...)` vs new state.
- `invariant` — a property that holds for all reachable states (the core tool for
  "supply conserved", "resource never duplicated").
- `requires` — a pre-condition assumption (keep these honest; a false assumption
  proves nothing — the FV caveat, file 04 §5).

## 2. Run

```bash
aptos move prove --package-dir .        # Aptos
sui move prove 2>/dev/null || sui move test   # Sui (per toolchain version)
```

## 3. Read the result

- **Proved** → the property holds for **all inputs within your `requires`
  assumptions**. `record_fact` (confidence `observed`) stating the property *and
  the assumptions it was proved under* — the qualification is the point; an
  unbounded claim is false assurance.
- **Counterexample** → the prover prints inputs that violate the spec. Treat it
  like a fuzzer break: `record_counterexample` against the invariant, then turn it
  into a concrete `move-poc` test and `report_finding`.

**Caveat (file 04 §5):** the prover proves *the spec you wrote*, under *the
assumptions you set*. A wrong/incomplete spec proves nothing useful. It
complements `move-poc` and manual review; it does not replace them.

Deeper reference: `web3-security-audit` skill, file 08 §2 (Move model) and file 04
§5 (formal verification).

## Provisioning the tools

Run `/opt/web3/verify.sh` inside the worker to list which Web3 CLIs are present; install missing ones with the matching `deploy/web3/install-<family>.sh` (`docs/WEB3-TOOLCHAIN.md`). If a required tool is absent, record a fact that it is unavailable and fall back (manual/static) — never fabricate a result.

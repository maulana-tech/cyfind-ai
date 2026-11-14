---
name: move-poc
description: Invoke this skill to prove (or refute) a Move (Sui/Aptos) vulnerability — writing Move unit tests and fuzz-style harnesses that exercise capability misuse, resource duplication/leaks, access-control gaps and arithmetic/economic breaks, then reporting a confirmed exploit. Use it after move-recon flags a candidate (and alongside move-prover). A passing exploit against a local node / test runtime becomes a finding; anything less stays a lead. Runs only locally — never against a live package with real funds.
---

# Move PoC — break the capability or the invariant

`move-recon` finds candidate gaps and `move-prover` proves properties; this skill
**demonstrates a break** with a concrete test. On Move the exploit is usually:
*obtain or misuse a capability you shouldn't have, duplicate/strand a resource, or
drive the economic math past an invariant* — shown by a `#[test]` that sets up the
adversarial condition and asserts the bad outcome.

> Tools: on a break use `record_counterexample` / `report_finding`
> (chain-agnostic), anchoring to the `move` assets `move-recon` created via
> `insert_onchain` (file 11 §4). All are available.

## Boundaries (must-read)

| Allowed | Forbidden |
|---|---|
| run Move unit tests / local node (`sui`/`aptos`) against the package built locally; construct adversarial callers/objects | publishing to a live network; sending real transactions; attacking out-of-scope packages |

**Isolated lab only.** The target is the package built locally and the test
runtime. A PoC is evidence, not a live action.

## 0. Tools

```bash
sui move test --help 2>/dev/null; aptos move test --help 2>/dev/null
```

Sui and Aptos both run Move unit tests (`#[test]`, `#[test_only]`) in-process —
fast and sufficient for most PoCs. Use a local validator (`sui start` /
`aptos node run-local-testnet`) only when you need full runtime behavior.

## 1. Write the adversarial test

The pattern: build honest state, then have an attacker do the thing the design
forbids, and assert it succeeded (which it must not).

```move
#[test_only]
module app::vault_exploit {
    use app::vault;

    #[test]
    fun attacker_mints_without_cap() {
        // if a MintCap can be obtained/forged by a non-admin, show it:
        let ctx = /* test scenario / tx context */;
        let forged = vault::obtain_cap_somehow(ctx);   // the suspected gap
        let coins = vault::mint(&forged, 1_000_000);    // should be impossible
        assert!(coin::value(&coins) == 1_000_000, 0);   // bug proven
    }
}
```

Adversarial setups by bug class (file 08 §2):
- **capability misuse** → obtain/duplicate/forge a cap and call a gated function.
- **resource duplication / leak** → exploit a wrong `copy`/`drop` ability, or
  strand a resource no one can reclaim.
- **permission boundary** (Aptos global storage) → access a resource under an
  account you shouldn't; (Sui objects) → get a `&mut` to an object you don't own.
- **arithmetic/economic** → drive supply/price math past its invariant.

Sui uses `test_scenario` (multi-transaction, multi-sender flows, object
ownership); Aptos uses signers + `#[test(addr = @0x…)]`. Build the attacker as a
distinct sender/account.

## 2. Fuzz / invariant-check where hand-crafting is hard

For sequence/accounting bugs, drive randomized (bounded) call sequences and assert
the invariants from `record_invariant` after each (e.g. "coin supply == sum of
balances", "a resource of type T is never duplicated"). Use the ecosystem's
property/fuzz tooling where available, or a scenario loop with randomized inputs.
A break = a counterexample sequence to record.

## 3. Record the result

- **Fuzzer/invariant break** → `record_counterexample` (address = `addr::module`,
  name = the invariant, summary = what broke, sequence = the call trace,
  reproduce = the test name/seed). A lead, not a finding.
- **Clean exploit test passes** → `report_finding`:
  - `asset_ids` = the affected `module` / `move_function` / `capability` /
    `resource` asset ids;
  - `evidence` = the test + key output (the value minted/stolen, the assertion);
  - `traffic_refs` = `[]`; `severity` = impact × likelihood.
- **No reproduction** → stays a `record_fact` lead.

**Mitigation review (retest):** re-run the exploit test against the patched
package; `fixed` only if it no longer triggers **and** a normal path still works —
else `inconclusive`.

Never publish to or transact on a live network. Deeper reference:
`web3-security-audit` skill, file 08 §2 and file 03 (finding/PoC discipline).

## Provisioning the tools

Run `/opt/web3/verify.sh` inside the worker to list which Web3 CLIs are present; install missing ones with the matching `deploy/web3/install-<family>.sh` (`docs/WEB3-TOOLCHAIN.md`). If a required tool is absent, record a fact that it is unavailable and fall back (manual/static) — never fabricate a result.

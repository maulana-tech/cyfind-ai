---
name: solana-poc
description: Invoke this skill to prove (or refute) a Solana program vulnerability — writing fast program tests (litesvm / bankrun / solana-program-test), fuzzing with Trident, and building an adversarial-account PoC that triggers the bug, then reporting it. Use it after solana-recon flags a candidate. A passing exploit against a local validator/fork becomes a finding; anything less stays a lead. Runs only locally — never against a live program with real funds.
---

# Solana PoC — prove the account-validation bug

`solana-recon` finds candidate gaps; this skill **proves** them. On Solana the
exploit is almost always: *pass the instruction a malicious or mismatched set of
accounts and show it does something it must not* (withdraw without the real
signer, substitute a PDA, invoke an attacker program via an unchecked CPI). You
prove it with a test that constructs those accounts and asserts the bad outcome.

> Tools: on a confirmed break use `record_counterexample` (fuzzer-found case) and
> `report_finding` (both chain-agnostic), anchoring to the `solana` assets
> `solana-recon` created via `insert_onchain` (file 11 §4). All are available.

## Boundaries (must-read — a violation is out of scope)

| Phase | Allowed | Forbidden |
|---|---|---|
| **Proof** | run tests/fuzz against a **local validator / fork / in-process SVM**; craft adversarial accounts; impersonate signers locally | sending any transaction to devnet/mainnet with real funds; broadcasting; attacking out-of-scope programs |

**Isolated lab only.** The "target" is the program built locally and a local SVM
or fork. A PoC is evidence, never a live action.

## 0. Tools & harness choices

```bash
cargo --version && anchor --version 2>/dev/null && solana-test-validator --version
```

Pick the fastest harness that reproduces the bug:
- **litesvm** (Rust/TS) or **solana-bankrun** (TS) — in-process SVM, millisecond
  tests, no validator process. First choice for most PoCs.
- **solana-program-test** (`ProgramTest`, Rust) — in-process BanksClient; mature.
- **solana-test-validator** — a local validator; use when you need a realistic
  runtime or to **fork** real account state (`--clone <ACCOUNT> --url mainnet-beta`
  to copy accounts into the *local* validator — still local, never a live tx).
- **anchor test** — spins a validator + runs the TS/Rust tests for an Anchor repo.

## 1. Write the adversarial PoC

The pattern: set up the honest state, then call the target instruction with the
**wrong accounts** and assert the invariant breaks. Example shape (bankrun/TS):

```ts
// the attacker passes their OWN account where the program should have required
// the vault authority to sign — proving a missing signer check.
const ctx = await startAnchor(".", [], []);
const program = new Program(idl, ctx.provider);
await program.methods.withdraw(amount)
  .accounts({
    vault: vaultPda,
    authority: attacker.publicKey,   // NOT the real authority
    to: attacker.tokenAccount,
  })
  .signers([attacker])               // only the attacker signs
  .rpc();
// assert: attacker balance increased / vault drained  → the bug is real
```

Adversarial setups you will build, by bug class (file 08 §1):
- **missing signer** → sign with the wrong/attacker key.
- **missing owner / type cosplay** → pass an account owned by an attacker program,
  or a different account type with a compatible layout.
- **PDA substitution** → derive a PDA from a different seed/context and pass it.
- **arbitrary CPI** → pass an attacker program id as the callee.
- **account reload / closing** → call, then re-use a "closed" account, or read
  stale data after a CPI.
- **arithmetic** → drive values to overflow an unchecked `+`/`-`.

Cheatcodes/equivalents: fund accounts and set balances in the test setup, create
token accounts, advance the clock/slot via the harness, and construct raw
`AccountMeta`s to pass exactly the accounts you want.

## 2. Fuzz for the ones you can't hand-craft

For logic/accounting bugs across sequences, fuzz with **Trident** (Ackee) — a
coverage-guided fuzzer for Anchor/native programs: it generates instruction
sequences with random (bounded) accounts/args and checks invariants.

```bash
trident init && trident fuzz run <target>   # follow Trident's workflow
```

Write invariants as checks the fuzzer tries to break (e.g. "sum of token-account
balances is conserved", "only authority-signed withdrawals reduce the vault").
On a break, Trident prints the breaking sequence → treat it as a counterexample.

## 3. Record the result

- **Fuzzer/invariant break** → `record_counterexample` (address = program id,
  name = the invariant's name, summary = what broke, sequence = the instruction
  trace, reproduce = the Trident seed/command). It marks the invariant and files
  an `observed` fact; still a lead, not a finding.
- **Clean, minimal exploit test passes** → `report_finding`:
  - `asset_ids` = the affected `program` / `instruction` asset ids;
  - `evidence` = the PoC test + the key output (balances before/after, the tx that
    should have failed but didn't);
  - `traffic_refs` = `[]` (no HTTP);
  - `severity` = impact × likelihood (file 03 §6).
- **No reproduction** → stays a `record_fact` lead; a single failed attempt does
  not prove the program safe.

**Mitigation review (retest):** re-run the same PoC against the patched program on
a fresh local SVM; `fixed` only if the exploit no longer triggers **and** a normal
path still works — otherwise `inconclusive`.

Never target devnet/mainnet with real funds; never broadcast. Deeper reference:
`web3-security-audit` skill, file 08 §1 (bug classes) and file 03 (finding/PoC
discipline).

## Provisioning the tools

Run `/opt/web3/verify.sh` inside the worker to list which Web3 CLIs are present; install missing ones with the matching `deploy/web3/install-<family>.sh` (`docs/WEB3-TOOLCHAIN.md`). If a required tool is absent, record a fact that it is unavailable and fall back (manual/static) — never fabricate a result.

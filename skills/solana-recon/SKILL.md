---
name: solana-recon
description: Invoke this skill when mapping a Solana program for a security review — parsing its Anchor IDL / source, enumerating instructions, accounts, PDAs and CPIs, and running static analysis (Trail of Bits Solana scanner) to surface candidate account-validation bugs. It records structure into the asset graph and candidate issues as facts. Recon only — it deploys nothing and sends no transactions. Use it before solana-poc.
---

# Solana recon — map the program, find the validation gaps

Solana's model is the opposite of the EVM: programs are **stateless**, and every
account they touch is **passed in by the caller**. The runtime does not know
which accounts "belong" to a program — the program must **validate every account
it is handed**. So Solana recon is, above all, an inventory of *what gets passed
in* and *which checks guard it*. (Background: `web3-security-audit` skill, file
08 §1.)

> Tools: records on-chain assets with `insert_onchain` (the generalized asset
> tool — `web3-security-audit` file 11 §4 — pass `family:"solana"` or a solana
> `chain`), and states properties with `record_invariant`; candidate issues go in
> `record_fact`. All are available.

## Boundaries (must-read — a violation is out of scope)

| Scope | Allowed | Forbidden |
|---|---|---|
| **Goal** | parse IDL/source, list instructions/accounts/PDAs/CPIs, run static analysis, map structure | deploying, sending transactions, signing, any state change, any exploit |
| **Target** | source/IDL in the work dir, or a program you are authorized to review | mainnet-beta programs with real funds outside scope |

A static-analysis hit is **inferred**, not observed → `record_fact` with
confidence `inferred`. It becomes a finding only after `solana-poc` proves it.

## 0. Tools

```bash
anchor --version 2>/dev/null; solana --version; cargo --version
# Trail of Bits Solana vulnerability scanner (arbitrary CPI, PDA validation,
# missing signer/owner, sysvar spoofing) — native + Anchor.
```

Missing Anchor → the program may be a **native** (non-Anchor) program; fall back
to reading the Rust entrypoint + `solana program dump` of bytecode. No source →
record a fact that only bytecode is available (decompilation is lower-confidence).

## 1. Map the program structure

If it is an Anchor workspace:

```bash
anchor build                       # produces target/idl/<program>.json
cat target/idl/<program>.json      # the IDL: instructions, accounts, types, errors
# program id:
solana address -k target/deploy/<program>-keypair.json  2>/dev/null \
  || grep -r declare_id programs/
```

Feed structure into the asset graph with `insert_onchain` (family `solana`):

- the program → `kind:"program"` (address = program id).
- each IDL **instruction** → `kind:"instruction"` (onchain_key = name/discriminator;
  record its expected accounts + whether each is `signer`/`mut`).
- each **account struct** → `kind:"account"` (the state it holds).
- each **PDA** (seeds in `#[account(seeds = …, bump)]`) → `kind:"pda"`
  (onchain_key = the seed signature).
- each **CPI** (a call into another program) → `kind:"cpi_target"`
  (onchain_key = callee program id).

Without a real deployed id (local source), use the declared `declare_id!` or a
program-name slug as the address; keep members consistent with it.

## 2. Read the account constraints — the heart of the review

For every instruction, read its `#[derive(Accounts)]` context and ask, per
account: **is each required check present?**

- **Signer** — is the authority a `Signer<'info>` (or `is_signer` checked)? A
  missing signer check is usually critical.
- **Owner** — is it an `Account<'info, T>` (verifies owning program + 8-byte
  discriminator), or a raw `AccountInfo` with no owner check?
- **Relationship** — are related accounts tied with `has_one` / `constraint`
  (this vault belongs to this user)?
- **PDA** — are `seeds`/`bump` validated, or could a PDA from another context be
  substituted?
- **Mutability** — is `mut` only where writes happen?

Record each **gap** as an `inferred` fact anchored to the `instruction` asset:
what check is missing, why it may be reachable, and the next step to confirm.

## 3. Run static analysis

```bash
# Trail of Bits Solana scanner over the workspace:
#   flags arbitrary CPI, improper PDA validation, missing signer/owner, sysvar spoofing
<tob-solana-scanner> .            # follow the scanner's invocation
cargo clippy                      # Rust lints (overflow-prone arithmetic, etc.)
```

Triage, don't dump. Each plausible, in-scope hit → one `inferred` fact naming the
instruction, the detector, and its meaning **in this program's context**.
Suppress hits on tests/mocks and clear false positives.

Also check the **bug classes that tools miss** (file 08 §1): type cosplay,
account reloading after a CPI, re-initialization, improper account closing,
duplicate mutable accounts, and **unchecked arithmetic** (Rust release builds wrap
— look for `+`/`-`/`*` on balances that should be `checked_*`).

## 4. State the invariants & hand off

Use `record_invariant` for the properties the program must uphold — e.g.
"only the account authority can withdraw", "vault lamports == sum of user
deposits", "a PDA can only be signed by this program". These anchor the directions
`solana-poc` will try to break.

After this pass the asset graph holds the program + its instructions/accounts/
PDAs/CPIs, and the exploration graph holds one `inferred` fact per candidate
validation gap. Promising ones (a missing signer check, an arbitrary CPI, a PDA
substitution) are what the planner turns into intents and `solana-poc` proves.

Framework-bug reminder: pin `anchor-lang` and check its advisories — e.g.
**RUSTSEC-2026-0144** (`anchor-lang` < 1.0.0 mis-validated `Program<System>`,
enabling program substitution; fixed 1.0.2+). A dependency bug defeats correct
code (file 08 §1).

Deeper reference: `web3-security-audit` skill, file 08 §1.

## Provisioning the tools

Run `/opt/web3/verify.sh` inside the worker to list which Web3 CLIs are present; install missing ones with the matching `deploy/web3/install-<family>.sh` (`docs/WEB3-TOOLCHAIN.md`). If a required tool is absent, record a fact that it is unavailable and fall back (manual/static) — never fabricate a result.

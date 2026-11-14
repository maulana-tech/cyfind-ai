---
name: move-recon
description: Invoke this skill when mapping a Move package (Sui or Aptos) for a security review — enumerating modules, public/entry functions, resources (the assets), and capabilities (the access-control objects), and running MoveScanner static analysis. It records structure into the asset graph and candidate issues as facts. Recon only — it publishes nothing and sends no transactions. Use it before move-prover / move-poc.
---

# Move recon — map capabilities, resources, and boundaries

Move is safe by construction: assets are **resources** (linear types — cannot be
copied or silently dropped), and there is no EVM-style reentrancy. That removes
whole bug classes, so Move bugs live elsewhere: **capability design, access
control, permission boundaries, arithmetic, and economic invariants** (file 08
§2). Move recon maps *which capabilities gate what*, and *where resources can
flow*.

> Tools: records on-chain assets with `insert_onchain` (pass `family:"move"` or a
> `chain` of sui/aptos; file 11 §4), states properties with `record_invariant`,
> and files candidate issues with `record_fact`. All are available.

## Sui vs Aptos — know which you're on

They share the language but **not the storage model** (file 08 §2):
- **Aptos** uses Move's **global storage**: a module can access resources of its
  own types under any account (`borrow_global`, `move_to`). Access control is
  about *who may call* the function that touches the resource.
- **Sui** drops global storage for an **object model**: everything is an object
  with a `UID`, owned or shared, passed explicitly by reference. Access control is
  about *object ownership* and who can get a mutable reference.

Set `chain` to `sui` or `aptos` and branch your reasoning accordingly — do not
carry Aptos global-storage assumptions to Sui.

## Boundaries (must-read)

| Allowed | Forbidden |
|---|---|
| parse source/bytecode, list modules/functions/resources/capabilities, run MoveScanner, map structure | publishing, sending transactions, any state change, any exploit |

A static hit is `inferred` → `record_fact`; a finding needs a `move-poc`/
`move-prover` proof.

## 0. Tools

```bash
sui --version 2>/dev/null; aptos --version 2>/dev/null
sui move build   # or: aptos move compile   — compile the package, get the module list
```

No source → `move disassemble` the bytecode and note lower confidence.

## 1. Map the package

```bash
sui move build                     # Sui: builds + lists modules
aptos move compile --package-dir . # Aptos
# read the Move.toml for addresses + deps; read each module's public/entry fns
```

Feed into the asset graph with `insert_onchain` (family `move`):
- each module → `kind:"module"` (address = `addr::module`).
- each `public`/`entry` function → `kind:"move_function"` (onchain_key = fn name;
  record parameters, whether it takes `&mut`, and which capability it requires).
- each `struct` with the `key`/`store` ability (a stored asset) →
  `kind:"resource"` (onchain_key = struct name; note its abilities: copy/drop/
  store/key).
- each capability object (`AdminCap`, `MintCap`, `TreasuryCap`, a `has_one`-style
  witness) → `kind:"capability"`.

## 2. Read the capability & resource flow — the review's core

For each privileged function ask: **which capability gates it, who can hold that
capability, and can a resource end up somewhere the invariant forbids?**

- **Capability custody** — is the `AdminCap`/`MintCap` created once and held
  safely, or can it be obtained/forged/duplicated? A leaked capability is the
  Move analog of a broken `onlyOwner`.
- **Ability misuse** — does a resource have `copy`/`drop` it should not, allowing
  duplication or silent destruction of value?
- **Permission boundary / resource-state anomaly** — can a cross-module call path
  leave a resource in a state the design did not anticipate?
- **Arithmetic** — overflow/precision in the economic math (Move checks some, not
  your protocol's).
- **Sui-specific:** object ownership (owned vs shared), can an attacker obtain a
  `&mut` to an object they should not; **Aptos-specific:** can a module read/write
  resources under an account it should not.

Record each gap as an `inferred` fact anchored to the `move_function` or
`capability` asset.

## 3. Static analysis

```bash
# MoveScanner / MoveScan: CFG + data-flow + cross-module call graph over bytecode;
# targets resource leaks, weak permission management, arithmetic overflow, etc.
<movescanner> .          # follow the tool's invocation
```

Triage each hit into one `inferred` fact in context. Platform reminder: the Move
**bytecode verifier itself** has had bugs (Zellic's "Billion-Dollar Move Bug"
bypassed reference-safety checks on both Aptos and Sui) — pin toolchain versions
and track advisories (file 08 §2).

## 4. State invariants & hand off

`record_invariant` for the properties that must hold — e.g. "total supply of this
coin only changes via `mint`/`burn` holding `TreasuryCap`", "a resource of type T
is never duplicated", "only the object owner can transfer it". These anchor the
directions `move-prover` (prove them) and `move-poc` (break them) pursue.

Deeper reference: `web3-security-audit` skill, file 08 §2.

## Provisioning the tools

Run `/opt/web3/verify.sh` inside the worker to list which Web3 CLIs are present; install missing ones with the matching `deploy/web3/install-<family>.sh` (`docs/WEB3-TOOLCHAIN.md`). If a required tool is absent, record a fact that it is unavailable and fall back (manual/static) — never fabricate a result.

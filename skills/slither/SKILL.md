---
name: slither
description: Invoke this skill when statically analysing a smart-contract / Solidity target. It runs Slither (and, when available, Aderyn) over verified or provided source to map the contract surface and surface candidate issues, which you turn into asset-graph nodes (insert_onchain) and facts (record_fact). Recon only — it never deploys, sends transactions, or exploits.
---

# Slither — static-analysis recon for smart contracts

This skill is the **first pass** over a Solidity codebase: cheap, broad, and
noisy. Its job is to **orient** you and **not miss the obvious** — map the
contracts/functions/roles into the asset graph and flag candidate issues as
leads. Everything it reports is a **lead to verify**, never a confirmed finding.

## Boundaries (must-read — a violation is out of scope)

This is a **recon / mapping** phase, not exploitation.

| Scope | Allowed | Forbidden |
|---|---|---|
| **Goal** | parse source, list contracts/functions/state/roles, run detectors, read inheritance/call graphs | deploying, sending transactions, signing, any on-chain write, any exploit attempt |
| **Target** | source in the per-intent work dir, or verified source you fetched | live mainnet with real funds; anything outside the authorized audit scope |

A static-analyzer hit is **inferred**, not observed. Record it as a fact with
confidence `inferred`; it becomes a finding only after a worker proves it with a
reproducible PoC (a separate exploitation phase — see the `web3-security-audit`
skill, file 03 §8).

## Preconditions

- Source is available. Either the operator placed it in the work dir, or you
  fetched verified source (e.g. via a block explorer / `cast etherscan-source`)
  into the work dir. **No source → stop and record a fact** saying only bytecode
  is available (decompilation is a different, lower-confidence track).
- Work in the per-intent working dir (where you run other CLIs). Write all
  intermediate output there.

## 1. Check the tools

```bash
slither --version        # Trail of Bits, the standard (~90 detectors + printers)
aderyn --version 2>/dev/null || echo "aderyn not installed (optional)"
```

If `slither` is missing, record a fact that the analyzer is unavailable and fall
back to manual source reading + `foundry` (`forge inspect`) for structure.

## 2. Map the surface first (printers = recon)

Before detectors, use Slither's **printers** to build the asset graph. These
describe structure; they do not judge it.

```bash
slither . --print human-summary        # contracts, # functions, risky features
slither . --print contract-summary     # per-contract function list + visibility
slither . --print function-summary     # per-function: visibility, modifiers, state read/written, external calls
slither . --print inheritance-graph    # inheritance (proxy/abstract hints)
slither . --print call-graph           # who calls whom (external-call surface)
slither . --print modifiers            # which modifiers guard which functions
slither . --print vars-and-auth        # state vars + access-control on setters
```

(For a single file or a non-standard layout, pass the path/target explicitly,
e.g. `slither src/Vault.sol` or point it at the Foundry/Hardhat root.)

Turn the output into asset-graph nodes with **`insert_onchain`**:

- each contract → `type:"contract"` (name, `source_verified`, `compiler`).
- each external/public function → `type:"function"` under the contract's
  `address` (name, `signature`, `visibility`, `mutability`, `modifiers`).
- each privileged role / owner / `onlyX` gate → `type:"role"`.
- each token/oracle/protocol the contract calls into → `type:"external_dep"`
  with the callee `target` address and `dep_kind` (token/oracle/protocol/library).
- notable state variables (balances, price, owner, paused) → `type:"storage_var"`.

When you do not have a real deployed address yet (local source only), use a
stable placeholder address for the contract (e.g. the contract name slug) and
keep members consistent with it — the hierarchy is keyed on that address.

## 3. Run detectors (candidate issues)

```bash
slither . 2>&1 | tee slither.txt                 # all detectors, human-readable
slither . --json slither.json 2>/dev/null || true # machine-readable (optional)
# Focus a class when you have a hypothesis:
slither . --detect reentrancy-eth,reentrancy-no-eth,arbitrary-send-eth,unchecked-lowlevel,unprotected-upgrade,suicidal
```

Triage, do not dump. For each **plausible, in-scope** hit, record a fact
(`record_fact`, confidence `inferred`) that names:

- the contract + function (anchor it to the `function` asset),
- the detector and what it means **in this code's context** (not the generic
  blurb),
- why it may or may not be reachable/exploitable — the next step to confirm.

Suppress the noise: informational/optimization detectors, hits on out-of-scope
files (tests, mocks, libraries), and anything that is clearly a false positive
on a second read. A fact per real lead; not a fact per line of tool output.

## 4. Aderyn (optional, complementary)

If installed, `aderyn` walks the AST and emits a markdown report — fast on large
trees and good at catching things Slither words differently.

```bash
aderyn . && cat report.md      # writes report.md in the work dir
```

Reconcile the two: a lead flagged by both is higher-priority; a lead flagged by
one is still a lead. Same discipline — each real one becomes an `inferred` fact.

## 5. Hand off

After this pass the asset graph should hold the contract, its functions, roles
and external deps, and the exploration graph should hold one `inferred` fact per
real candidate issue. Promising directions (reentrancy on a specific function,
a spot-price read, a missing access-control check) are what the planner turns
into intents and a worker later tries to **prove with a Foundry PoC** — see the
`foundry` skill and the `web3-security-audit` skill for the methodology.

## SWC sweep

This skill is also the **SWC sweep** — the pass that covers the mechanical
weakness catalogue (SWC-100…136). Walk `references/swc-checklist.md`: for each
applicable class, record an `inferred` fact with record_fact's `swc` field set (e.g.
`{"swc":"SWC-107"}`) so per-class coverage is trackable, and let the planner
dispatch intents for the classes not yet covered. SWC is the floor (known
mechanical bugs); the economic/logic bugs go to `foundry-invariant` /
`defi-fork-scenarios`.

Deeper reference (detector catalogue, severity model, what static analysis
catches vs misses): the `web3-security-audit` skill, file 04; the SWC list +
tool/coverage matrix: file 12.

## Provisioning the tools

Run `/opt/web3/verify.sh` inside the worker to list which Web3 CLIs are present; install missing ones with the matching `deploy/web3/install-<family>.sh` (`docs/WEB3-TOOLCHAIN.md`). If a required tool is absent, record a fact that it is unavailable and fall back (manual/static) — never fabricate a result.

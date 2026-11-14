---
name: defi-fork-scenarios
description: Invoke this skill to test economic / composition attacks on a DeFi protocol against a mainnet fork — oracle/price manipulation, flash-loan-funded attacks, sandwich/MEV, first-depositor inflation, governance via borrowed votes. Use it when the target reads a price, holds pooled funds, lends/borrows, mints shares, or runs on-chain governance, and you want to prove an attack using real deployed tokens/pools/oracles in an isolated local fork. Builds PoCs against a fork only — never a live chain with real funds.
---

# DeFi fork scenarios — economic & composition attacks

The highest-loss DeFi bugs are not syntactic; they are **economic**: a price that
can be moved within one transaction, value readable with borrowed capital, a
share price inflatable by a donation. Proving them needs *real deployed state* —
the actual oracle, the actual pool, the actual token — which you get from a
**mainnet fork**, run locally and safely.

## Boundaries (must-read — a violation is out of scope)

| Allowed | Forbidden |
|---|---|
| `anvil --fork-url` / `forge test --fork-url` against real state in a **local fork**; impersonate accounts, grant balances, read oracles/pools | any transaction on a live chain; broadcasting; moving real funds; attacking a protocol you are not authorized to test |

**Isolated lab only.** A fork is a private copy of chain state on your machine.
Nothing here touches the real network. Authorized scope only (audit/bounty/own
code).

## The lens

Assume the attacker has **unlimited capital for one transaction** (flash loans)
and controls **transaction order** (MEV). For every value the contract trusts —
price, balance, totalSupply, vote weight — ask: *can it be moved, inflated, or
reordered within one tx?* If a funds-moving decision reads such a value, there is
likely an attack.

## Setup: fork once, reuse

```bash
anvil --fork-url "$RPC_URL" --fork-block-number <N> &   # pin a block for determinism
# or, per-test, inside Solidity:
#   uint256 fork = vm.createSelectFork(vm.envString("RPC_URL"), <N>);
```

Pinning a block makes runs reproducible (prices/liquidity are fixed) — essential
for a PoC's evidence.

## Scenario playbooks

Each maps to a taxonomy entry (`web3-security-audit` files 02 & 05). Write the PoC
as a Foundry fork test; on success, `report_finding` with the test + trace.

### 1. Oracle / spot-price manipulation
The #1 DeFi pattern. If the target reads a DEX **spot** price (reserve ratio):
1. Flash-loan or swap a large amount into the pool to move the ratio.
2. Trigger the target's price-dependent action (borrow / liquidate / mint) at the
   skewed price.
3. Unwind the swap; assert you extracted value.
Mitigation to verify: TWAP / Chainlink with `updatedAt` staleness + bounds.

### 2. Flash-loan-funded attack
Wrap any capital-gated attack in a flash loan (Aave/Balancer/Uniswap V2/V3):
borrow → manipulate → profit → repay, all in one tx. `vm.prank` the attacker;
assert end balance > start. Proves "the capital barrier is not a defense".

### 3. First-depositor / ERC4626 inflation
`deposit(1 wei)` → `transfer` a large amount directly to the vault → the next
depositor's shares round to 0. Assert the victim is stolen from. Mitigation to
verify: virtual shares/offset or a seeded vault.

### 4. Sandwich / MEV
For a swap/action without slippage (`minAmountOut`) or `deadline`: simulate
buy-before + sell-after around the victim tx (order you control on the fork).
Assert the victim's effective price degraded and you profited.

### 5. Governance via borrowed/flash-loaned votes
Flash-loan the governance token, create/vote a proposal, repay. Assert the
proposal passes on borrowed weight. Mitigation to verify: snapshot/checkpoint
voting power at proposal creation; timelock + quorum.

## Cheatcodes you will use

`vm.createSelectFork` / `vm.rollFork` (fork + move blocks), `vm.prank` /
`vm.startPrank` (impersonate a whale or the protocol), `vm.deal` (ETH),
`deal(token, to, amt)` (forge-std, grant ERC20 balance), `vm.warp` (advance time
for TWAP/vesting), `vm.store` (force a storage value when setup is otherwise
intractable).

## Recording

- A working attack → `report_finding`: `asset_ids` = the affected contract/
  function; `evidence` = the fork PoC + the key trace lines (profit before/after,
  the manipulated price); `traffic_refs` = `[]`; `severity` = impact × likelihood.
- A partial result / a lead you could not fully weaponize → `record_fact`
  (`inferred`) describing the manipulable value and what blocked the full PoC.
- Never claim an economic bug without a fork PoC that nets value — a plausible
  story is a lead, not a finding.

Primitives, mechanics and real hacks behind each scenario: `web3-security-audit`
skill, file 05 (DeFi) and file 02 (taxonomy: SC02 oracle, SC07 flash loans).

## Provisioning the tools

Run `/opt/web3/verify.sh` inside the worker to list which Web3 CLIs are present; install missing ones with the matching `deploy/web3/install-<family>.sh` (`docs/WEB3-TOOLCHAIN.md`). If a required tool is absent, record a fact that it is unavailable and fall back (manual/static) — never fabricate a result.

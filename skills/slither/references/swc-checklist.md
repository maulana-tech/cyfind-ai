# SWC coverage checklist — intent templates for the planner/worker

A concrete, walkable list of the 37 SWC Registry classes (SWC-100…136, the frozen
mechanical-weakness catalogue). Use it two ways:

- **Worker (SWC sweep):** after `slither`/`aderyn`, walk this list and, for each
  class that applies to the target, record an `inferred` fact (or confirm it is
  not present). Pass the SWC id in record_fact.s `swc` field (e.g. `swc:"SWC-107"`) so
  coverage is trackable.
- **Planner (intent seeding):** dispatch an intent for any class not yet covered
  on an in-scope `contract`/`function`. Each row's "probe" is the intent.

SWC is the **floor** (mechanical bugs you must never miss), not the ceiling — the
economic/logic/oracle/governance bugs that cause the real losses are NOT here;
drive those from the DeFi taxonomy (web3-security-audit skill, files 02/05). A
cleared SWC sweep means "no known mechanical bug", not "safe".

Detection key: **S**=static (slither/aderyn), **Y**=symbolic (mythril), **F**=fuzz/invariant (foundry/echidna), **M**=manual read, **P**=needs a PoC to confirm.

## Access control & authorization
- **SWC-100** Function default visibility — probe: any function missing an explicit visibility? [S]
- **SWC-105** Unprotected ether withdrawal — probe: can a non-owner call a path that sends ETH out? [S,Y,P]
- **SWC-106** Unprotected SELFDESTRUCT — probe: is `selfdestruct` reachable without auth? [S,Y,P]
- **SWC-108** State variable default visibility — probe: state vars with no explicit visibility. [S]
- **SWC-112** Delegatecall to untrusted callee — probe: `delegatecall` with a caller-influenced target. [S,Y,P]
- **SWC-115** Authorization through `tx.origin` — probe: any `tx.origin` used for auth. [S]
- **SWC-118** Incorrect constructor name (pre-0.4.22) — probe: a function meant to be the constructor but misnamed. [S,M]
- **SWC-124** Write to arbitrary storage location — probe: an index/offset write a caller controls. [S,Y,P]

## Arithmetic
- **SWC-101** Integer overflow/underflow — probe: unchecked math (pre-0.8, or inside `unchecked{}`), esp. on balances/supply. [Y,F,formal,P]

## Unchecked / low-level calls
- **SWC-104** Unchecked call return value — probe: `.call`/`.send`/token transfer whose bool return is ignored. [S]
- **SWC-113** DoS with failed call (push pattern) — probe: a loop that pushes payments and reverts if one fails. [S,M,P]
- **SWC-134** Message call with hardcoded gas — probe: `.call{gas: N}`/`transfer`'s 2300 breaking under gas-cost changes. [S,M]

## Reentrancy
- **SWC-107** Reentrancy — probe: external call before a state update (CEI violation); try single- and cross-function, read-only. [S,Y,F,P]

## Ordering, time & randomness (MEV-adjacent)
- **SWC-114** Transaction order dependence — probe: outcome depends on tx order / lacks slippage-deadline. [M,P]
- **SWC-116** Block values as a proxy for time — probe: `block.timestamp`/`number` used for critical logic a miner can nudge. [S,M]
- **SWC-120** Weak randomness from chain attributes — probe: `blockhash`/`timestamp`-derived "randomness" for value decisions. [S,M,P]

## Signatures
- **SWC-117** Signature malleability — probe: `ecrecover` without s/v canonicalization. [S,M]
- **SWC-121** Missing signature-replay protection — probe: signed messages without nonce + domain/chainId. [M,P]
- **SWC-122** Lack of proper signature verification — probe: custom auth trusting an unverified signature. [M,P]
- **SWC-133** Hash collisions with multiple variable-length args — probe: `abi.encodePacked` with ≥2 dynamic args into a hash. [S,M]

## Denial of service
- **SWC-126** Insufficient gas griefing — probe: a relay/forwarder where a sub-call can be starved of gas. [M,P]
- **SWC-128** DoS with block gas limit — probe: unbounded loop over caller-growable array. [S,M,P]

## Control flow & storage
- **SWC-109** Uninitialized storage pointer (pre-0.5) — probe: a local struct/array ref defaulting to slot 0. [S,Y]
- **SWC-127** Arbitrary jump with function-type variable — probe: assembly/function-pointer jump a caller can steer. [S,Y]

## Correctness / assertions / compiler hygiene
- **SWC-102** Outdated compiler version — probe: old `solc` with known bugs. [S]
- **SWC-103** Floating pragma — probe: `^`/range pragma instead of a pinned version. [S]
- **SWC-110** Assert violation — probe: reachable `assert` that can fail (invariant breach). [Y,F,formal]
- **SWC-111** Use of deprecated functions — probe: `suicide`/`sha3`/`throw`/`callcode`, etc. [S]
- **SWC-119** Shadowing state variables — probe: a derived/child var shadowing a base one. [S]
- **SWC-123** Requirement violation — probe: a `require` guarding an invariant that can be falsified. [Y,F]
- **SWC-125** Incorrect inheritance order — probe: C3-linearization giving the wrong override. [S,M]
- **SWC-129** Typographical error — probe: `=+`/`=-` and look-alike mistakes in arithmetic. [S,M]
- **SWC-131** Presence of unused variables — probe: dead locals/params (code-smell, sometimes a real omission). [S]
- **SWC-135** Code with no effects — probe: statements that compile but do nothing (a dropped effect). [S,M]

## Traps & data exposure
- **SWC-130** Right-to-left-override (U+202E) in source — probe: hidden control chars reordering displayed code. [S,M]
- **SWC-132** Unexpected ether balance — probe: logic assuming `address(this).balance` only changes via its own accounting (forced via `selfdestruct`/premine). [M,P]
- **SWC-136** Unencrypted private data on-chain — probe: "secret" state read off-chain ("private isn't private"). [M]

---

Record each confirmed/suspected item as a fact anchored to the `function`/
`contract` asset with record_fact.s `swc` field set (findings carry it in `vulnclass`); anything needing a trigger stays a lead
([P]) until a `foundry` PoC proves it (`report_finding`). After the sweep, hand
the uncovered economic/logic directions to `foundry-invariant` / `defi-fork-scenarios`.

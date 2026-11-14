# Example runtime-watch data

Seed data for CYFIND's runtime-watch mode (the Web3 monitoring engine in `watch/`).
These are **example definitions** you load into a running instance — they become
real `watches` rows via the API; they are not a pre-filled database.

## Files
- `watches.sample.json` — four example watches (one per capability).
- `load-watches.sh` — POSTs each to `/api/watches` on a running CYFIND.

## The examples (mapped to bounty-target classes)

| Example | Capability shown | Bounty-target class |
|---|---|---|
| `token-large-transfer` | **event rule** + threshold (large `Transfer`) | token/treasury drains |
| `vault-backing-invariant` | **invariant** `totalAssets() >= totalSupply()` + **pre-exec** | ERC4626 / lending solvency |
| `proxy-upgrade + ownership` | **event rules** (Upgraded / OwnershipTransferred) + **gated Act** (pause) | proxy/admin takeover |
| `oracle-deviation` | **delta rule** (>10% move) | oracle manipulation |

## Before loading — EDIT the JSON
- **`rpc_url`**: set a real endpoint (the watch loop reads from it per block).
- **`address`**: three examples ship **real, verified mainnet** contracts as
  working read-only demos — USDC (`0xA0b8…eB48`), sDAI / Savings DAI
  (`0x83F2…BEeA`, an ERC4626 vault), and the Chainlink ETH/USD feed
  (`0x5f4e…8419`). Still set `rpc_url`, and replace any of them with the
  contract you actually want to watch. The `proxy-upgrade` example is a
  `0x000…000` **placeholder on purpose**: it carries an `Act` (pause) action,
  so point it only at a contract **you are authorized to control**.
- **thresholds**: `min_value` is in token **base units** (mind the decimals);
  `max_bps` is basis points (1000 = 10%).

## What's canonical vs what to verify
The **event `topic0`** hashes and the **function selectors** are canonical and
stable (`Transfer` `0xddf252ad…`, `OwnershipTransferred` `0x8be0079c…`,
`Upgraded` `0xbc7cd75a…`; `totalAssets()` `0x01e1d114`, `totalSupply()`
`0x18160ddd`, `pause()` `0x8456cb59`, `latestAnswer()` `0x50d25bcd`). The three
shipped **addresses** (USDC, sDAI, Chainlink ETH/USD) were verified on Etherscan
at authoring time, but a proxy's implementation can change — **verify every
address against the live contract before relying on it**, and confirm the chosen
selector exists on the target (e.g. an aggregator exposes `latestAnswer()`).

## Load

```bash
export CYFIND_URL=http://localhost:8787
export CYFIND_TOKEN=<your JWT>
./load-watches.sh
```

Then: `GET /api/watches`, `GET /api/watches/{id}/detections`, and (for the
proxy example) `GET /api/watches/{id}/responses`.

## Safety notes (observe-only)
- Every watch here is read-only. The `proxy-upgrade` example uses the **Act**
  tier with a `pause()` action, but Act is **fail-safe**: with no approval Gate
  wired it records a `blocked` response and never sends a transaction. A real
  signing executor + operator-authorization Gate are a deliberate, separate step
  (see `watch/response.go` and the `web3-security-audit` skill ref 13).
- Watch only contracts you are authorized to monitor.

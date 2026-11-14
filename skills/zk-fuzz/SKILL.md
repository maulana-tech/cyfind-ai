---
name: zk-fuzz
description: Invoke this skill to prove (or refute) a ZK circuit soundness bug — searching for a witness that satisfies all constraints yet encodes an invalid computation (an under-constrained forgery), using zkFuzz / Picus / a hand-built second witness, then reporting it. Use it after zk-recon flags a candidate free signal. A witness that produces a valid proof of a false statement is a finding; anything less is a lead. Runs only locally against the circuit — it never submits a forged proof to a live verifier.
---

# ZK fuzz — forge a witness the circuit should have forbidden

`zk-recon` finds candidate free signals; this skill **proves** one is exploitable
by exhibiting a **malicious witness**: a set of signal assignments that satisfies
every constraint but encodes a statement that is false (mint without a deposit,
a nullifier collision, an output that isn't the real computation). If such a
witness yields a valid proof, the circuit is unsound.

> Tools: on a break use `record_counterexample` (the forging witness is the
> counterexample) and `report_finding` (chain-agnostic), anchoring to the `zk`
> assets `zk-recon` created via `insert_onchain` (file 11 §4). All are available.

## Boundaries (must-read — a violation is out of scope)

| Allowed | Forbidden |
|---|---|
| compute witnesses and generate proofs **locally** against the circuit/verifier built in the work dir; search for a forging witness | submitting a forged proof to a live/production verifier; any on-chain action; targeting an out-of-scope system |

**Isolated lab only.** The forged proof is evidence produced and checked locally.
Producing it never means submitting it anywhere.

## The exploit shape

Soundness break = **two distinct witnesses, one statement** (or a witness
encoding a false statement) that both pass. Concretely:
1. take the honest witness for a valid input;
2. find a *second* assignment of the under-constrained signal(s) that still
   satisfies all constraints but changes a meaningful output (the amount, the
   nullifier, the validity flag);
3. generate a proof from that malicious witness and show the verifier **accepts**
   it — proving the statement was never actually constrained.

## 0. Tools & approach

```bash
snarkjs --version 2>/dev/null
# zkFuzz: mutation/TCCT-guided fuzzer for circuit soundness/under-constrained bugs
# Picus: formal under-constrained detection (yields a concrete counterexample)
```

Pick by situation:
- **Picus** — when you want a *formal* answer: it proves a signal is determined,
  or returns two witnesses that differ (the counterexample) directly.
- **zkFuzz** — coverage/mutation fuzzing of the witness generator vs the
  constraints; good when the circuit is large or the bug is in a hint (`<--`).
- **Hand-built second witness** — for a specific `zk-recon` lead, construct the
  malicious assignment by hand with snarkjs (`wtns` / `wtns calculate`), then
  prove+verify it.

## 1. Produce and check the forging witness (snarkjs, groth16 example)

```bash
# honest baseline
snarkjs wtns calculate circuit.wasm input_honest.json witness_honest.wtns
# malicious: a witness file that sets the free signal to a forbidden value but
# still satisfies the R1CS (build it from the Picus/zkFuzz counterexample, or by
# hand for a known free signal)
snarkjs wtns check circuit.r1cs witness_mal.wtns          # does it satisfy ALL constraints?
snarkjs groth16 prove circuit.zkey witness_mal.wtns proof.json public.json
snarkjs groth16 verify vkey.json public.json proof.json   # VERIFIER ACCEPTS a false statement → unsound
```

If `wtns check` passes **and** the verifier accepts a proof whose public signals
encode a false statement, the circuit is unsound — you have the forgery.

## 2. Record the result

- **Fuzzer/formal counterexample** (two witnesses differ, or a forging witness
  found but not yet turned into a full accepted proof) → `record_counterexample`
  (address = the circuit id, name = the soundness invariant's name, summary =
  which signal is free and what it forges, sequence = the counterexample witness
  values, reproduce = the tool/seed or the witness file + command). A lead.
- **Full forgery: a valid proof of a false statement the verifier accepts** →
  `report_finding`:
  - `asset_ids` = the affected `circuit` / `signal` asset ids;
  - `evidence` = the under-constrained signal, the malicious witness, and the
    `verify` output showing acceptance (concise);
  - `traffic_refs` = `[]`; `severity` = impact × likelihood (soundness breaks on a
    funds-bearing verifier are typically critical).
- **No forgery found** → stays a `record_fact` lead, or, if Picus *proved* the
  signal determined, a `record_fact` (confidence `observed`) that the invariant
  holds *under the proven bounds* — never an unbounded "sound" claim.

**Mitigation review (retest):** re-run the forging witness against the patched
circuit; `fixed` only if the malicious witness no longer satisfies the
constraints (now rejected) **and** honest proofs still verify — else
`inconclusive`.

Never submit a forged proof to a live verifier. Deeper reference:
`web3-security-audit` skill, file 08 §3 (soundness, dual-execution-path) and file
04 §4–§5 (fuzzing, formal verification).

## Provisioning the tools

Run `/opt/web3/verify.sh` inside the worker to list which Web3 CLIs are present; install missing ones with the matching `deploy/web3/install-<family>.sh` (`docs/WEB3-TOOLCHAIN.md`). If a required tool is absent, record a fact that it is unavailable and fall back (manual/static) — never fabricate a result.

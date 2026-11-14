---
name: zk-recon
description: Invoke this skill when mapping a zero-knowledge circuit or zkVM for a security review — enumerating the circuit's public/private signals and constraints, identifying which signals may be under-constrained, and running circuit static analysis (circomspect / Picus / Ecne). It records structure into the asset graph and candidate soundness issues as facts, and states the soundness invariant. Recon only — it generates no malicious proofs. Use it before zk-fuzz.
---

# ZK recon — map the circuit, hunt the missing constraint

A ZK circuit proves a statement is true without revealing the witness. The
cardinal failure is the **under-constrained circuit**: a signal the circuit
forgot to constrain leaves a free variable a malicious prover can set to forge a
proof of a *false* statement (a **soundness** break). ~96% of real circuit bugs
are under-constrained (file 08 §3). ZK recon is therefore an inventory of
**signals and the constraints that pin them** — and a search for the ones left
free.

> Tools: records on-chain assets with `insert_onchain` (pass `family:"zk"` or a
> zk `chain`; kinds `circuit` + `signal`; file 11 §4), states the soundness
> property with `record_invariant`, and files candidate issues with
> `record_fact`. All are available.

## Boundaries (must-read — a violation is out of scope)

| Scope | Allowed | Forbidden |
|---|---|---|
| **Goal** | parse the circuit, list signals/constraints, run static analysis, map structure | generating a forged proof against a live verifier; any on-chain submission |
| **Target** | circuit source (circom/halo2/…) / zkVM guest in the work dir, or a target you are authorized to review | a production verifier holding real funds |

A static-analysis hit is **inferred** → `record_fact` with confidence `inferred`;
it becomes a finding only after `zk-fuzz` produces a witness/proof that forges a
false statement.

## Two layers, two failure directions

- **Soundness** — can a prover convince the verifier of a *false* statement?
  (under-constrained → forge). The catastrophic direction; this is the target.
- **Completeness** — can a *true* statement fail to verify? (over-constrained →
  liveness/DoS). Record it, but it is not theft.

## 0. Tools

```bash
circom --version 2>/dev/null; snarkjs --version 2>/dev/null
circomspect --version 2>/dev/null   # Trail of Bits: circom linter (under-constrained signals, etc.)
# Picus (under-constrained detection, formal), Ecne (R1CS soundness), per their workflows
```

For **halo2 / arkworks / plonkish** circuits or a **zkVM** guest (RISC Zero /
SP1), the language differs but the discipline is identical: list signals/columns
and the constraints, find the unconstrained ones. No tool → read the constraints
by hand (that is the core skill anyway).

## 1. Map the circuit structure

```bash
circom circuit.circom --r1cs --sym --wasm   # produces .r1cs (constraints) + .sym (signal names)
snarkjs r1cs info circuit.r1cs              # #constraints, #public/private signals, #wires
snarkjs r1cs print circuit.r1cs circuit.sym # human-readable constraints (for small circuits)
```

Feed into the asset graph with `insert_onchain` (family `zk`):
- the circuit → `kind:"circuit"` (address = the circuit/deployment id or a name
  slug; note the proof system: groth16/plonk/…).
- each **public** signal → `kind:"signal"` (onchain_key = signal name; mark it
  public — these bind the statement).
- each notable **private/intermediate** signal that participates in a
  value-bearing constraint → `kind:"signal"` (mark it private).

You do not need every wire — focus on signals that carry meaning (amounts,
nullifiers, roots, selectors) and the ones feeding the public outputs.

## 2. Hunt under-constrained signals — the review's core

For each signal ask: **is it fully determined by the constraints, or can a prover
choose it freely?** Classic patterns:
- **Missing constraint** — a signal used in an output but never equated to its
  intended value (the `<--` assignment-without-`===` mistake in circom:
  `<--` assigns the witness, `===` adds the constraint; `<--` alone leaves it
  free).
- **Unconstrained selector / boolean** — a "bit" never forced to `0/1`, or a
  mux selector never range-checked, so a prover picks an out-of-range value.
- **Missing range check** — a field element not bounded, enabling overflow/
  aliasing in the prime field.
- **Nondeterministic hints** — `<--` computed values (e.g. a division or inverse)
  whose correctness is not re-asserted with `===`.
- **Unsafe component reuse** — a subcircuit whose outputs are trusted without
  constraining its inputs.

Record each candidate as an `inferred` fact anchored to the `signal`/`circuit`
asset: which signal, why it may be free, and what a forged witness would look
like.

## 3. Static analysis

```bash
circomspect circuit.circom           # flags under-constrained signals, unused signals, side-effect-free asserts
# Picus: formal under-constrained detection; Ecne: proves R1CS determinism — run per their docs
```

Triage each hit into one `inferred` fact in context. These tools miss semantic/
spec bugs (the constraint is present but encodes the *wrong* statement) — those
need manual reading and `zk-fuzz`.

## 4. State the soundness invariant & hand off

`record_invariant` for the property that must hold — the canonical one is
**"no prover can produce a valid proof of a false statement"**, plus
circuit-specific ones ("the nullifier is a deterministic function of the secret",
"the output equals the claimed computation"). These anchor what `zk-fuzz` tries
to break.

After this pass the asset graph holds the circuit + its signals, and the
exploration graph holds one `inferred` fact per candidate under-constrained
signal. Beyond the circuit, remember the **rest of the pipeline is in scope too**
(file 08 §3): trusted-setup handling, the on-chain verifier, and proof-system
plumbing — not only the arithmetic.

Deeper reference: `web3-security-audit` skill, file 08 §3 (ZK) and file 04 §5
(formal verification).

## Provisioning the tools

Run `/opt/web3/verify.sh` inside the worker to list which Web3 CLIs are present; install missing ones with the matching `deploy/web3/install-<family>.sh` (`docs/WEB3-TOOLCHAIN.md`). If a required tool is absent, record a fact that it is unavailable and fall back (manual/static) — never fabricate a result.

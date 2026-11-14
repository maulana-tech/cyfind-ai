#!/usr/bin/env bash
# ZK toolchain: snarkjs (npm) is required; circomspect (cargo) and circom (built
# from its Rust source) are best-effort. Picus / Ecne / zkFuzz are research tools
# installed per their own repos when a deep soundness pass is needed. Run
# install-common.sh first.
set -euo pipefail
export PATH="$HOME/.cargo/bin:$PATH"

# snarkjs — required (witness/proof generation + verification).
npm install -g snarkjs
snarkjs --help >/dev/null 2>&1 && echo "snarkjs OK"

if command -v cargo >/dev/null 2>&1; then
  cargo install circomspect || echo "WARN: circomspect install failed"
  # circom is distributed as Rust source; build it once into cargo's bin dir.
  if ! command -v circom >/dev/null 2>&1; then
    git clone --depth 1 https://github.com/iden3/circom.git /tmp/circom
    ( cd /tmp/circom && cargo build --release && cp target/release/circom "$HOME/.cargo/bin/" )
    rm -rf /tmp/circom
  fi
fi
circom --version 2>/dev/null || echo "WARN: circom not available (hand-review constraints)"

echo "ZK toolchain done (snarkjs required ok; circom/circomspect best-effort)"

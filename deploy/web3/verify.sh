#!/usr/bin/env bash
# Report which Web3 CLIs are present and their versions. Informational — always
# exits 0. Run it inside a worker container to see what the Web3 skills can use;
# anything marked ✗ means the matching skill will fall back ("tool unavailable").
export PATH="$HOME/.foundry/bin:$HOME/.cargo/bin:$HOME/.local/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"

check() {
  if command -v "$1" >/dev/null 2>&1; then
    printf '  \342\234\223 %-12s %s\n' "$1" "$("$1" --version 2>&1 | head -1)"
  else
    printf '  \342\234\227 %-12s (missing)\n' "$1"
  fi
}

echo "EVM:";    for t in forge cast anvil slither halmos aderyn solc; do check "$t"; done
echo "Solana:"; for t in solana anchor; do check "$t"; done
echo "Move:";   for t in sui aptos; do check "$t"; done
echo "ZK:";     for t in snarkjs circom circomspect; do check "$t"; done
exit 0

#!/usr/bin/env bash
# EVM toolchain: Foundry (forge/cast/anvil/chisel), Slither + a pinned solc,
# Halmos, and Aderyn. This is the implemented/tested family, so it FAILS HARD:
# if forge/slither/halmos do not install, the script (and the image build) stop.
# Run install-common.sh first. Pin SOLC_VERSION via env for a different target.
set -euo pipefail
export PATH="$HOME/.foundry/bin:$HOME/.cargo/bin:$HOME/.local/bin:$PATH"

SOLC_VERSION="${SOLC_VERSION:-0.8.24}"

# Foundry — forge/cast/anvil/chisel. foundryup installs the stable release;
# pass `foundryup --version <tag>` to pin a specific one.
curl -L https://foundry.paradigm.xyz | bash
"$HOME/.foundry/bin/foundryup"

# Slither + solc manager. Debian's pip needs --break-system-packages (PEP 668).
pip3 install --no-cache-dir --break-system-packages slither-analyzer solc-select crytic-compile
solc-select install "$SOLC_VERSION"
solc-select use "$SOLC_VERSION"

# Halmos (bounded symbolic execution; pulls z3 via pip).
pip3 install --no-cache-dir --break-system-packages halmos

# Aderyn (Cyfrin) complements Slither; best-effort so a flaky network installer
# does not fail the whole EVM layer (Slither is the primary static analyzer).
if ! { curl -L https://raw.githubusercontent.com/Cyfrin/aderyn/dev/cyfrinup/install | bash; }; then
  echo "WARN: aderyn installer failed; continuing without it"
fi
"$HOME/.cyfrin/bin/cyfrinup" 2>/dev/null || true

# Hard verification of the required tools.
forge --version
cast --version
anvil --version
slither --version
halmos --version
echo "EVM toolchain OK"

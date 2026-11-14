#!/usr/bin/env bash
# Move toolchain: the Aptos CLI installs cleanly from its official script; the
# Sui CLI is best obtained as a RELEASE BINARY (building from source is very
# heavy). This script installs Aptos and, only when SUI_FROM_SOURCE=1, builds Sui
# from source; otherwise it expects a `sui` binary to be dropped on PATH. Run
# install-common.sh first.
set -euo pipefail
export PATH="$HOME/.cargo/bin:$HOME/.local/bin:$PATH"

# Aptos CLI (official installer) — required.
curl -fsSL https://aptos.dev/scripts/install_cli.py | python3
aptos --version

# Sui CLI — prefer a release binary from https://github.com/MystenLabs/sui/releases
# placed on PATH. Optional heavy source build behind a flag:
if [ "${SUI_FROM_SOURCE:-0}" = "1" ] && command -v cargo >/dev/null 2>&1; then
  cargo install --git https://github.com/MystenLabs/sui.git --branch mainnet sui --locked \
    || echo "WARN: sui source build failed; drop a release binary on PATH instead"
fi
if command -v sui >/dev/null 2>&1; then
  sui --version
else
  echo "NOTE: 'sui' not on PATH — download a release binary for Sui audits (Aptos is ready)"
fi

echo "Move toolchain done"

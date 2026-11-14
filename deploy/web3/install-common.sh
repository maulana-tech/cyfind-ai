#!/usr/bin/env bash
# Shared prerequisites for the CYFIND Web3 toolchains: a C toolchain, pip, and
# Rust (cargo), which several tools (aderyn, circomspect, anchor, sui) build with.
# Idempotent and safe to run standalone inside a running worker container, or as
# a layer in Dockerfile.web3. Run as root (the container's default user).
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends \
  build-essential pkg-config libssl-dev ca-certificates curl wget git unzip \
  python3-pip python3-venv
rm -rf /var/lib/apt/lists/*

# Rust / cargo — idempotent (rustup is a no-op if already present).
if ! command -v cargo >/dev/null 2>&1 && [ ! -x "$HOME/.cargo/bin/cargo" ]; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path
fi

echo "common prerequisites installed"

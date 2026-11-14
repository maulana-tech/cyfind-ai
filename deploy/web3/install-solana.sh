#!/usr/bin/env bash
# Solana toolchain: the Solana (Agave) CLI is required; Anchor (via avm) and the
# JS test runtimes (litesvm/bankrun) are best-effort because they build with
# cargo / pull from npm and are heavier. Run install-common.sh first.
set -euo pipefail
export PATH="$HOME/.cargo/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Solana CLI (Agave) — required.
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
solana --version

# Anchor via avm (needs cargo) — best-effort.
if command -v cargo >/dev/null 2>&1; then
  cargo install --git https://github.com/coral-xyz/anchor avm --locked --force \
    || echo "WARN: avm install failed; install Anchor manually if needed"
  { avm install latest && avm use latest; } || echo "WARN: anchor toolchain not set"
fi

# JS runtimes used by solana-poc (fast in-process SVM tests) — best-effort.
npm install -g litesvm solana-bankrun || echo "WARN: npm solana test libs failed"

echo "Solana toolchain done (CLI required ok; anchor/js best-effort)"

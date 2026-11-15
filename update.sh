#!/usr/bin/env bash
# CYFIND update script: (1) Docker update (pull new image, rebuild)  (2) local build update (rebuild binary)
# Counterpart to install.sh: install handles the first setup, update upgrades to a new version.
# No manual DB migration needed — cyfind idempotently re-runs schema.sql on every startup (including
# ADD COLUMN/CREATE INDEX IF NOT EXISTS), so "restart = migration". Data (pgdata volume, ./data, ./skills) is unaffected.
set -euo pipefail
cd "$(cd "$(dirname "$0")" && pwd)"

info(){ printf '\033[36m[*]\033[0m %s\n' "$*"; }
ok(){   printf '\033[32m[+]\033[0m %s\n' "$*"; }
warn(){ printf '\033[33m[!]\033[0m %s\n' "$*"; }
die(){  printf '\033[31m[x]\033[0m %s\n' "$*" >&2; exit 1; }
ask(){  local p="$1" d="${2:-}" a; read -rp "$p${d:+ [$d]}: " a; echo "${a:-$d}"; }

# ── Optional: sync the repo to the latest code (compose/scripts/local build source all update through it) ───────
sync_repo(){
  [ -d .git ] && command -v git >/dev/null 2>&1 || { warn "Not a git working copy, skipping git pull"; return; }
  [ "$(ask 'Pull the latest code (git pull --ff-only)? (y/n)' y)" = y ] || return
  if ! git pull --ff-only; then
    warn "git pull could not fast-forward (local changes or diverged branch) — resolve manually and retry; using current code this time"
  fi
}

# ── (1) Docker update ───────────────────────────────
update_docker(){
  command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1 \
    || die "docker / docker compose not detected, run ./install.sh to deploy first"
  [ -f .env ] || die ".env not found, run ./install.sh to complete the first deployment first"

  # Optional: upgrade to a specific version tag (empty reuses CYFIND_TAG in .env, defaulting to latest)
  local tag; tag="$(ask 'Target image tag (Enter to reuse .env / latest)' '')"
  if [ -n "$tag" ]; then
    if grep -q '^CYFIND_TAG=' .env; then
      sed -i.bak "s|^CYFIND_TAG=.*|CYFIND_TAG=${tag}|" .env && rm -f .env.bak
    else
      printf '\nCYFIND_TAG=%s\n' "$tag" >> .env
    fi
    ok "Set CYFIND_TAG to ${tag}"
  fi

  # Only touch cyfind: postgres is pinned to 16-alpine and does not need upgrading (pulling it just
  # wastes bandwidth, and a major version change risks compatibility issues). cyfind declares
  # depends_on postgres, so an up with the service name auto-starts pg if it is down and leaves a
  # running one untouched without rebuilding.
  info "Pulling the new image (cyfind only)…"
  docker compose pull cyfind
  info "Rebuilding and starting (cyfind auto-migrates the schema on restart)…"
  docker compose up -d cyfind
  ok "Update complete → http://localhost:8787"
  info "View logs: docker compose logs -f cyfind"
  info "Prune old images (optional): docker image prune -f"
}

# ── (2) local build update ──────────────────────────────
update_local(){
  command -v go >/dev/null 2>&1 || die "Go not detected (>=1.26): https://go.dev/dl/"
  [ -f config.json ] || warn "config.json not found — for a first deployment use ./install.sh instead"
  ok "Go: $(go version)"

  if command -v npm >/dev/null 2>&1; then
    info "Rebuilding frontend static output…"
    ( cd web && npm ci && npm run build:static )
    rm -rf server/webui/dist && cp -r web/out server/webui/dist
    info "Recompiling the single binary with embedded frontend…"
    CGO_ENABLED=0 go build -tags embedui -trimpath -o cyfind ./cmd/cyfind
  else
    warn "npm not detected: compiling the backend WITHOUT an embedded frontend (run the frontend separately with npm run dev)"
    CGO_ENABLED=0 go build -o cyfind ./cmd/cyfind
  fi
  ok "Build complete → ./cyfind"
  warn "Restart the running cyfind process to take effect (it auto-migrates the schema on restart)"
}

echo "=============================="
echo "  CYFIND update"
echo "  1) Docker update (pull new image, rebuild)"
echo "  2) Local update (go recompile)"
echo "=============================="
case "$(ask 'Choice' 1)" in
  1) sync_repo; update_docker ;;
  2) sync_repo; update_local ;;
  *) die "Invalid choice" ;;
esac

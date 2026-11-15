#!/usr/bin/env bash
# CYFIND install script: (1) all-Docker  (2) build and run locally
set -euo pipefail
cd "$(cd "$(dirname "$0")" && pwd)"

info(){ printf '\033[36m[*]\033[0m %s\n' "$*"; }
ok(){   printf '\033[32m[+]\033[0m %s\n' "$*"; }
warn(){ printf '\033[33m[!]\033[0m %s\n' "$*"; }
die(){  printf '\033[31m[x]\033[0m %s\n' "$*" >&2; exit 1; }
ask(){  local p="$1" d="${2:-}" a; read -rp "$p${d:+ [$d]}: " a; echo "${a:-$d}"; }
rand(){ head -c 18 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 24; }

# ── docker environment detection / auto-install ───────────────────
ensure_docker(){
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    ok "Detected docker and docker compose"; return
  fi
  warn "docker / docker compose not detected"
  case "$(uname -s)" in
    Linux)
      if [ "$(ask 'Auto-install Docker? (y/n)' y)" = y ]; then
        curl -fsSL https://get.docker.com | sh
        sudo usermod -aG docker "$USER" || true
        ok "Docker installed (group change requires re-login to use without sudo)"
      else
        die "Please install docker yourself and retry"
      fi ;;
    Darwin) die "On macOS install Docker Desktop: https://www.docker.com/products/docker-desktop/" ;;
    *)      die "Please install docker yourself and retry" ;;
  esac
}

# ── (1) all-Docker ───────────────────────────────
install_docker(){
  ensure_docker
  if [ ! -f .env ]; then
    cp .env.example .env 2>/dev/null || true
    local pw key
    pw="$(ask 'Postgres password (Enter to generate a random one)' "$(rand)")"
    key="$(ask 'ANTHROPIC_API_KEY (may be left empty, configure later in the UI)' '')"
    sed -i.bak "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${pw}|" .env
    sed -i.bak "s|^ANTHROPIC_API_KEY=.*|ANTHROPIC_API_KEY=${key}|" .env
    rm -f .env.bak
    ok "Generated .env (POSTGRES_PASSWORD set)"
  else
    info "Reusing existing .env"
  fi
  info "Pulling images and starting…"
  docker compose pull || true
  docker compose up -d
  ok "Started → http://localhost:8787"
  info "View logs: docker compose logs -f cyfind"
}

# ── (2) build and run locally ──────────────────────────────
install_local(){
  echo "Database setup method:"
  echo "  1) Connect to an existing PostgreSQL"
  echo "  2) Start a PostgreSQL with Docker (requires docker)"
  case "$(ask 'Choice' 1)" in
    2)
      ensure_docker
      local pw; pw="$(ask 'Postgres password (Enter for random)' "$(rand)")"
      docker run -d --name cyfind-pg -p 5432:5432 \
        -e POSTGRES_USER=cyfind -e POSTGRES_PASSWORD="$pw" -e POSTGRES_DB=cyfind \
        -v cyfind-pg:/var/lib/postgresql/data postgres:16-alpine
      DB_HOST=127.0.0.1 DB_PORT=5432 DB_USER=cyfind DB_PASS="$pw" DB_NAME=cyfind DB_SSL=disable ;;
    *)
      DB_HOST="$(ask 'Database host' 127.0.0.1)"
      DB_PORT="$(ask 'Port' 5432)"
      DB_USER="$(ask 'User' cyfind)"
      DB_PASS="$(ask 'Password' '')"
      DB_NAME="$(ask 'Database name' cyfind)"
      DB_SSL="$(ask 'sslmode (disable/require)' disable)" ;;
  esac

  # Generate config.json
  cat > config.json <<JSON
{
  "database": {
    "host": "${DB_HOST}",
    "port": ${DB_PORT},
    "user": "${DB_USER}",
    "password": "${DB_PASS}",
    "dbname": "${DB_NAME}",
    "sslmode": "${DB_SSL}"
  }
}
JSON
  ok "Generated config.json"

  # Go environment check
  command -v go >/dev/null 2>&1 || die "Go not detected, please install Go (>=1.26) first: https://go.dev/dl/"
  ok "Go: $(go version)"

  # Embedding the frontend needs node to produce the static output
  if command -v npm >/dev/null 2>&1; then
    info "Building frontend static output…"
    ( cd web && npm ci && npm run build:static )
    rm -rf server/webui/dist && cp -r web/out server/webui/dist
    info "Compiling the single binary with embedded frontend…"
    CGO_ENABLED=0 go build -tags embedui -trimpath -o cyfind ./cmd/cyfind
  else
    warn "npm not detected: will compile the backend WITHOUT an embedded frontend (run the frontend separately with npm run dev)"
    CGO_ENABLED=0 go build -o cyfind ./cmd/cyfind
  fi
  ok "Build complete → ./cyfind"

  info "Starting… (Ctrl-C to exit)"
  ./cyfind
}

echo "=============================="
echo "  CYFIND install"
echo "  1) All-Docker install"
echo "  2) Run locally (go build)"
echo "=============================="
case "$(ask 'Choice' 1)" in
  1) install_docker ;;
  2) install_local ;;
  *) die "Invalid choice" ;;
esac

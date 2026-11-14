# AGENTS.md

CYFIND: AI autonomous pentest system. Go monolith backend (net/http + pgx/PostgreSQL) with a
Next.js frontend statically exported and embedded via `go:embed`. Docs/comments are largely
Chinese — that is the house style, not an anomaly.

## Architecture (what actually runs)

- `cmd/cyfind` — the only binary. Flags: `-addr :8787`, `-data <dir>`, `-proxy 127.0.0.1:8788`
  (traffic-recording MITM proxy, empty to disable).
- `server/` — HTTP API, JWT auth, SSE, `Manager` (lifecycle), and the task `Engine`
  (`engine.go`: per-task planner loop + N workers). Frontend serving is build-tag gated:
  `webui_embed.go` (`embedui`) vs `webui_stub.go` (`!embedui`).
- `agent/` — LLM agents (planner / worker / mainagent / retester) built on the `norma` SDK.
- `db/` — Postgres access; `schema.sql` is `go:embed`'d and re-run **idempotently on every
  startup** ("restart = migration"). Any DDL you add to `schema.sql` MUST be idempotent
  (`IF NOT EXISTS`, guarded `ADD COLUMN`). No manual migration step exists.
- `config/` — config resolution. Precedence: env `CYFIND_PG_DSN` > `config.json` `database` >
  error (no silent default). `config.json` is looked up in CWD first, then next to the binary;
  `CYFIND_CONFIG` overrides. `BaseDir()` falls back to CWD under `go run`.
- Support packages: `traffic` (MITM recorder), `guard`/`intercept` (tool-approval gate),
  `enrich`, `llmpool`, `llmrec`, `mcphttp`, `notify`, `report`, `selfupdate`, `sidequestion`.
- `skills/` — runtime-loaded agent skills, mounted/copied into releases and Docker. Shipped
  skills live here (`api-recon`, `playwright-cli`, `scopesentry`).

## Commands

```bash
./dev.sh                       # backend :8787 + proxy :8788 + next dev :5173 (all-in-one dev)
go run ./cmd/cyfind             # backend only, NO embedded frontend (needs Postgres config)
go test ./...                  # Go tests (see DB note below)
./build.sh                     # build current platform with embedded frontend
./build.sh --release           # cross-platform zips into dist/
```

Frontend (`web/`):

```bash
npm ci
npm run dev                    # Next dev; /api/* proxied to :8787 (override: AUTOPENTEST_API)
NEXT_PUBLIC_MOCK=1 npm run dev # mock preview, no backend
npm run build:static           # static export → web/out (NEXT_EXPORT=1 next build)
npm run check                  # biome lint+format check (fix: npm run check:fix)
npm run generate:presets       # regenerate theme metadata after adding a style preset
```

## Gotchas an agent will hit

- **Embedded-frontend builds fail without `server/webui/dist`**, which is gitignored. The full
  build is: `cd web && npm ci && npm run build:static && cd ..` → copy/sync `web/out/` into
  `server/webui/dist/` → `CGO_ENABLED=0 go build -tags embedui -o cyfind ./cmd/cyfind`. `build.sh`
  automates this. `CYFIND_SKIP_FRONTEND=1` reuses an existing `server/webui/dist`.
- **Go tests in `db/`, `agent/`, `server/` need a reachable PostgreSQL** (`CYFIND_PG_DSN` env or
  `config.json`). Without one they skip themselves rather than fail — a green run may mean
  nothing was tested. Those three packages take Postgres advisory lock `7337741002` in
  `TestMain` to serialize against a shared dev DB; don't point multiple concurrent test runs at
  the same database.
- **`server/webui` is served publicly** (auth is client-side + on `/api` only). Don't assume
  routes outside `/api` are protected.
- **Frontend is a static export, not a Node server.** `NEXT_EXPORT=1 next build` bakes
  `NEXT_PUBLIC_*` env at build time (e.g. `NEXT_PUBLIC_SSE_BASE` is fixed in the bundle —
  setting it in the container does nothing). Dev-only `next dev` rewrites `/api` to the backend.
- **Theme presets are generated code.** `web/src/lib/preferences/theme.ts` is produced by
  `npm run generate:presets` from `web/src/styles/presets/*.css`; the husky pre-commit hook
  regenerates and `git add`s it. After adding a preset, run the script. `src/components/ui/`
  and `src/components/calendar/` are shadcn-generated and excluded from Biome.
- **Self-update exit codes are a protocol.** `main` maps `run()`'s return onto the process exit
  code; `start.sh`/`start.bat` (the supervised entrypoints in release zips) relaunch the binary
  on the restart exit code. Keep startup logic in functions that `return` — don't call `os.Exit`
  past pending defers (see `cmd/cyfind/main.go`).
- **Version string**: injected via `-ldflags "-X main.version=..."` by `build.sh`; defaults to
  `dev`. A `dev`/suffixed version disables the in-app updater by design.
- **CI** (`.github/workflows/release.yml`) only runs on `v*` tags: static-export frontend once,
  cross-compile 5 targets, zip + SHA256SUMS, push Docker image `autumn27/cyfind`. No lint/test
  gate in CI — verify locally: `go vet ./...`, `go test ./...`, `cd web && npm run check`.

## Conventions

- LLM config via env `ANTHROPIC_API_KEY`/`OPENAI_API_KEY` (or UI); optional
  `CYFIND_LLM_PROVIDER`/`CYFIND_LLM_MODEL`/`CYFIND_LLM_BASE_URL`/`CYFIND_LLM_PROXY`.
- License is AGPL-3.0 with explicit "isolated lab / no real targets only" restrictions — keep
  that framing in any docs you touch.
- The dual-graph data model (global asset graph + per-task exploration graph linked by
  `exploration_anchors`) is the core domain concept; README's architecture section documents it.

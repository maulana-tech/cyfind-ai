# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> A detailed `AGENTS.md` already exists at the repo root. It is the authoritative source for
> build mechanics and the gotchas an agent will hit — read it. This file captures the big-picture
> architecture and the commands you need most, and does not repeat `AGENTS.md` in full.

## What CYFIND is

Multi-agent LLM system for **autonomous penetration testing in an isolated lab**. Go monolith
backend (`net/http` + pgx/PostgreSQL) serving a Next.js frontend that is statically exported and
embedded via `go:embed`. Agent capabilities come from the external `norma` SDK
(`github.com/Autumn-27/norma`: `agentcore` / `tool` / `permission` / `harness` / `memory` /
`transcript`). Docs and comments are largely **Chinese** — that is the house style.

AGPL-3.0 with an explicit "isolated lab / no real targets" restriction — preserve that framing in
any docs you touch.

## Core architecture: the dual-graph model

This is the central domain concept; everything else serves it.

- **Asset graph** (`assets` / `companies` / `task_scope`) — a **global, cross-task** source of
  truth for discovered assets. Nodes: `root_domain / subdomain / ip / service / app / endpoint`,
  owned by a company. Parent/child relationships and dedup keys are **computed by the program**;
  agents only submit raw observations.
- **Exploration graph** (`exploration_nodes` / `activity`, per task) — the **reasoning/progress
  trace** of one task. Nodes: `goal / intent / fact / finding / hint`, connected by lineage edges
  (`spawns / derived_from / yields / proves`).
- **The two graphs are joined by anchors**: `exploration_anchors(node_id, asset_id)` ties an
  intent/fact/finding to a concrete asset. This powers per-asset test coverage and the coverage map.

### Engine + intent lifecycle (the exploration loop)

The task `Engine` (`server/engine.go`) is **event-driven**: a graph change wakes the **planner**,
which emits **intents** into a frontier; **workers** each claim **one intent**, execute with real
tools, write new assets/facts/findings back into both graphs, and stop. The write-back triggers the
next round, until a goal is proven (`prove_goal`). Per task: one `plannerLoop` goroutine + N worker
goroutines (worker concurrency is set in System Settings, default 3).

Two autonomy mechanisms layered on top:
- **Worker-to-worker process-level exchange**: workers can search each other's *execution steps*
  (`search_all_worker_traces`, `list_worker_traces`, `get_worker_trace`) so observations flow
  between workers even before they become formal facts — each worker still only works its own intent.
- **Planner shared todolist**: the planner is woken fresh each time (new session per wake-up) but
  keeps a **per-task, cross-wake-up todolist**, so a serial exploitation chain is recorded once and
  dispensed step-by-step across rounds rather than fanned out all at once.

## Layout

- `cmd/cyfind` — the only binary. Flags: `-addr :8787`, `-data <dir>`,
  `-proxy 127.0.0.1:8788` (traffic-recording MITM proxy; `-proxy ""` disables).
- `server/` — HTTP API, JWT auth, SSE, `Manager` (lifecycle), the `Engine`. Frontend serving is
  build-tag gated: `webui_embed.go` (`embedui`) vs `webui_stub.go` (`!embedui`).
- `agent/` — the LLM agents (planner / worker / mainagent / retester) built on `norma`;
  `ToolSet` exposes the dual graph as LLM tools.
- `db/` — Postgres access (pgx). `schema.sql` is `go:embed`'d and re-run **idempotently on every
  startup** ("restart = migration"). Any DDL you add MUST be idempotent (`IF NOT EXISTS`, guarded
  `ADD COLUMN`) — there is no manual migration step.
- `config/` — resolution precedence: env `CYFIND_PG_DSN` > `config.json` `database` > error (no
  silent default). `config.json` is found in CWD first, then next to the binary; `CYFIND_CONFIG`
  overrides.
- Support packages: `traffic` (MITM recorder), `guard`/`intercept` (tool-approval gate), `enrich`,
  `llmpool`, `llmrec`, `mcphttp`, `notify`, `report`, `selfupdate`, `sidequestion`.
- `skills/` — runtime-loaded agent skills, mounted/copied into releases and Docker
  (`api-recon`, `playwright-cli`, `scopesentry`).
- `web/` — Next.js frontend (static export).

## Commands

```bash
./dev.sh                       # all-in-one dev: backend :8787 + proxy :8788 + next dev :5173
go run ./cmd/cyfind             # backend only, NO embedded frontend (needs a Postgres config)
go test ./...                  # Go tests (see DB note below)
go test ./agent/ -run TestName # a single Go test
go vet ./...                   # CI has no lint/test gate — verify locally
./build.sh                     # build current platform with embedded frontend
./build.sh --release           # cross-platform zips into dist/
```

Frontend (`web/`):

```bash
npm ci
npm run dev                    # Next dev; /api/* proxied to :8787 (override: AUTOPENTEST_API)
NEXT_PUBLIC_MOCK=1 npm run dev # mock preview, no backend
npm run build:static           # static export → web/out
npm run check                  # biome lint+format (fix: npm run check:fix)
npm run generate:presets       # regenerate theme metadata after adding a style preset
```

LLM config: env `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` (or via UI); optional
`CYFIND_LLM_PROVIDER` / `CYFIND_LLM_MODEL` / `CYFIND_LLM_BASE_URL` / `CYFIND_LLM_PROXY`.

## Gotchas that will bite you (see AGENTS.md for the full list)

- **`go test` in `db/`, `agent/`, `server/` silently SKIPS without a reachable PostgreSQL**
  (`CYFIND_PG_DSN` or `config.json`) — a green run may mean nothing ran. Those three packages take
  advisory lock `7337741002` in `TestMain` to serialize against a shared dev DB; don't point
  concurrent test runs at the same database.
- **Embedded-frontend builds fail without `server/webui/dist`** (gitignored). Full build:
  `cd web && npm ci && npm run build:static && cd ..` → sync `web/out/` into `server/webui/dist/` →
  `CGO_ENABLED=0 go build -tags embedui -o cyfind ./cmd/cyfind`. `build.sh` automates this;
  `CYFIND_SKIP_FRONTEND=1` reuses an existing dist.
- **The frontend is a static export, not a Node server.** `NEXT_PUBLIC_*` env is baked at build
  time (e.g. `NEXT_PUBLIC_SSE_BASE`); setting it in the container at runtime does nothing. Only
  `next dev` rewrites `/api`.
- **`server/webui` is served publicly** — auth is client-side + on `/api` only. Don't assume routes
  outside `/api` are protected.
- **Theme presets are generated code.** `web/src/lib/preferences/theme.ts` is produced by
  `npm run generate:presets` from `web/src/styles/presets/*.css` (a husky pre-commit hook
  regenerates and `git add`s it). `src/components/ui/` and `src/components/calendar/` are
  shadcn-generated and excluded from Biome.
- **Self-update exit codes are a protocol.** `main` maps `run()`'s return onto the process exit
  code; `start.sh`/`start.bat` relaunch the binary on the restart code. Keep startup logic in
  functions that `return` — don't `os.Exit` past pending defers.
- **Version string** is injected via `-ldflags "-X main.version=..."`; a `dev`/suffixed version
  disables the in-app updater by design.

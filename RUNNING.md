# Menjalankan CYFIND

Step-by-step menjalankan CYFIND berdasarkan config repo.

## Prasyarat

- **PostgreSQL** (wajib) — backend tidak punya default DB, tanpa konfigurasi langsung error saat startup
- **Go 1.26+** dan **Node.js/npm** (untuk frontend), atau cukup **Docker**

## Opsi 1 — Docker Compose (paling mudah)

```bash
cp .env.example .env        # isi POSTGRES_PASSWORD, opsional ANTHROPIC_API_KEY
docker compose up -d        # container cyfind + postgres
```

Buka **http://localhost:8787** → halaman `/setup` untuk set password admin.

## Opsi 2 — Dev mode (backend + frontend hot-reload)

Siapkan DSN Postgres dulu lewat salah satu cara:

```bash
export CYFIND_PG_DSN="postgres://cyfind:password@127.0.0.1:5432/cyfind?sslmode=disable"
# atau buat config.json (lihat config.example.json)
```

Lalu:

```bash
./dev.sh
# backend     :8787  (+ proxy traffic :8788)
# frontend    http://localhost:5173  (next dev, /api di-proxy ke :8787)
```

Kalau backend doang: `go run ./cmd/cyfind` (tanpa frontend).

## Opsi 3 — Single binary (frontend ter-embed)

```bash
# 1) build frontend static export
cd web && npm ci && npm run build:static && cd ..

# 2) copy ke direktori embed
cp -r web/out server/webui/dist

# 3) compile dengan tag embedui (tanpa tag ini frontend TIDAK ikut)
CGO_ENABLED=0 go build -tags embedui -o cyfind ./cmd/cyfind

./start.sh                  # start.sh adalah entrypoint resmi (auto-relaunch saat update)
```

Atau cukup `./build.sh` — script ini otomatis menjalankan ketiga langkah di atas.

## Setelah jalan

1. Buka `http://localhost:8787` → `/setup` → set password admin
2. Set LLM: env `ANTHROPIC_API_KEY` atau `OPENAI_API_KEY`, atau lewat halaman "LLM Config" di UI
3. Konkurensi worker per-task bisa diatur di System Settings (default 3)

## Catatan penting

- **Schema DB otomatis** — `schema.sql` dijalankan ulang idempoten setiap startup, tidak perlu migrasi manual
- **Proxy traffic** (`-proxy 127.0.0.1:8788`) bisa dimatikan dengan flag `-proxy ""`
- **Test** (`go test ./...`) juga butuh Postgres terjangkau — tanpa itu test di package `db`/`agent`/`server` akan skip, bukan fail
- Hanya untuk lab terisolasi — jangan dipakai target sistem nyata (lihat disclaimer README)

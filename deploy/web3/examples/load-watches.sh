#!/usr/bin/env bash
# Load example runtime-watches into a RUNNING CYFIND instance via the API.
# Requires the app to be up (with Postgres) and a logged-in JWT.
#
#   export CYFIND_URL=http://localhost:8787        # default
#   export CYFIND_TOKEN=<your JWT>                 # from login (cyfind_token cookie / API)
#   ./load-watches.sh [watches.sample.json]
#
# Before loading: edit the JSON — set a real rpc_url and replace placeholder
# (0x000…000) addresses with the contracts you are authorized to watch.
set -euo pipefail

CYFIND_URL="${CYFIND_URL:-http://localhost:8787}"
: "${CYFIND_TOKEN:?set CYFIND_TOKEN to a logged-in JWT}"
FILE="${1:-$(dirname "$0")/watches.sample.json}"

command -v jq >/dev/null 2>&1 || { echo "this loader needs jq"; exit 1; }

count="$(jq 'length' "$FILE")"
echo "loading $count watch(es) from $FILE into $CYFIND_URL ..."
for i in $(seq 0 $((count - 1))); do
  name="$(jq -r ".[$i]._name // (\"watch \" + ($i|tostring))" "$FILE")"
  body="$(jq -c ".[$i] | del(._name, ._note)" "$FILE")"
  if resp="$(curl -fsS -X POST "$CYFIND_URL/api/watches" \
      -H "Authorization: Bearer $CYFIND_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$body")"; then
    echo "  ok: $name -> $resp"
  else
    echo "  FAILED: $name"
  fi
done

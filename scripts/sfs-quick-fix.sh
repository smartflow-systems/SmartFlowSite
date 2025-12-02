#!/usr/bin/env bash
# Purpose: fast sanity (internet, placeholder URL), DNS, health, auth
set -euo pipefail

echo "== Network sanity =="
curl -sS https://example.com >/dev/null && echo "OK: Internet reachable." || { echo "❌ No internet from Replit container."; exit 1; }

echo "== Current env =="
echo "SFS_API_URL=${SFS_API_URL:-<unset>}"
echo "SFS_TOKEN set? $([ -n "${SFS_TOKEN:-}" ] && echo yes || echo no)"
echo "SFS_API_KEY set? $([ -n "${SFS_API_KEY:-}" ] && echo yes || echo no)"

if [ -z "${SFS_API_URL:-}" ] || [ "${SFS_API_URL:-}" = "https://API.SMARTFLOW.SYSTEMS" ]; then
  cat <<'MSG'
❌ Placeholder/empty SFS_API_URL.
Fix: Replit → 🔐 Secrets → set SFS_API_URL to your REAL tenant/region endpoint (from SFS console),
and add SFS_TOKEN (Bearer) OR SFS_API_KEY (x-api-key).
Examples (illustrative):
  https://eu.smartflow.systems
  https://us.smartflow.systems
  https://<tenant>.smartflow.systems
MSG
  exit 2
fi

HOST=$(echo "$SFS_API_URL" | sed -E 's#^https?://([^/]+).*$#\1#')
echo "== DNS check for $HOST =="
(getent ahosts "$HOST" || true)
(nslookup "$HOST" || true)

echo "== Health probe =="
for p in /v1/health /health /ping /v1/ping; do
  code=$(curl -sS -o /tmp/h -w "%{http_code}" "${SFS_API_URL%/}${p}" || true)
  echo "${SFS_API_URL%/}${p} → HTTP $code"
  [ "$code" != "000" ] && break
done

if [ -n "${SFS_TOKEN:-}" ] || [ -n "${SFS_API_KEY:-}" ]; then
  echo "== Auth probe =="
  H=()
  [ -n "${SFS_TOKEN:-}" ] && H+=(-H "Authorization: Bearer ${SFS_TOKEN}")
  [ -n "${SFS_API_KEY:-}" ] && H+=(-H "x-api-key: ${SFS_API_KEY}")
  for p in /v1/me /v1/projects /me; do
    code=$(curl -sS -o /tmp/a -w "%{http_code}" "${H[@]}" "${SFS_API_URL%/}${p}" || true)
    echo "Auth ${p} → HTTP $code"
    if [ "$code" -ge 200 ] && [ "$code" -lt 300 ]; then
      echo "✅ Auth looks good."
      exit 0
    fi
  done
  echo "❌ Auth failed. Check header type (Bearer vs x-api-key) and scopes."
  exit 3
else
  echo "ℹ️ Add SFS_TOKEN or SFS_API_KEY in 🔐 Secrets and re-run."
  exit 4
fi

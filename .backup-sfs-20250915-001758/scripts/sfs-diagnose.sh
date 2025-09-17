#!/usr/bin/env bash
# Purpose: deep diag of env, JWT expiry, health, and auth
set -euo pipefail
: "${SFS_API_URL:=${SFS_API_URL:-https://API.SMARTFLOW.SYSTEMS}}"
: "${SFS_TOKEN:=${SFS_TOKEN:-}}"
: "${SFS_API_KEY:=${SFS_API_KEY:-}}"
: "${SFS_ORG_ID:=${SFS_ORG_ID:-}}"
: "${SFS_PROJECT_ID:=${SFS_PROJECT_ID:-}}"
: "${SFS_INSECURE:=${SFS_INSECURE:-false}}"
: "${SFS_TIMEOUT:=${SFS_TIMEOUT:-15}}"
HEALTH_PATHS=("/v1/health" "/health" "/ping" "/v1/ping")
AUTH_PATHS=("/v1/me" "/v1/projects" "/v1/account" "/me")
need(){ command -v "$1" >/dev/null 2>&1 || { echo "Missing '$1'."; exit 1; }; }
need curl
HAS_JQ=0; command -v jq >/dev/null 2>&1 && HAS_JQ=1
HAS_OSSL=0; command -v openssl >/dev/null 2>&1 && HAS_OSSL=1
mask(){ s="$1"; n=${#s}; [ $n -le 8 ] && printf "***masked***" || printf "%s...%s" "${s:0:6}" "${s: -4}"; }
echo "=== SFS Diagnose ==="; echo "API URL       : ${SFS_API_URL}"; echo "ORG / PROJECT : ${SFS_ORG_ID:-<unset>} / ${SFS_PROJECT_ID:-<unset>}"; echo "TOKEN present : $([ -n "${SFS_TOKEN}" ] && echo yes || echo no)"; [ -n "${SFS_TOKEN:-}" ] && echo "TOKEN (masked): $(mask "$SFS_TOKEN")"; echo "API_KEY present: $([ -n "${SFS_API_KEY:-}" ] && echo yes || echo no)"; [ -n "${SFS_API_KEY:-}" ] && echo "API_KEY (masked): $(mask "$SFS_API_KEY")"; echo "TLS insecure  : ${SFS_INSECURE}"
if [ "${SFS_API_URL:-}" = "https://API.SMARTFLOW.SYSTEMS" ]; then echo "❌ Placeholder SFS_API_URL. Set real endpoint in 🔐 Secrets."; exit 2; fi
if [ -n "${SFS_TOKEN:-}" ] && [ $HAS_OSSL -eq 1 ] && [[ "$SFS_TOKEN" == *.*.* ]]; then
  echo "---- JWT details ----"
  jwt_part(){ p="$1"; m=$(( ${#p} % 4 )); [ $m -gt 0 ] && p="${p}$(printf '=%.0s' $(seq 1 $((4-m))))"; echo "$p" | tr '_-' '/+' | openssl base64 -d -A 2>/dev/null || true; }
  IFS='.' read -r H P _ <<< "$SFS_TOKEN"; echo "Header : $(jwt_part "$H")"; echo "Payload: $(jwt_part "$P")"
  if [ $HAS_JQ -eq 1 ]; then EXP=$(jwt_part "$P" | jq -r 'try .exp // empty'); NOW=$(date +%s); [ -n "${EXP:-}" ] && { [ "$NOW" -ge "$EXP" ] && echo "⚠️  Token appears EXPIRED (exp=$EXP, now=$NOW)" || echo "⏳ Token time left: $((EXP-NOW))s (~$(( (EXP-NOW)/3600 ))h)"; }; fi
fi
CURL_FLAGS=(--silent --show-error --max-time "${SFS_TIMEOUT}" --connect-timeout 5 --location); [ "${SFS_INSECURE}" = "true" ] && CURL_FLAGS+=(-k)
echo "---- Probing health ----"
ok=false; for p in "${HEALTH_PATHS[@]}"; do URL="${SFS_API_URL%/}${p}"; code=$(curl "${CURL_FLAGS[@]}" -o /tmp/sfs_health.json -w "%{http_code}" "$URL" || true); echo "Tried ${URL} → HTTP $code"; [ "$code" != "000" ] && ok=true && break; done; $ok || echo "⚠️ No healthy response."
echo; echo "---- Probing authenticated endpoint ----"
for p in "${AUTH_PATHS[@]}"; do URL="${SFS_API_URL%/}${p}"; if [ -n "${SFS_TOKEN:-}" ]; then code=$(curl "${CURL_FLAGS[@]}" -H "Authorization: Bearer ${SFS_TOKEN}" -o /tmp/sfs_auth.json -w "%{http_code}" "$URL" || true); echo "Bearer ${URL} → HTTP $code"; [ "$code" -ge 200 ] && [ "$code" -lt 300 ] && { [ $HAS_JQ -eq 1 ] && jq -r '.' </tmp/sfs_auth.json || head -c 300 /tmp/sfs_auth.json; echo; echo "✅ Auth OK — token works."; exit 0; }; fi; if [ -n "${SFS_API_KEY:-}" ]; then code=$(curl "${CURL_FLAGS[@]}" -H "x-api-key: ${SFS_API_KEY}" -o /tmp/sfs_auth.json -w "%{http_code}" "$URL" || true); echo "x-api-key ${URL} → HTTP $code"; [ "$code" -ge 200 ] && [ "$code" -lt 300 ] && { [ $HAS_JQ -eq 1 ] && jq -r '.' </tmp/sfs_auth.json || head -c 300 /tmp/sfs_auth.json; echo; echo "✅ Auth OK — API key works."; exit 0; }; fi; done
echo "❌ Auth failed — bad/expired token, wrong header, or missing scopes."; exit 2

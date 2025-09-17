#!/usr/bin/env bash
set -euo pipefail
PORT_VAL="${PORT:-3000}"
exec npx next dev -H 0.0.0.0 -p "$PORT_VAL"

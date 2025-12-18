#!/usr/bin/env bash
set -euo pipefail
slug="$(printf %s "$REPL_SLUG"  | tr '[:upper:]' '[:lower:]')"
owner="$(printf %s "$REPL_OWNER" | tr '[:upper:]' '[:lower:]')"
echo "https://${slug}-${owner}.replit.app"

#!/usr/bin/env bash
set -euo pipefail
for f in docs/SmartFlow-GPT-Instructions.md docs/Project-Checklist.md actions/sfs-api-openapi.yaml actions/github-openapi.json; do
  [ -f "$f" ] && echo "OK: $f" || { echo "MISSING: $f"; exit 1; }
done
echo "Secrets: set SFS_PAT (req), REPLIT_TOKEN/SFS_SYNC_URL (opt) at GitHub Org → Actions."

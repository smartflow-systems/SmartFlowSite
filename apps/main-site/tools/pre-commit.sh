#!/usr/bin/env bash
set -euo pipefail
if [[ -f tools/sf ]]; then
  echo "[pre-commit] Checking tools/sf…"
  bash -n tools/sf
  if command -v shellcheck >/dev/null 2>&1; then
    shellcheck -S style tools/sf
  else
    echo "[pre-commit] shellcheck not found; skipping."
  fi
fi

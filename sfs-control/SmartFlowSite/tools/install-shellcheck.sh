#!/usr/bin/env bash
set -euo pipefail
echo "Installing shellcheck (optional; CI runs it anyway)…"
if command -v shellcheck >/dev/null 2>&1; then
  echo "shellcheck already installed."
  exit 0
fi
if command -v apt-get >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y shellcheck
elif command -v apk >/dev/null 2>&1; then
  sudo apk add --no-cache shellcheck
else
  echo "Could not auto-install shellcheck on this system."
  exit 0
fi
echo "Done. Try: shellcheck --version"

#!/usr/bin/env bash
set -euo pipefail

feature="${1:-}"
if [[ -z "$feature" ]]; then
  echo "Usage: $0 <feature-name>"
  exit 1
fi

feature_slug="$(echo "$feature" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')"
timestamp="$(TZ=Europe/London date +%Y%m%d%H%M)"
branch="codex/${feature_slug}-${timestamp}"

git checkout -b "$branch"
echo "$branch"

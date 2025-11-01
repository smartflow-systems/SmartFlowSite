#!/usr/bin/env bash
set -euo pipefail

say(){ printf "\033[1;36m==> %s\033[0m\n" "$*"; }
warn(){ printf "\033[33m%s\033[0m\n" "$*"; }
err(){ printf "\033[31m%s\033[0m\n" "$*"; }

# 0) Sanity checks
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  err "Run this inside your SmartFlowSite repo."
  exit 1
fi
if [[ ! -f tools/sf ]]; then
  err "Missing tools/sf. Add the SmartFlow Git helper first, then re-run."
  exit 1
fi

# 1) Ensure executable + quick syntax check
say "Making sf executable + syntax check…"
chmod +x tools/sf
bash -n tools/sf

if command -v shellcheck >/dev/null 2>&1; then
  say "Running shellcheck locally (non-blocking)…"
  # Don’t fail the bundle if shellcheck finds style issues.
  shellcheck -S style tools/sf || true
else
  warn "shellcheck not installed locally; skipping local lint (CI will run it)."
fi

# 2) Docs
say "Writing tools/README-sf.md…"
mkdir -p tools
cat > tools/README-sf.md <<'EOF'
# SmartFlow Git helper (`tools/sf`)

Quick commands:
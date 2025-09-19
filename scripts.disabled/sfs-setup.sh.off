#!/usr/bin/env bash
set -euo pipefail

# Smartflow Systems – Master Setup Script
# Creates CI, scripts, templates, hooks, Dependabot, branches, and optional remote push.

BRANCH_MAIN="${BRANCH_MAIN:-main}"
BRANCH_DEV="${BRANCH_DEV:-dev}"
GIT_NAME="${GIT_NAME:-Smartflow Bot}"
GIT_EMAIL="${GIT_EMAIL:-bot@smartflow.local}"
REPO_URL="${SFS_REPO_URL:-}"   # set SFS_REPO_URL env var to skip prompt

#------------ helpers ------------
require_cmd() { command -v "$1" >/dev/null 2>&1 || { echo "Missing: $1"; exit 1; }; }
mkdirp() { mkdir -p "$1"; }
ensure_git() {
  if ! git rev-parse --git-dir >/dev/null 2>&1; then
    echo "🔧 Initializing git repo..."
    git init
  fi
  git config user.name  "$GIT_NAME"
  git config user.email "$GIT_EMAIL"

  # default branch main (only if new)
  if ! git symbolic-ref HEAD >/dev/null 2>&1; then
    git checkout -B "$BRANCH_MAIN"
  fi
}
maybe_add_remote() {
  if git remote get-url origin >/dev/null 2>&1; then
    echo "🔗 origin remote already set."
    return
  fi
  if [ -z "${REPO_URL}" ]; then
    read -rp "Enter GitHub repo URL (e.g. git@github.com:boweazy/SmartFlowSite.git): " REPO_URL || true
  fi
  if [ -n "${REPO_URL:-}" ]; then
    git remote add origin "$REPO_URL" || true
    echo "🔗 Added origin: $REPO_URL"
  else
    echo "ℹ️ Skipping remote add (no URL provided)."
  fi
}
append_file() { # overwrite safely
  local path="$1"; shift
  mkdir -p "$(dirname "$path")"
  cat > "$path" <<'EOF'
'"$@"'
EOF
}
write_file() { # write with heredoc content from caller
  local path="$1"; shift
  mkdir -p "$(dirname "$path")"
  cat > "$path" <<EOF
$*
EOF
}
chmodx() { chmod +x "$1" 2>/dev/null || true; }

#------------ start ------------
require_cmd git
ensure_git

echo "📁 Creating workflow, scripts, and templates..."

# 1) GitHub Actions CI
write_file ".github/workflows/ci.yml" "$(cat <<'YAML'
name: CI
on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main, dev ]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Detect project type
        id: detect
        run: |
          if [ -f package.json ]; then echo "type=node" >> $GITHUB_OUTPUT; fi
          if [ -f requirements.txt ] || { [ -d src ] && ls **/*.py >/dev/null 2>&1; }; then echo "python=true" >> $GITHUB_OUTPUT; fi
      - name: Set up Node
        if: contains(steps.detect.outputs.type, 'node')
        uses: actions/setup-node@v4
        with:
          node-version: "lts/*"
          cache: npm
      - name: Install (Node)
        if: contains(steps.detect.outputs.type, 'node')
        run: |
          npm ci || npm install
      - name: Lint (Node)
        if: contains(steps.detect.outputs.type, 'node')
        run: |
          if npm run | grep -q "lint"; then npm run lint; else echo "No lint script"; fi
      - name: Test (Node)
        if: contains(steps.detect.outputs.type, 'node')
        run: |
          if npm run | grep -q "test"; then npm test --if-present; else echo "No test script"; fi
      - name: Build (Node)
        if: contains(steps.detect.outputs.type, 'node')
        run: |
          if npm run | grep -q "build"; then npm run build; else echo "No build script"; fi

      - name: Set up Python
        if: steps.detect.outputs.python == 'true'
        uses: actions/setup-python@v5
        with:
          python-version: '3.x'
          cache: 'pip'
      - name: Install (Python)
        if: steps.detect.outputs.python == 'true'
        run: |
          python -m pip install --upgrade pip
          if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
      - name: Lint/Test (Python)
        if: steps.detect.outputs.python == 'true'
        run: |
          if python -c "import pytest" 2>/dev/null; then pytest -q || true; else echo "pytest not installed"; fi
YAML
)"

# 2) Replit ⇄ GitHub sync script
write_file "scripts/replit-sync.sh" "$(cat <<'BASH'
#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-dev}"
MSG="${2:-chore: sync from Replit}"

# Self syntax-check
bash -n "$0"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  git init
fi

git config user.name "Smartflow Bot"
git config user.email "bot@smartflow.local"

if ! git remote get-url origin >/dev/null 2>&1; then
  read -p "Enter GitHub repo URL (e.g. git@github.com:boweazy/SmartFlowSite.git): " URL
  [ -n "$URL" ] && git remote add origin "$URL"
fi

git fetch origin || true
git checkout -B "$BRANCH"

git add -A
if ! git diff --cached --quiet; then
  git commit -m "$MSG"
else
  echo "No changes to commit"
fi

git push -u origin "$BRANCH"
echo "✅ Synced to $BRANCH"
BASH
)"
chmodx scripts/replit-sync.sh

# 3) Bootstrap helper
write_file "scripts/bootstrap-enhanced.sh" "$(cat <<'BASH'
#!/usr/bin/env bash
set -euo pipefail
bash -n "$0"

if [ -f package.json ]; then
  echo "📦 Installing Node deps..."
  npm ci || npm install
fi

if [ -f requirements.txt ]; then
  echo "🐍 Installing Python deps..."
  python -m pip install --upgrade pip
  pip install -r requirements.txt
fi

if ! git rev-parse --git-dir >/dev/null 2>&1; then git init; fi
echo "✅ Bootstrap done"
BASH
)"
chmodx scripts/bootstrap-enhanced.sh

# 4) PR & Issue templates
write_file ".github/PULL_REQUEST_TEMPLATE.md" "$(cat <<'MD'
## Summary

- What changed?
- Why?

## Checklist
- [ ] CI green
- [ ] Updated docs/README
- [ ] Screenshots (if UI)
MD
)"

write_file ".github/ISSUE_TEMPLATE/bug_report.md" "$(cat <<'MD'
---
name: Bug report
about: Something broke
labels: bug
---
**Expected**
**Actual**
**Steps to Reproduce**
**Screenshots/Logs**
MD
)"

write_file ".github/ISSUE_TEMPLATE/feature_request.md" "$(cat <<'MD'
---
name: Feature request
about: Idea or improvement
labels: enhancement
---
**Problem**
**Proposed solution**
**Acceptance criteria**
MD
)"

# 5) Dependabot
write_file ".github/dependabot.yml" "$(cat <<'YAML'
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
  - package-ecosystem: pip
    directory: "/"
    schedule:
      interval: weekly
YAML
)"

# 6) CONTRIBUTING + branch model
write_file "CONTRIBUTING.md" "$(cat <<'MD'
# Contributing

## Branches
- `main`: production-ready
- `dev`: integration branch
- `feature/*`: individual features

## Flow
1. Create branch: `git checkout -b feature/your-thing`
2. Commit small and often
3. Push: `git push -u origin feature/your-thing`
4. Open PR -> target `dev`
5. Auto-merge to `main` after testing, or open PR `dev -> main`

## Commit style
- `feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`, `refactor: ...`
MD
)"

# 7) Pre-commit hook
mkdirp .git/hooks
write_file ".git/hooks/pre-commit" "$(cat <<'BASH'
#!/usr/bin/env bash
set -e

if [ -f package.json ]; then
  echo "🔎 Linting JS/TS..."
  npm run lint --silent || true
  npm test --silent --if-present || true
fi

if ls **/*.py >/dev/null 2>&1; then
  echo "🔎 Checking Python formatting..."
  command -v black >/dev/null 2>&1 && black --check . || true
  command -v pytest >/dev/null 2>&1 && pytest -q || true
fi
BASH
)"
chmodx .git/hooks/pre-commit

# 8) Branch setup
git checkout -B "$BRANCH_MAIN"
git add -A
git commit -m "chore: Smartflow setup kit" || true

git checkout -B "$BRANCH_DEV"
git merge --no-edit "$BRANCH_MAIN" || true

# 9) Optional remote push
maybe_add_remote
if git remote get-url origin >/dev/null 2>&1; then
  echo "🚀 Pushing $BRANCH_MAIN and $BRANCH_DEV to origin..."
  git push -u origin "$BRANCH_MAIN" || true
  git push -u origin "$BRANCH_DEV" || true
fi

# 10) Final tips
echo
echo "✅ Smartflow GitHub↔Replit kit installed."
echo "Next steps:"
echo "  • Run: ./scripts/bootstrap-enhanced.sh"
echo "  • Daily push from Replit: ./scripts/replit-sync.sh $BRANCH_DEV \"feat: updates\""
echo "  • Pull latest: git fetch origin && git checkout $BRANCH_DEV && git pull --ff-only origin $BRANCH_DEV"
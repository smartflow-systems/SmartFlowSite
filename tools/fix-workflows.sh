#!/usr/bin/env bash
set -euo pipefail

say(){ printf "\033[1;36m==> %s\033[0m\n" "$*"; }
err(){ printf "\033[31m%s\033[0m\n" "$*"; }

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { err "Run inside your repo."; exit 1; }
mkdir -p .github/workflows

say "Writing reusable CI workflow (.github/workflows/ci.yml)…"
cat > .github/workflows/ci.yml <<'EOF'
name: SFS CI
on:
  workflow_call:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install deps
        run: npm ci || npm install

      - name: Build
        run: npm run build

      - name: Test
        run: npm test
EOF

say "Writing deploy wrapper that calls CI (.github/workflows/sfs-ci-deploy.yml)…"
cat > .github/workflows/sfs-ci-deploy.yml <<'EOF'
name: SFS CI + Deploy
on:
  push:
    branches: [ main, dev ]
  workflow_dispatch:

jobs:
  ci:
    uses: ./.github/workflows/ci.yml
    secrets: inherit

  deploy:
    needs: ci
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Placeholder deploy
        run: |
          echo "Deploy step goes here (e.g., upload to hosting, run SSH, etc.)."
          echo "CI finished OK on $GITHUB_REF"
EOF

say "Committing and pushing workflow fixes…"
git add .github/workflows/ci.yml .github/workflows/sfs-ci-deploy.yml
./tools/sf save "ci: repair workflows (reusable CI + wrapper deploy)"

say "Done ✅  Check Actions: 'SFS CI + Deploy' should run on this push, and you can also run 'SFS CI' via 'Run workflow'."

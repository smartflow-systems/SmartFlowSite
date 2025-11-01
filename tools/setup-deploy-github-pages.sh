#!/usr/bin/env bash
set -Eeuo pipefail
say(){ printf "\033[1;36m==> %s\033[0m\n" "$*"; }
warn(){ printf "\033[33m%s\033[0m\n" "$*"; }
err(){ printf "\033[31m%s\033[0m\n" "$*"; }
trap 'err "Failed on line $LINENO: $BASH_COMMAND"' ERR

# Change these later with tools/deploy-config.sh if needed
BUILD_CMD="${BUILD_CMD:-npm run build}"
BUILD_DIR="${BUILD_DIR:-dist}"

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { err "Run inside your repo root."; exit 1; }
mkdir -p .github/workflows tools docs

say "Writing GitHub Pages deploy workflow (.github/workflows/sfs-ci-deploy.yml)…"
tmp="$(mktemp)"

# Keep $SFS_BUILD_CMD and ${{ ... }} LITERAL in YAML; inject our values after with sed.
cat > "$tmp" <<'YAML'
name: SFS CI + Deploy
on:
  push:
    branches: [ main, dev ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

env:
  SFS_BUILD_CMD: "__BUILD_CMD__"
  SFS_BUILD_DIR: "__BUILD_DIR__"

jobs:
  ci:
    uses: ./.github/workflows/ci.yml
    secrets: inherit

  build_pages:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install deps
        run: npm ci || npm install
      - name: Build
        run: $SFS_BUILD_CMD
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ${{ env.SFS_BUILD_DIR }}

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: [ci, build_pages]
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
YAML

# Safely inject build command/dir
sed -e "s|__BUILD_CMD__|$BUILD_CMD|g" \
    -e "s|__BUILD_DIR__|$BUILD_DIR|g" "$tmp" > .github/workflows/sfs-ci-deploy.yml
rm -f "$tmp"

say "Helper to update build config (tools/deploy-config.sh)…"
cat > tools/deploy-config.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
CMD="${1:-}"; DIR="${2:-}"
if [[ -z "$CMD" || -z "$DIR" ]]; then
  echo "Usage: tools/deploy-config.sh '<build command>' <build_dir>"
  echo "Example: tools/deploy-config.sh 'npm run build' dist"
  exit 1
fi
tmp="$(mktemp)"
awk -v cmd="$CMD" -v dir="$DIR" '
  { if ($0 ~ /SFS_BUILD_CMD:/){ print "  SFS_BUILD_CMD: \""cmd"\""; next }
    if ($0 ~ /SFS_BUILD_DIR:/){ print "  SFS_BUILD_DIR: \""dir"\""; next }
    print
  }
' .github/workflows/sfs-ci-deploy.yml > "$tmp" && mv "$tmp" .github/workflows/sfs-ci-deploy.yml
echo "Updated sfs-ci-deploy.yml with:"
echo "  SFS_BUILD_CMD: $CMD"
echo "  SFS_BUILD_DIR: $DIR"
EOF
chmod +x tools/deploy-config.sh

say "Writing docs/deploy.md…"
cat > docs/deploy.md <<'EOF'
# Deploys (GitHub Pages)

- Every push to `dev` & `main` runs CI. If CI is green on **main**, we build and deploy a static site to **GitHub Pages**.
- Change build command/output directory:
  ```bash
  tools/deploy-config.sh 'npm run build' dist

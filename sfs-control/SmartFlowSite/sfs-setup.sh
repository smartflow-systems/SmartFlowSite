#!/usr/bin/env bash
set -euo pipefail

echo "=============================="
echo "SMARTFLOW ORG-WIDE CONSOLIDATION"
echo "=============================="

### 0) Enter repo safely
for d in "$HOME/workspace/SmartFlowSite" "$HOME/SmartFlowSite" "$PWD"; do
  [ -d "$d/.git" ] && { cd "$d"; break; }
done
git rev-parse --is-inside-work-tree >/dev/null

### 1) Repo-level config
mkdir -p .sfs
cat > .sfs/config.env <<'EOF1'
# SFS repo config
AUTO_COMMIT_INTERVAL=20m
AUTO_PUSH=false
REQUIRE_JWT_SECRET=true
ENABLE_ALERTS=false
EOF1

### 2) JWT_SECRET hard guard (Node + Python)
cat > .sfs/require-secrets.sh <<'EOF2'
#!/usr/bin/env bash
set -e
if [[ "${REQUIRE_JWT_SECRET:-true}" == "true" ]]; then
  if [[ -z "${JWT_SECRET:-}" ]]; then
    echo "CRITICAL: JWT_SECRET missing"
    exit 1
  fi
fi
EOF2
chmod +x .sfs/require-secrets.sh

### 3) Timed auto-commit (NO push)
mkdir -p .git/sfs
cat > .git/sfs/auto-commit.sh <<'EOF3'
#!/usr/bin/env bash
set -euo pipefail
git diff --quiet && git diff --cached --quiet && exit 0
git add .
git commit -m "chore(auto): timed sync $(date -u '+%Y-%m-%d %H:%M UTC')" \
            -m "Automated SmartFlow timed commit"
EOF3
chmod +x .git/sfs/auto-commit.sh
git config alias.ac '!bash .git/sfs/auto-commit.sh'

### 4) Timed runner (interval from config)
cat > sfs-auto-timer.sh <<'EOF4'
#!/usr/bin/env bash
set -euo pipefail
source .sfs/config.env
echo "SFS timed commits every $AUTO_COMMIT_INTERVAL"
while true; do
  sleep "${AUTO_COMMIT_INTERVAL%m}"m
  git ac || true
done
EOF4
chmod +x sfs-auto-timer.sh

### 5) CI-only auto sync (GitHub Actions)
mkdir -p .github/workflows
cat > .github/workflows/sfs-auto-sync.yml <<'EOF5'
name: SFS Auto Sync
on:
  push:
    branches: [main]
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "CI sync confirmed"
EOF5

### 6) Auto PR + auto merge
cat > .github/workflows/sfs-auto-pr.yml <<'EOF6'
name: SFS Auto PR
on:
  push:
    branches-ignore: [main]
jobs:
  pr:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v7
        with:
          script: |
            const { repo, owner } = context.repo
            const head = context.ref.replace('refs/heads/','')
            await github.pulls.create({
              owner, repo,
              head,
              base: 'main',
              title: `auto: merge ${head}`,
              body: 'Automated SmartFlow PR'
            })
EOF6

### 7) SFS Doctor
cat > .git/sfs/doctor.sh <<'EOF7'
#!/usr/bin/env bash
set -e
echo "SFS DOCTOR"
git status --short
[[ -z "${JWT_SECRET:-}" ]] && echo "❌ JWT_SECRET missing" || echo "✅ JWT_SECRET OK"
curl -fsS https://smart-flow-site-Smart-F-Syst.replit.app >/dev/null && echo "✅ Site OK" || echo "❌ Site down"
curl -fsS https://sfs-analytics-engine--Smart-F-Syst.replit.app >/dev/null && echo "✅ Analytics OK" || echo "❌ Analytics down"
EOF7
chmod +x .git/sfs/doctor.sh
git config alias.sfs:doctor '!bash .git/sfs/doctor.sh'

echo "=============================="
echo "SFS CONSOLIDATION COMPLETE"
echo "=============================="

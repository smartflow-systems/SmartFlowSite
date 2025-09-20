
#!/usr/bin/env bash
set -euo pipefail

# SmartFlow Systems CI Standardization Script
ORG="smartflow-systems"
REPOS=("SmartFlowSite" "SocialScaleBoosterAIbot" "SFSDataQueryEngine" "SFSAPDemoCRM")
TS=$(date -u +%Y%m%dT%H%M%SZ)
BR="ops/ci-boost-$TS"

mk_ci() {
    mkdir -p .github/workflows
    cat > .github/workflows/ci.yml <<'YML'
name: SFS CI + Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  reuse:
    uses: smartflow-systems/SmartFlowSite/.github/workflows/sfs-ci-deploy.yml@main
    secrets: inherit
YML
}

mk_qL() {
    mkdir -p .github/workflows
    cat > .github/workflows/codeql.yml <<'YML'
name: CodeQL
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '23 1 * * 4'
permissions:
  contents: read
  security-events: write
jobs:
  analyze:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        language: ['javascript', 'python']
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
      - uses: github/codeql-action/analyze@v3
YML
}

mk_badges() {
    local R="$1"
    cat <<EOF
<p align="center">
<!-- BADGES:START -->
[![SFS CI + Deploy](https://github.com/$ORG/$R/actions/workflows/ci.yml/badge.svg)](https://github.com/$ORG/$R/actions/workflows/ci.yml)
[![CodeQL](https://github.com/$ORG/$R/actions/workflows/codeql.yml/badge.svg)](https://github.com/$ORG/$R/actions/workflows/codeql.yml)
[![Release](https://img.shields.io/github/v/release/$ORG/$R?display_name=tag&sort=semver)](https://github.com/$ORG/$R/releases)
$( [ "$R" = "SmartFlowSite" ] && echo "[![SmartFlow Tools Lint](https://github.com/$ORG/SmartFlowSite/actions/workflows/sf-shellcheck.yml/badge.svg)](https://github.com/$ORG/SmartFlowSite/actions/workflows/sf-shellcheck.yml)
[![Sync Labels](https://github.com/$ORG/SmartFlowSite/actions/workflows/labels-sync.yml/badge.svg)](https://github.com/$ORG/SmartFlowSite/actions/workflows/labels-sync.yml)" )
<!-- BADGES:END -->
</p>
EOF
}

# Apply to current repo only (since we're in SmartFlowSite)
echo "=== Standardizing CI for SmartFlowSite ==="

# Create workflows
mk_ci
mk_qL

# Update badges in README
R="SmartFlowSite"
B="$(mk_badges "$R")"

if grep -q "<!-- BADGES:START -->" README.md 2>/dev/null; then
    # Replace existing badges
    perl -0777 -pe 's/<!-- BADGES:START -->.*?<!-- BADGES:END -->/'"$(printf '%s' "$B" | sed 's/[&/\]/\\&/g')"'/s' -i README.md
else
    # Add badges at the top
    printf '%s\n\n%s\n' "$B" "$(cat README.md 2>/dev/null)" > README.md
fi

echo "✅ CI workflows and badges standardized for SmartFlowSite"
echo "Files updated:"
echo "  - .github/workflows/ci.yml (reusable SFS CI)"
echo "  - .github/workflows/codeql.yml (security scanning)"
echo "  - README.md (standardized badges)"
echo ""
echo "Next steps:"
echo "  1. Review the changes"
echo "  2. Commit and push to create PR"
echo "  3. git add ."
echo "  4. git commit -m 'ci: standard CI via reusable; add CodeQL; refresh badges ($TS)'"
echo "  5. git push"

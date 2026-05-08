#!/usr/bin/env bash
set -euo pipefail

say(){ printf "\033[1;36m==> %s\033[0m\n" "$*"; }
warn(){ printf "\033[33m%s\033[0m\n" "$*"; }
err(){ printf "\033[31m%s\033[0m\n" "$*"; }

# 0) Sanity
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { err "Run this inside your SmartFlowSite repo."; exit 1; }
mkdir -p .github/ISSUE_TEMPLATE .github/workflows tools

# 1) Write files (safe to overwrite)
say "Writing PR/Issue templates, CODEOWNERS, CI, and helper scripts…"

cat > .github/PULL_REQUEST_TEMPLATE.md <<'EOF'
# Pull Request

## Summary
Explain what this PR does in 1–2 sentences.

## Changes
- Bullet the key changes here.

## Testing
- How did you test it? (commands, screenshots, URLs)

## Risk/Impact
- Any migrations, infra changes, or user-facing impact?

## Checklist
- [ ] CI is green
- [ ] Linting passes
- [ ] No secrets or tokens committed
- [ ] Docs updated (if needed)
EOF

cat > .github/ISSUE_TEMPLATE/bug_report.md <<'EOF'
---
name: Bug report
about: Report a problem so we can fix it
labels: bug
---

### Description
A clear description of the bug.

### Steps to Reproduce
1. …
2. …
3. …

### Expected Behavior
What you expected to happen.

### Actual Behavior
What actually happened (include logs, errors, or screenshots).

### Environment
- Browser/OS:
- Branch/Commit:

### Additional Context
Anything else we should know?
EOF

cat > .github/ISSUE_TEMPLATE/feature_request.md <<'EOF'
---
name: Feature request
about: Suggest an idea to improve SmartFlowSite
labels: enhancement
---

### Problem
What problem are we trying to solve?

### Proposal
Describe the feature and how it would work.

### Alternatives
Any alternative solutions you considered.

### Success Criteria
How we’ll know this is successful.

### Additional Context
Links, screenshots, references.
EOF

cat > .github/CODEOWNERS <<'EOF'
# Replace @your-github-username with your actual GitHub username or team handle.
*         @your-github-username
.github/  @your-github-username
tools/    @your-github-username
EOF

cat > .github/workflows/sf-shellcheck.yml <<'EOF'
name: SmartFlow Tools Lint
on:
  push:
    paths:
      - "tools/**"
      - ".github/workflows/sf-shellcheck.yml"
  pull_request:
    paths:
      - "tools/**"
      - ".github/workflows/sf-shellcheck.yml"

jobs:
  shellcheck:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Install shellcheck
        run: |
          sudo apt-get update
          sudo apt-get install -y shellcheck
      - name: Lint sf helper
        run: |
          bash -n tools/sf
          shellcheck -S style tools/sf
EOF

cat > tools/install-shellcheck.sh <<'EOF'
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
EOF
chmod +x tools/install-shellcheck.sh

cat > tools/pre-commit.sh <<'EOF'
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
EOF
chmod +x tools/pre-commit.sh
install -m 755 tools/pre-commit.sh .git/hooks/pre-commit

# 2) Tidy & PATH (best-effort only)
[[ -f tools/sf.sh ]] && { say "Removing duplicate tools/sf.sh…"; git rm -f tools/sf.sh || rm -f tools/sf.sh; }
chmod +x tools/sf || true
bash -n tools/sf || warn "Syntax check failed on tools/sf (fix later)."

# Try installing a global 'sf' (ignore failures on Replit)
mkdir -p "$HOME/.local/bin" 2>/dev/null || true
cp tools/sf "$HOME/.local/bin/sf" 2>/dev/null || true
chmod +x "$HOME/.local/bin/sf" 2>/dev/null || true

# Try to persist PATH if possible; skip silently if not writable
add_path_line='export PATH="$HOME/.local/bin:$PATH"'
for rc in "$HOME/.bashrc" "$HOME/.zshrc"; do
  if { test -f "$rc" || touch "$rc" 2>/dev/null; } && ! grep -Fqx "$add_path_line" "$rc" 2>/dev/null; then
    echo "$add_path_line" | tee -a "$rc" >/dev/null 2>&1 || warn "No permission to update $rc; skipping PATH persist."
  fi
done

# 3) Commit + push
say "Committing and pushing…"
git add .github/PULL_REQUEST_TEMPLATE.md \
        .github/ISSUE_TEMPLATE/bug_report.md \
        .github/ISSUE_TEMPLATE/feature_request.md \
        .github/CODEOWNERS \
        .github/workflows/sf-shellcheck.yml \
        tools/install-shellcheck.sh \
        tools/pre-commit.sh || true

name="$(git config user.name || true)"; email="$(git config user.email || true)"
if [[ -z "$name" || -z "$email" ]]; then
  warn "Git identity missing; setting local temporary identity."
  git config user.name "Smartflow User"
  git config user.email "user@smartflow.local"
fi

./tools/sf save "bundle: add PR/issue templates, CODEOWNERS, CI, pre-commit, shellcheck installer" || git push || true

say "Done ✅  If 'sf' isn't available globally, just use: ./tools/sf"
warn "Reminder: update [.github/CODEOWNERS] with your real GitHub username/team."

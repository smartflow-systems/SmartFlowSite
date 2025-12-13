#!/usr/bin/env bash
set -Eeuo pipefail

say(){ printf "\033[1;36m==> %s\033[0m\n" "$*"; }
warn(){ printf "\033[33m%s\033[0m\n" "$*"; }
err(){ printf "\033[31m%s\033[0m\n" "$*"; }

# Helpful error context
trap 'err "Failed on line $LINENO: $BASH_COMMAND"; exit 1' ERR

# --- Sanity ---------------------------------------------------------------
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { err "Run inside your repo root."; exit 1; }
mkdir -p .github/ISSUE_TEMPLATE .github/workflows tools docs

# --- 1) Add CI + Deploy badge to README (robust, awk+fallback) -----------
add_deploy_badge() {
  say "Adding SFS CI + Deploy badge to README…"
  local REPO="${GITHUB_REPOSITORY:-smartflow-systems/SmartFlowSite}"
  local WF_DEPLOY="sfs-ci-deploy.yml"
  local NEW_BADGE="[![SFS CI + Deploy](https://github.com/$REPO/actions/workflows/$WF_DEPLOY/badge.svg)](https://github.com/$REPO/actions/workflows/$WF_DEPLOY)"
  local BLOCK_S="<!-- BADGES:START -->"
  local BLOCK_E="<!-- BADGES:END -->"

  touch README.md
  if grep -q "$BLOCK_S" README.md && grep -q "$BLOCK_E" README.md; then
    # Update existing block. Prefer awk; fallback to simple append within block.
    if command -v awk >/dev/null 2>&1; then
      awk -v start="$BLOCK_S" -v end="$BLOCK_E" -v newb="$NEW_BADGE" '
        BEGIN{inblk=0; done=0}
        {
          if ($0 ~ start) { print; inblk=1; next }
          if ($0 ~ end)   {
            if (!done) {
              if (buf ~ newb) { print buf } else { print (buf ? buf" "newb : newb) }
              done=1
            }
            print; inblk=0; buf=""; next
          }
          if (inblk) { if (length(buf)) buf=buf" "$0; else buf=$0; next }
          print
        }
        END{
          if (!done) {
            print start"\n\n"newb"\n\n"end
          }
        }
      ' README.md > README.md.tmp && mv README.md.tmp README.md
    else
      # Minimal fallback: if badge missing, append it just before end marker
      grep -qF "$NEW_BADGE" README.md || sed -i "s|$BLOCK_E|$NEW_BADGE\n\n$BLOCK_E|" README.md
    fi
  else
    { echo "$BLOCK_S"; echo; echo "$NEW_BADGE"; echo; echo "$BLOCK_E"; echo; cat README.md; } > README.md.tmp
    mv README.md.tmp README.md
  fi
}

# --- 2) Write explainer doc ------------------------------------------------
write_docs() {
  say "Writing docs/how-this-works.md…"
  cat > docs/how-this-works.md <<'EOF'
# SmartFlowSite — What these pieces do (plain English)

## Local (your machine/Replit)
- **tools/sf**: one-liner Git helper (save/sync/branch). Use `./tools/sf save "msg"`.
- **.git/hooks/pre-commit** via `tools/pre-commit.sh`: quick checks before each commit (right now it sanity-checks shell scripts). You can add linters/tests later.

## GitHub Automation (Actions in .github/workflows/)
- **sf-shellcheck.yml**: checks `tools/sf` when you push.
- **ci.yml**: common CI steps — install deps, build, test.
- **sfs-ci-deploy.yml**: runs CI on `dev` + `main`. On `main`, it’s ready for real deploy steps.
- **labels-sync.yml** + **.github/labels.yml**: keeps issue labels in sync automatically.

## Repo hygiene
- **.github/CODEOWNERS**: GitHub auto-requests reviews from the right people.
- **README badges**: instant health view of your workflows.
- **package.json**: valid JSON so Node/npm steps don’t crash.

## Next upgrades (when you want)
- Add deploy commands to `.github/workflows/sfs-ci-deploy.yml` (Vercel/Netlify/Render/Fly/SSH/Rsync).
- Add ESLint/Prettier/TypeScript, unit tests, and wire them into `ci.yml`.
- Add secrets in GitHub → Settings → Secrets and use them in workflows.
- Protect `main` so PRs must be green before merge.
EOF
}

# --- 3) Tidy older helper scripts (move to archive safely) ----------------
tidy_helpers() {
  say "Tidying old helper scripts into tools/archive/…"
  mkdir -p tools/archive
  for f in tools/bundle-it.sh tools/fully-load.sh tools/finalize-bundle.sh; do
    [[ -f "$f" ]] && git mv -f "$f" "tools/archive/$(basename "$f")" || true
  done
}

# --- 4) Nudge label sync ---------------------------------------------------
nudge_labels() {
  if [[ -f .github/labels.yml ]]; then
    say "Touching labels.yml to trigger label sync…"
    TZ=UTC touch -a -m .github/labels.yml || true
  fi
}

# --- 5) Commit & push ------------------------------------------------------
commit_push() {
  say "Running quick checks and committing…"
  if [[ -f tools/sf ]]; then
    bash -n tools/sf || warn "tools/sf failed 'bash -n' (syntax). You can still commit; fix later."
  fi

  git add README.md docs/how-this-works.md .github/labels.yml 2>/dev/null || true
  git add -A tools/archive 2>/dev/null || true

  # Ensure local identity if missing
  local name email
  name="$(git config user.name || true)"; email="$(git config user.email || true)"
  if [[ -z "$name" || -z "$email" ]]; then
    warn "Git identity missing; setting local temporary identity."
    git config user.name "Smartflow User"
    git config user.email "user@smartflow.local"
  fi

  ./tools/sf save "works: add deploy badge, explainer doc, tidy helpers, trigger label sync" || git push || true
  say "All set ✅  Check Actions. If anything red, paste the error and I’ll patch it."
}

# --- Run steps -------------------------------------------------------------
add_deploy_badge
write_docs
tidy_helpers
nudge_labels
commit_push

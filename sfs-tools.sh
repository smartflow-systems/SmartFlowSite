#!/usr/bin/env bash
sfs_cherrypick_signed() {
  set -euo pipefail
  local PR="" SRC="" BASE="origin/main" NEW=""
  local LABELS="${LABELS:-}" REVIEWERS="${REVIEWERS:-}" AUTO_MERGE="${AUTO_MERGE:-0}"

  while getopts "p:b:B:n:" opt; do
    case "$opt" in
      p) PR="$OPTARG" ;;
      b) SRC="$OPTARG" ;;
      B) BASE="$OPTARG" ;;
      n) NEW="$OPTARG" ;;
    esac
  done

  for t in git gh ssh-keygen; do command -v "$t" >/dev/null || { echo "✖ missing $t"; return 1; }; done

  git config --global gpg.format ssh
  git config --global gpg.ssh.program "$(command -v ssh-keygen)"
  git config --global commit.gpgsign true
  if ! git config --global user.signingkey >/dev/null; then
    [ -f "$HOME/.ssh/id_ed25519_signing" ] || ssh-keygen -t ed25519 -N "" \
      -C "git-signing $(hostname)-$(date -u +%Y%m%d)" -f "$HOME/.ssh/id_ed25519_signing"
    git config --global user.signingkey "$HOME/.ssh/id_ed25519_signing.pub"
  fi
  if ! git config --global gpg.ssh.allowedSignersFile >/dev/null; then
    mkdir -p "$HOME/.config/git"
    printf '%s %s\n' "$(git config --get user.email)" "$(cat "$(git config --global user.signingkey)")" \
      > "$HOME/.config/git/allowed_signers"
    git config --global gpg.ssh.allowedSignersFile "$HOME/.config/git/allowed_signers"
  fi

  local ROOT; ROOT="$(git rev-parse --show-toplevel)" || { echo "✖ not in a repo"; return 1; }
  cd "$ROOT"
  git fetch origin --prune

  if [ -n "$PR" ]; then
    local head base
    head="$(gh pr view "$PR" --json headRefName -q .headRefName)"
    base="$(gh pr view "$PR" --json baseRefName -q .baseRefName)"
    SRC="origin/${head}"; BASE="origin/${base}"
  fi
  [ -n "$SRC" ] || { echo "✖ need a source: -p <PR#> or -b <branch>"; return 1; }

  git fetch origin "${SRC#origin/}" >/dev/null 2>&1 || true
  git fetch origin "${BASE#origin/}" >/dev/null 2>&1 || true

  local BASE_SHA RANGE_SHA
  BASE_SHA="$(git merge-base "$BASE" "$SRC")"
  RANGE_SHA="${BASE_SHA}..${SRC}"

  [ -n "$NEW" ] || NEW="$(basename "${SRC#origin/}")-signed"
  git switch -C "$NEW" "$BASE"

  local stashed=0
  if ! git diff --quiet || ! git diff --cached --quiet; then
    git stash push -u -m "wip-$(date -u +%Y%m%dT%H%M%SZ)" >/dev/null || true
    stashed=1
  fi

  git cherry-pick -x -S $RANGE_SHA || {
    echo "⚠️ Conflicts. Fix them, then: git add -A && git cherry-pick --continue"
    echo "   Or abort: git cherry-pick --abort"
    return 2
  }

  git push -u origin "$NEW"
  local prnum
  prnum="$(gh pr create --fill --base "${BASE#origin/}" --head "$NEW" --json number -q .number)"

  [ -n "$LABELS" ] && gh pr edit "$prnum" --add-label $LABELS || true
  [ -n "$REVIEWERS" ] && gh pr edit "$prnum" --add-reviewer $REVIEWERS || true

  if [ "$AUTO_MERGE" = "1" ]; then
    gh repo edit "$(gh repo view --json nameWithOwner -q .nameWithOwner)" --enable-auto-merge true || true
    gh pr merge "$prnum" --auto --squash --delete-branch || true
  fi

  gh pr checks "$prnum" || true
  [ "$stashed" -eq 1 ] && git stash pop || true
  echo "✅ Opened PR #$prnum from $NEW (signed commits)."
}
sfs_cherry_continue() { git add -A && git cherry-pick --continue; }
sfs_cherry_abort()    { git cherry-pick --abort; }

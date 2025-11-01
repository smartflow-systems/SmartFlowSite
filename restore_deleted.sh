set -euo pipefail
SINCE="${SINCE:-21 days ago}"
REMOTE="${REMOTE:-origin}"
BRANCH="fix/$(date +%Y%m%d-%H%M)-restore-deleted"

echo "== Preflight =="
git fetch --all --prune
test -z "$(git status --porcelain)" || { echo "Working tree not clean—commit or stash."; exit 2; }

echo "== Find deletions since: $SINCE =="
git log --since="$SINCE" --diff-filter=D --name-status --pretty=format:'%H' \
| awk 'NF==1{c=$1;next} $1=="D"{print c "\t" $2}' | sort -u > /tmp/dels.txt
if ! [ -s /tmp/dels.txt ]; then echo "No deleted files found."; exit 0; fi
nl -ba /tmp/dels.txt | sed 's/^/DEL\t/'

echo "== Create branch: $BRANCH =="
git switch -c "$BRANCH"

echo "== Restore from parents of deleting commits =="
RESTORED=0
while IFS=$'\t' read -r SHA PATHF; do
  [ -n "$SHA" ] && [ -n "$PATHF" ] || continue
  echo "RESTORE $PATHF  <-  ${SHA}^"
  mkdir -p "$(dirname "$PATHF")"
  if git show "${SHA}^:$PATHF" > "$PATHF" 2>/dev/null; then
    [[ "$PATHF" == ".github/workflows/"* || "$PATHF" == ".replit" || "$PATHF" == "replit.nix" ]] && echo "(OVERWRITE) [$PATHF]"
    RESTORED=$((RESTORED+1))
  else
    echo "Skip: $PATHF not present in parent commit."
  fi
done < /tmp/dels.txt
(( RESTORED > 0 )) || { echo "Nothing restored—abort."; git switch -; git branch -D "$BRANCH"; exit 0; }

echo "== Commit & push =="
git add -A
git commit -m "restore: recover files deleted since $SINCE"
git push -u "$REMOTE" "$BRANCH"

if command -v gh >/dev/null; then
  gh pr create --title "restore: recover mistakenly removed files" \
               --body "Restored files deleted since $SINCE"
  # kick CI if any workflow returned
  WF="$(git ls-files .github/workflows/*.yml 2>/dev/null | head -n1 || true)"
  [ -n "$WF" ] && gh workflow run "$(basename "$WF")" || true
else
  echo "gh not found: open PR from branch $BRANCH in GitHub."
fi
echo "Done."

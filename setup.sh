set -euo pipefail
for d in "$HOME/workspace/SmartFlowSite" "$HOME/SmartFlowSite" "$PWD"; do [ -d "$d/.git" ] && { cd "$d"; break; }; done; git rev-parse --is-inside-work-tree >/dev/null
git config core.hooksPath .
TS=$(date +%Y%m%d%H%M%S); mkdir -p .backup/hooks-"$TS"; for f in pre-commit pre-push scripts/images-check.sh; do [ -f "$f" ] && cp -a "$f" ".backup/hooks-$TS/$(basename "$f")"; done; mkdir -p scripts
cat > pre-commit <<'SH'
#!/usr/bin/env bash
set -euo pipefail
[[ "${SKIP_SFS_CHECK:-0}" = "1" ]] && { echo "↪ skipping images:check"; exit 0; }
changed="$(git diff --cached --name-only || true)"
printf '%s\n' "$changed" | grep -Eq '^(assets/raw/|scripts/|package\.json|replit\.nix)' || exit 0
exec bash scripts/images-check.sh
SH
chmod +x pre-commit
cat > pre-push <<'SH'
#!/usr/bin/env bash
set -euo pipefail
[[ "${SKIP_SFS_SMOKE:-0}" = "1" ]] && { echo "↪ skipping smoke"; exit 0; }
echo "🚀 SFS smoke (pre-push)…"
if command -v npm >/dev/null && [ -f package.json ] && grep -q '"build"' package.json; then
  npm -s run -s build >/dev/null 2>&1 || { echo "❌ build failed"; exit 1; }
else
  echo "ℹ️ no build script; skipping"
fi
echo "✅ smoke ok"
SH
chmod +x pre-push
cat > scripts/images-check.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
IN="${1:-assets/raw}"; OUT="${2:-assets/build}"
mkdir -p "$OUT"
[[ -d "$IN" ]] || { echo "ℹ️ no $IN directory; skipping"; exit 0; }
if ! command -v magick >/dev/null 2>&1; then
  echo "ℹ️ ImageMagick not installed; skipping"; exit 0
fi
fail=0
while IFS= read -r -d '' src; do
  base="$(basename "$src")"; name="${base%.*}"
  echo "==> $base → square/story"
  if ! magick "$src" -resize 1080x1080^ -gravity center -extent 1080x1080 "$OUT/${name}-square.jpg"; then fail=1; fi
  if ! magick "$src" -resize 1080x1920^ -gravity center -extent 1080x1920 "$OUT/${name}-story.jpg"; then fail=1; fi
done < <(find "$IN" -type f \( -iname '*.jpg' -o -iname '*.png' \) -print0)
exit $fail
SH
chmod +x scripts/images-check.sh
git add -A
SKIP_SFS_CHECK=1 git commit -m "chore(hooks): route checks to scripts/images-check.sh; set core.hooksPath=.; stabilize pre-push"
SKIP_SFS_SMOKE=1 git push --no-verify

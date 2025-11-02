#!/usr/bin/env bash
set -euo pipefail; IFS=$'\n\t'

sample="sample.jpg"
# Make/seed a sample if missing
if [[ ! -f "$sample" ]]; then
  if command -v curl >/dev/null 2>&1; then
    curl -L -o "$sample" https://picsum.photos/seed/sfs/1600/1200
  else
    magick -size 1600x1200 gradient:#111-#333 "$sample"
  fi
fi

# 1) Export IG post + story from the sample
bash sfs-tools.sh square --channel ig --kind post -- "$sample"
bash sfs-tools.sh story  --channel ig --kind story --guides -- "$sample"

# 2) Brand theme pass
bash sfs-tools.sh wm-circuit --src out --dst out/wm \
  --tint '#00FFD1' --opacity 0.18 --blend screen --panels --panel-width 12 --panel-opacity 0.14
bash sfs-tools.sh wm-text "Glass Circuit" --src out/wm --dst out/wm \
  --pos southeast --size 72 --opacity 0.22 --pad 28
if [[ -f assets/brand/logo.png ]]; then
  bash sfs-tools.sh wm-logo assets/brand/logo.png --src out/wm --dst out/wm \
    --pos northeast --scale 220 --logo-opacity 0.8 --pad 28
else
  echo "⚠️  assets/brand/logo.png missing; skipping logo overlay"
fi

# 3) Sanity + bundle
bash scripts/sfs-nightly-check.sh || true
bash sfs-tools.sh export --src out --name sfs-assets --dist dist
echo "✅ Smoke run complete."

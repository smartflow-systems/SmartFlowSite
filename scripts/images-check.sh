#!/usr/bin/env bash
set -euo pipefail
if ! command -v magick >/dev/null 2>&1; then
  echo "⚠️ ImageMagick not found; skipping image generation"; exit 0
fi
IN="${1:-assets/raw}"; OUT="${2:-assets/build}"
mkdir -p "$OUT"; found=0
while IFS= read -r -d '' src; do
  found=1; base="$(basename "$src")"; name="${base%.*}"
  echo "==> $base → square/story"
  magick "$src" -resize 1080x1080^ -gravity center -extent 1080x1080 "$OUT/${name}-square.jpg"
  magick "$src" -resize 1080x1920^ -gravity center -extent 1080x1920 "$OUT/${name}-story.jpg"
done < <(find "$IN" -type f \( -iname '*.jpg' -o -iname '*.png' \) -print0)
[[ $found -eq 1 ]] || echo "No images in $IN"

#!/usr/bin/env bash
set -euo pipefail
banner(){ printf "\n\033[1m==> %s\033[0m\n" "$*"; }
ok(){ printf "✔ %s\n" "$*"; }
warn(){ printf "\033[33m⚠ %s\033[0m\n" "$*"; }
die(){ printf "\033[31m✖ %s\033[0m\n" "$*" >&2; exit 1; }
need(){ command -v "$1" >/dev/null 2>&1 || die "Missing $1"; }

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$ROOT"
need magick; need identify; [[ -x ./sfs-tools.sh ]] || die "sfs-tools.sh not executable"

# Ensure sample source
mkdir -p assets/raw
if ! ls assets/raw/* >/dev/null 2>&1; then
  banner "Seed sample in assets/raw/"
  curl -L -o assets/raw/sample.jpg https://picsum.photos/seed/sfs/1600/1200 >/dev/null 2>&1 || die "sample download failed"
  ok "assets/raw/sample.jpg"
fi

# Square + Story
banner "Square + Story"
./sfs-tools.sh square assets/raw/* --channel ig --kind post
./sfs-tools.sh story  assets/raw/* --channel ig --kind story --guides
ok "base exports done"

# Circuit + side panels
banner "wm-circuit"
./sfs-tools.sh wm-circuit --src out --dst out/wm --tint '#00FFD1' --opacity 0.18 --blend screen --panels --panel-width 12 --panel-opacity 0.14
ok "circuit theme done"

# Text
banner "wm-text"
./sfs-tools.sh wm-text "Glass Circuit" --src out/wm --dst out/wm --pos southeast --size 72 --opacity 0.22 --pad 28
ok "wm-text done"

# Logo (optional)
banner "wm-logo (optional)"
LOGO="assets/brand/logo.png"
if [[ -f "$LOGO" ]]; then
  ./sfs-tools.sh wm-logo "$LOGO" --src out/wm --dst out/wm --pos northeast --scale 220 --logo-opacity 0.8 --pad 28
  ok "wm-logo done"
else
  warn "logo not found at $LOGO"
fi

# Export
banner "Export bundle"
./sfs-tools.sh export --src out --name sfs-assets --dist dist

# Summary
banner "Summary"
SQ=$(ls out/*post* 2>/dev/null | wc -l | tr -d ' ')
ST=$(ls out/*story* 2>/dev/null | wc -l | tr -d ' ')
WM=$(ls out/wm/* 2>/dev/null | wc -l | tr -d ' ' || true)
PKG=$(ls dist/sfs-assets-*.tar.gz 2>/dev/null | tail -n1 || true)
printf "Posts: %s  Stories: %s  WM: %s\n" "$SQ" "$ST" "$WM"
[[ -n "$PKG" ]] && echo "Bundle: $PKG" || warn "no bundle found"

echo
identify -format "• %f => %wx%h\n" out/* 2>/dev/null | tail -n 6 || true
identify -format "• %f => %wx%h\n" out/wm/* 2>/dev/null | tail -n 6 || true

echo
if [[ -f out/manifest.csv ]]; then
  echo "Manifest tail:"
  tail -n 10 out/manifest.csv
fi
banner "Done ✅"

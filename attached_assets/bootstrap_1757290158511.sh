#!/usr/bin/env bash
# SmartFlow Systems — dev bootstrap
# Installs SmartFlow theme, glass+stars effect, and a GlassCard component.
# Safe by default; refuses to run on dirty git unless --force.
set -euo pipefail

FORCE=0
while [[ "${1:-}" != "" ]]; do
  case "$1" in
    --force) FORCE=1 ;;
    *) echo "Unknown arg: $1" ; exit 1 ;;
  esac
  shift || true
done

# 0) Sanity: refuse on dirty repo unless forced
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if [[ $FORCE -eq 0 ]] && [[ -n "$(git status --porcelain)" ]]; then
    echo "❌ Git working tree not clean. Commit/stash or rerun with --force."
    exit 2
  fi
else
  echo "ℹ️ No git repo detected. Proceeding."
fi

ROOT="$(pwd)"
echo "📂 Project: $ROOT"

# 1) Choose src base (supports client/src or src or create src)
if [[ -d "$ROOT/client/src" ]]; then
  SRC="$ROOT/client/src"
  REL_TO_ROOT="../.."
elif [[ -d "$ROOT/src" ]]; then
  SRC="$ROOT/src"
  REL_TO_ROOT=".."
else
  SRC="$ROOT/src"
  REL_TO_ROOT=".."
  mkdir -p "$SRC"
fi
echo "🧭 Using source dir: $SRC"

# 2) Make folders
mkdir -p "$ROOT/smartflow-kit/brand/logos"
mkdir -p "$SRC/components"
mkdir -p "$ROOT/public/assets/brand" 2>/dev/null || true

# 3) Write theme CSS (canonical) + copy into src for easy import
THEME_CANON="$ROOT/smartflow-kit/smartflow-theme.css"
cat > "$THEME_CANON" <<'CSS'
:root{
  --sf-black:#0D0D0D;--sf-brown:#3B2F2F;--sf-gold:#FFD700;--sf-gold-2:#E6C200;
  --sf-beige:#F5F5DC;--sf-white:#FFFFFF;--sf-gold-grad:linear-gradient(90deg,#FFD700 0%,#E6C200 100%)
}
.sf-bg{background:var(--sf-black);color:var(--sf-white)}
.sf-card{background:color-mix(in oklab, var(--sf-brown) 70%, transparent);border:1px solid #ffffff22;
  border-radius:16px;backdrop-filter:blur(10px);padding:1rem;box-shadow:0 8px 24px #00000066}
.sf-btn{background:var(--sf-gold);color:var(--sf-black);border-radius:12px;padding:.7rem 1rem;font-weight:800}
.sf-btn:hover{background:var(--sf-gold-2)}
.sf-glass{position:relative;background:linear-gradient(to bottom right,#ffffff10,#ffffff06);
  border:1px solid #ffffff2a;border-radius:18px;backdrop-filter:blur(12px);box-shadow:0 10px 30px #00000066}
.sf-shine{background:var(--sf-gold-grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.sf-stars{position:relative;overflow:hidden}
.sf-stars:after{content:"";position:absolute;inset:-50%;pointer-events:none;
  background:
    radial-gradient(circle at 20% 30%, #fff8 2px, #0000 3px),
    radial-gradient(circle at 60% 70%, #fff8 1.5px, #0000 2.5px),
    radial-gradient(circle at 80% 20%, #fff8 2px, #0000 3px),
    radial-gradient(circle at 30% 80%, #fff8 1.5px, #0000 2.5px);
  animation: sfTwinkle 6s linear infinite;filter:drop-shadow(0 0 6px #FFD700aa)}
@keyframes sfTwinkle{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-2%,1%,0) scale(1.05)}100%{transform:translate3d(0,0,0) scale(1)}}
CSS

# mirror into src for simple @import
cp "$THEME_CANON" "$SRC/smartflow-theme.css"

# 4) Logos
cat > "$ROOT/public/assets/brand/sfs-logo-gold.svg" <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="200" viewBox="0 0 640 200">
  <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#E6C200"/></linearGradient>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect width="640" height="200" fill="#0D0D0D"/><text x="40" y="130" font-family="Inter,Arial,sans-serif" font-weight="900" font-size="96" fill="url(#g)" filter="url(#glow)">SMARTFLOW SYSTEMS</text>
</svg>
SVG

cat > "$ROOT/public/assets/brand/sfs-logo-mono-white.svg" <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="200" viewBox="0 0 640 200">
  <rect width="640" height="200" fill="#FFD700"/><text x="40" y="130" font-family="Inter,Arial,sans-serif" font-weight="900" font-size="96" fill="#FFFFFF">SMARTFLOW SYSTEMS</text>
</svg>
SVG

# 5) Component
COMP_TSX="$SRC/components/GlassCard.tsx"
if [[ -f "$COMP_TSX" && $FORCE -eq 0 ]]; then
  echo "❌ $COMP_TSX exists. Rerun with --force to overwrite."
  exit 3
fi
cat > "$COMP_TSX" <<'TSX'
import React from "react";
export default function GlassCard({ title, children, cta }: { title:string; children:React.ReactNode; cta?:React.ReactNode }){
  return (
    <div className="sf-glass sf-stars p-5">
      <h3 className="sf-shine text-2xl font-extrabold tracking-tight">{title}</h3>
      <div className="mt-3 text-[rgba(255,255,255,.9)]">{children}</div>
      {cta ? <div className="mt-4">{cta}</div> : null}
    </div>
  );
}
TSX

# 6) Ensure CSS import in index.css (create if missing). Backup before edit.
IDX=""
for f in "$SRC/index.css" "$SRC/styles.css"; do
  if [[ -f "$f" ]]; then IDX="$f"; break; fi
done
if [[ -z "$IDX" ]]; then IDX="$SRC/index.css"; echo "/* SmartFlow index */" > "$IDX"; fi
cp "$IDX" "$IDX.bak"
if ! grep -q 'smartflow-theme.css' "$IDX"; then
  printf '@import "./smartflow-theme.css";\n' >> "$IDX"
fi

# 7) Optional Tailwind note (no-op): user can integrate tokens with Tailwind if present.

# 8) Git add
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git add smartflow-kit "$SRC/smartflow-theme.css" "$COMP_TSX" "$IDX" public/assets/brand || true
  echo "✅ Staged changes. Review: git diff --staged"
fi

echo "🎉 SmartFlow bootstrap complete."
echo "Files:"
echo " - smartflow-kit/smartflow-theme.css (canonical)"
echo " - $(realpath --relative-to="$ROOT" "$SRC")/smartflow-theme.css (imported by index.css)"
echo " - $(realpath --relative-to="$ROOT" "$COMP_TSX")"
echo " - public/assets/brand/sfs-logo-*.svg"
echo "Next:"
echo " 1) Use <GlassCard title='Hello'>…</GlassCard> in your UI"
echo " 2) Commit: git commit -m 'chore(smartflow): bootstrap theme + glass card'"
echo " 3) Run dev and admire the gold."

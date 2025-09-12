#!/usr/bin/env bash
set -euo pipefail

URL="${1:-}"         # live Pages URL (optional)
CNAME_VAL="${2:-}"   # custom domain (optional)

mkdir -p public

# 404 page
cat > public/404.html <<'EOF'
<!doctype html><meta charset="utf-8">
<title>Page not found</title>
<style>body{font-family:system-ui;padding:2rem;}</style>
<h1>404</h1><p>We can’t find that page. <a href="/">Go home</a>.</p>
EOF

# Optional CNAME
if [[ -n "$CNAME_VAL" ]]; then
  printf "%s\n" "$CNAME_VAL" > public/CNAME
  echo "CNAME set to: $CNAME_VAL"
fi

# Optional README link
if [[ -n "$URL" ]]; then
  {
    echo
    echo "[**Live site**]($URL)"
  } >> README.md
  echo "Added live link to README.md"
fi

git add public/404.html public/CNAME 2>/dev/null || true
git add README.md 2>/dev/null || true
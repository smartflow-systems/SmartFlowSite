#!/usr/bin/env bash
set -euo pipefail
say(){ printf "\033[1;36m==> %s\033[0m\n" "$*"; }

URL="${1:-}"      # pass your live pages URL after first deploy (e.g. https://smartflow-systems.github.io/SmartFlowSite/)
CNAME_VAL="${2:-}"# optional custom domain (e.g. smartflow.site)

mkdir -p public

# 404 page (helps SPA / broken links)
cat > public/404.html <<'EOF'
<!doctype html><meta charset="utf-8">
<title>Page not found</title>
<style>body{font-family:system-ui;padding:2rem;}</style>
<h1>404</h1><p>We can’t find that page. <a href="/">Go home</a>.</p>
EOF

# Optional CNAME
if [[ -n "$CNAME_VAL" ]]; then
  echo "$CNAME_VAL" > public/CNAME
  say "CNAME set to $CNAME_VAL"
fi

# Update README with Live link (if URL provided)
if [[ -n "$URL" ]]; then
  START="<!-- BADGES:START -->"; END="<!-- BADGES:END -->"
  tmp="$(mktemp)"
  awk -v start="$START" -v end="$END" -v url="$URL" '
    BEGIN{inblk=0; printed=0}
    {
      if ($0 ~ start){ print; inblk=1; next }
      if ($0 ~ end){
        if (!printed){ print "[**Live site**]("url")"; printed=1 }
        print; inblk=0; next
      }
      print
    }
    END{ if (!printed) print "\n[**Live site**]("url")\n" }
  ' README.md 2>/dev/null > "$tmp" || echo -e "[**Live site**]($URL)\n" > "$tmp"
  mv "$tmp" README.md
  say "README updated with live link."
fi

git add public/404.html public/CNAME 2>/dev/null || true
git add README.md 2>/dev/null || true
./tools/sf save "docs: add 404 page${CNAME_VAL:+, CNAME} and README live link"

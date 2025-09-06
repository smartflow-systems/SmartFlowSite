#!/usr/bin/env bash
set -euo pipefail
CMD="${1:-setup}"

write_vercel_json() {
  [[ -f vercel.json ]] && echo "vercel.json exists" && return 0
  cat > vercel.json <<'JSON'
{
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    { "source": "/assets/(.*)", "headers":[{"key":"Cache-Control","value":"public, max-age=31536000, immutable"}] }
  ]
}
JSON
  echo "✓ vercel.json written"
}

write_pages_yml() {
  [[ -f .github/workflows/pages.yml ]] && echo "pages.yml exists" && return 0
  cat > .github/workflows/pages.yml <<'YML'
name: Deploy Pages
on: {push: {branches: [main]}}
permissions: {pages: write, id-token: write, contents: read}
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: {path: "."}
      - uses: actions/deploy-pages@v4
YML
  echo "✓ GitHub Pages workflow written"
}

update_pkg_scripts() {
node - <<'NODE'
const fs=require('fs');const p='package.json';
const pkg=fs.existsSync(p)?JSON.parse(fs.readFileSync(p)):{name:"smartflow-site",version:"0.0.0",scripts:{}};
pkg.scripts = {...pkg.scripts,
  "deploy:pages":"bash scripts/smartflow-github-vercel.sh pages",
  "deploy:vercel":"bash scripts/smartflow-github-vercel.sh vercel"
};
fs.writeFileSync(p, JSON.stringify(pkg,null,2)); console.log('✓ package.json scripts updated');
NODE
}

case "$CMD" in
  setup)
    write_vercel_json; write_pages_yml; update_pkg_scripts
    git add vercel.json .github/workflows/pages.yml package.json || true
    git commit -m "chore: add vercel.json + pages workflow + deploy scripts" || true
    git push || true
    echo "✓ Setup complete. Use: npm run deploy:pages  or  npm run deploy:vercel"
  ;;
  pages)
    write_pages_yml
    git add .github/workflows/pages.yml && git commit -m "deploy: pages" || true
    git push
    echo "✓ Pushed. GitHub Pages Action will deploy."
  ;;
  vercel)
    write_vercel_json
    if command -v vercel >/dev/null 2>&1; then
      vercel --prod --yes
    else
      echo "⚠ vercel CLI not found. Install: npm i -g vercel"
      echo "Then run: vercel --prod --yes"
    fi
  ;;
  *) echo "Usage: bash scripts/smartflow-github-vercel.sh [setup|pages|vercel]";;
esac

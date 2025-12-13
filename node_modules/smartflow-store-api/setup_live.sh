#!/usr/bin/env bash
set -euo pipefail

# 1) Folders
mkdir -p data .github/workflows

# 2) site.config.json
cat > site.config.json <<'JSON'
{
  "siteName": "SmartFlow Systems",
  "calendlyUrl": "https://calendly.com/your-handle/30min",
  "leadWebhook": "",
  "leadMagnetUrl": "assets/lead-magnet-smartflow.pdf",
  "smartPartUrl": "https://your-smartpart.replit.app",
  "projects": [
    {"name":"AI Social Bot","tagline":"Auto-engage & publish","repo":"boweazy/SocialScaleBoosterAIbot","demo":"https://your-demo.ai-bot","cta":"Buy","ctaUrl":"#"},
    {"name":"Booking System","tagline":"Stripe + Calendar","repo":"boweazy/SmartFlowBooking","demo":"https://your-demo.booking","cta":"Book Demo","ctaUrl":"#"},
    {"name":"E-com Shops","tagline":"Pay, ship, grow","repo":"boweazy/SmartFlowEcom","demo":"https://your-demo.ecom","cta":"Buy","ctaUrl":"#"},
    {"name":"Websites","tagline":"Premium pages","repo":"boweazy/SmartFlowSite-Templates","demo":"https://your-demo.sites","cta":"Book","ctaUrl":"#"}
  ]
}
JSON

# 3) Latest posts for #latest
cat > data/posts.json <<'JSON'
[
  {"title":"v0.2 — API Boost + landing copy","date":"2025-08-28","url":"updates.html#v0-2"},
  {"title":"v0.3 — Presets + Save Boosts","date":"2025-09-02","url":"updates.html#v0-3"},
  {"title":"Roadmap — Calendar, Analytics, Pricing, Cases","date":"2025-09-05","url":"updates.html#roadmap"}
]
JSON

# 4) GitHub Pages workflow (already added? re-write ok)
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

# 5) Commit + push
git add site.config.json data/posts.json .github/workflows/pages.yml
git commit -m "chore: config + latest + pages deploy (fix)" || echo "Nothing to commit"
git push

echo "✅ Done. In GitHub → Settings → Pages, set Source = GitHub Actions."

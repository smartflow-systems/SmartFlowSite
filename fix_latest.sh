set -euo pipefail

# 0) Undo accidental commit text in styles.css (restore from newest backup if found)
if grep -q "feat: Latest from GitHub" styles.css 2>/dev/null; then
  latest=$(ls -t styles.css.bak.* 2>/dev/null | head -n1 || true)
  [ -n "${latest:-}" ] && cp "$latest" styles.css && echo "🔁 Restored styles.css from $latest"
fi

# 1) Backups
for f in index.html styles.css app.js site.config.json; do
  [ -f "$f" ] && cp "$f" "$f.bak.$(date +%s)" || true
done

# 2) HTML inject (once)
if ! grep -q 'id="latest"' index.html 2>/dev/null; then
  awk '1; /<\/body>/{print "  <section id=\"latest\" class=\"wrap\"><h2 class=\"sf-shine\">Latest from GitHub</h2><div id=\"latest-feed\" class=\"latest-grid\" aria-live=\"polite\"><article class=\"latest-item skeleton\"></article><article class=\"latest-item skeleton\"></article><article class=\"latest-item skeleton\"></article></div></section>"}' index.html > index.html.tmp && mv index.html.tmp index.html
fi

# 3) CSS append (once)
if ! grep -q '\.latest-grid' styles.css 2>/dev/null; then
cat >> styles.css <<'CSS'
.latest-grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.latest-item{background:rgba(255,255,255,.03);border:1px solid rgba(230,194,0,.35);backdrop-filter:blur(10px);padding:14px 16px;border-radius:14px}
.latest-item h3{margin:0 0 6px;color:#FFD700;font-size:1rem;line-height:1.2}
.latest-meta{display:flex;gap:12px;flex-wrap:wrap;font-size:.85rem;color:#E6C200}
.latest-repo{padding:2px 8px;border:1px solid #E6C200;border-radius:999px;color:#FFD700}
.latest-actions{margin-top:10px;display:flex;gap:10px}
.latest-actions a{font-size:.9rem}
.skeleton{position:relative;min-height:88px;overflow:hidden}
.skeleton:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);animation:shimmer 1.4s infinite}
@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
CSS
fi

# 4) JS append (once)
if ! grep -q 'renderLatest' app.js 2>/dev/null; then
cat >> app.js <<'JS'
async function loadCfg(){return (await fetch("site.config.json")).json()}
function timeAgo(d){const s=Math.floor((Date.now()-d.getTime())/1e3),t=[[31536e3,"y"],[2592e3,"mo"],[604800,"w"],[86400,"d"],[3600,"h"],[60,"m"]];for(const[sec,l]of t){const v=Math.floor(s/sec);if(v>=1)return`${v}${l} ago`}return`${s}s ago`}
async function renderLatest(){const w=document.querySelector("#latest-feed");if(!w)return;const{projects}=await loadCfg(),k="sf_latest_v1",ttl=9e5;try{const c=JSON.parse(localStorage.getItem(k)||"null");if(c&&Date.now()-c.when<ttl){w.innerHTML=c.html;return}}catch{}const cs=[];for(const p of projects){if(!p.repo)continue;try{const r=await fetch(`https://api.github.com/repos/${p.repo}/commits?per_page=3`,{headers:{Accept:"application/vnd.github+json"}});if(!r.ok)continue;const data=await r.json();for(const c of data){cs.push({repo:p.repo.split("/")[1],msg:(c.commit?.message||"Update").split("\n")[0],url:c.html_url,when:new Date(c.commit?.author?.date||c.commit?.committer?.date||Date.now())})}}catch{}}cs.sort((a,b)=>b.when-a.when);const top=cs.slice(0,3);if(!top.length){w.innerHTML='<p class="latest-item">No recent updates yet.</p>';return}w.innerHTML=top.map(c=>`<article class="latest-item"><h3>${c.msg}</h3><div class="latest-meta"><span class="latest-repo">${c.repo}</span><span>⏱ ${timeAgo(c.when)}</span></div><div class="latest-actions"><a class="link" href="${c.url}" target="_blank" rel="noopener">View commit →</a></div></article>`).join("");try{localStorage.setItem(k,JSON.stringify({when:Date.now(),html:w.innerHTML}))}catch{}}
document.addEventListener("DOMContentLoaded",()=>{typeof renderProjects==="function"&&renderProjects();renderLatest()})
JS
fi

# 5) Config create (if missing)
if [ ! -f site.config.json ]; then
cat > site.config.json <<'JSON'
{
  "siteName":"SmartFlow Systems",
  "projects":[
    {"slug":"ai-social-bot","name":"AI Social Bot","tagline":"Auto-engage & publish","repo":"boweazy/SFS-AIbofs-social-media","demo":"#","cta":"Buy","ctaUrl":"#"},
    {"slug":"smartflow-booking","name":"Booking System","tagline":"Stripe + Google Calendar","repo":"boweazy/SmartFlowBooking","demo":"#","cta":"Book Demo","ctaUrl":"#"},
    {"slug":"smartflow-ecom","name":"E-com Shops","tagline":"Pay, ship, grow","repo":"boweazy/SmartFlowEcom","demo":"#","cta":"Buy","ctaUrl":"#"},
    {"slug":"smartflow-sites","name":"Websites","tagline":"Fast, premium pages","repo":"boweazy/SmartFlowSite-Templates","demo":"#","cta":"Book","ctaUrl":"#"}
  ]
}
JSON
fi

echo "✅ Done. Next:"
echo "git add . && git commit -m 'fix: latest-from-github strip (safe reapply)' && git push"

#!/usr/bin/env bash
# Purpose: One-shot setup for GitHub + Vercel deploy of the Next.js Lux Gold kit
# Result: local Next app, git repo, initial commit, optional GitHub repo (gh CLI), clear next steps
# Usage:
#   bash scripts/smartflow-github-vercel.sh
#   APP_NAME=my-site SITE_NAME="SmartFlow" TAGLINE="Bookings, Bots & Shops" bash scripts/smartflow-github-vercel.sh

set -euo pipefail

: "${APP_NAME:=smartflow-next}"
: "${SITE_NAME:=SmartFlow Systems}"
: "${TAGLINE:=Bookings, Bots & Shops that Sell Themselves}"
: "${REPO_NAME:=${APP_NAME}}"

need(){ command -v "$1" >/dev/null 2>&1 || { echo "❌ Required command missing: $1"; exit 1; }; }
need node; need npm

if [[ -d "$APP_NAME" ]]; then
  echo "ℹ️  Folder '$APP_NAME' exists; skipping scaffold."
else
  echo "🚧 Scaffolding Next.js Lux Gold kit into '$APP_NAME'…"
  # --- Inline minimal version of smartflow-next-master (subset to keep script short) ---
  npx --yes create-next-app@latest "$APP_NAME" --ts --tailwind --eslint --app --use-npm --import-alias "@/*" >/dev/null
  pushd "$APP_NAME" >/dev/null
  npm i framer-motion lucide-react clsx >/dev/null

  # styles
  cat > app/globals.css <<'CSS'
@tailwind base; @tailwind components; @tailwind utilities;
:root{ --sf-bg:#0e0b09; --sf-bg-2:#1a1410; --sf-text:#f7f2e8; --sf-muted:#c9bca9; --sf-gold:#FFD700; --sf-gold-2:#E6C200; --sf-gold-soft:rgba(255,215,0,.14); --sf-brown:#2b201a; --sf-beige:#f1e7d2 }
html,body{height:100%}
body{ margin:0; color:var(--sf-text); background:radial-gradient(120% 100% at 50% -20%,var(--sf-bg-2) 0%,var(--sf-bg) 60%) }
.section{ max-width:64rem; margin:0 auto; padding:56px 20px }
.btn{ display:inline-block; border-radius:999px; padding:12px 18px; border:1px solid rgba(255,215,0,.35); background:rgba(255,215,0,.08); color:inherit }
.sf-shine{ position:relative; display:inline-block; background:linear-gradient(90deg,var(--sf-gold),var(--sf-gold-2)); -webkit-background-clip:text; background-clip:text; color:transparent }
.sf-shine:after{ content:""; position:absolute; inset:0; background:linear-gradient(120deg,transparent 0%,rgba(255,255,255,.8) 25%,transparent 50%); transform:skewX(-20deg) translateX(-120%); animation:shine 3.6s ease-in-out infinite; mix-blend-mode:screen; pointer-events:none }
@keyframes shine{ to{ transform:skewX(-20deg) translateX(120%) } }
.parallax-hero{ position:relative; min-height:80vh; overflow:hidden; border-bottom:1px solid #2a2121 }
.parallax-hero video,.parallax-hero .bg{ position:absolute; inset:-8% -8%; width:116%; height:116%; object-fit:cover; filter:brightness(.35) saturate(1.2); transform:translateZ(0) }
.parallax-hero .inner{ position:relative; z-index:3; display:grid; place-items:center; min-height:80vh; padding:64px 20px }
.parallax-hero .veil{ position:absolute; inset:0; background:radial-gradient(60% 60% at 50% 20%,rgba(255,215,0,.12),transparent 55%); z-index:2 }
.window{ position:relative; border-radius:16px; background:linear-gradient(180deg, rgba(255,215,0,.05), rgba(255,215,0,0) 38%), rgba(20,16,12,.52); border:1px solid rgba(255,215,0,.18); outline:1px solid rgba(255,255,255,.06); box-shadow:0 0 0 1px rgba(0,0,0,.25) inset, 0 18px 50px rgba(0,0,0,.45); backdrop-filter:blur(6px) saturate(1.08) }
.window .chrome{ display:flex; gap:8px; align-items:center; padding:10px 12px; border-bottom:1px solid rgba(255,215,0,.14); background:linear-gradient(180deg, rgba(255,215,0,.10), rgba(0,0,0,0)); border-top-left-radius:16px; border-top-right-radius:16px }
.dot{ width:10px; height:10px; border-radius:999px; display:inline-block; box-shadow:0 0 0 1px rgba(0,0,0,.35) inset }
.dot.red{ background:#ff5f56 } .dot.yellow{ background:#ffbd2e } .dot.green{ background:#27c93f }
.card{ padding:16px; background:transparent } .card.window{ padding:0 } .card .body{ padding:18px }
.gold-back{ position:fixed; inset:-10% -10% -10% -10%; z-index:0; pointer-events:none }
.gold-bokeh{ position:absolute; inset:0; background:radial-gradient(280px 200px at 20% 18%, var(--sf-gold-soft), transparent 60%), radial-gradient(320px 240px at 80% 12%, rgba(255,215,0,.10), transparent 65%), radial-gradient(380px 260px at 50% 70%, rgba(255,188,0,.08), transparent 70%); filter:saturate(1.2) blur(0.2px); animation:bokehFloat 26s ease-in-out infinite alternate }
@keyframes bokehFloat{ 0%{ transform:translate3d(0,0,0) } 100%{ transform:translate3d(0,-20px,0) } }
.gold-noise{ position:absolute; inset:-50%; opacity:.05; background:repeating-conic-gradient(from 0deg, rgba(255,215,0,.12) 0 2deg, transparent 2deg 4deg), repeating-linear-gradient(0deg, rgba(255,255,255,.08) 0 1px, transparent 1px 2px); mix-blend-mode:soft-light; filter:contrast(150%) brightness(110%); animation:noiseDrift 40s linear infinite }
@keyframes noiseDrift{ to{ transform:rotate(360deg) } }
@media (prefers-reduced-motion: reduce){ .sf-shine:after{ animation:none } }
CSS

  # layout
  cat > app/layout.tsx <<TSX
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "${SITE_NAME} — ${TAGLINE}", description: "${TAGLINE}" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return (<html lang="en"><body>{children}</body></html>); }
TSX

  mkdir -p components public/assets/video public/assets/img scripts

  cat > components/GoldBack.tsx <<'TSX'
'use client'
import { useEffect, useRef } from 'react'
export default function GoldBack({ force=false }: { force?: boolean }){
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(()=>{ const el=ref.current; if(!el) return; const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches; if(reduce && !force) return; const ctx=el.getContext('2d',{alpha:true})!; let W=0,H=0,parts:any[]=[]; let running=true, mult=1; const dpr=window.devicePixelRatio||1; const coarse=matchMedia('(pointer: coarse)').matches; const base0=coarse?60:120; const ampBase=coarse?0.35:0.55; const rand=(a:number,b:number)=>a+Math.random()*(b-a); const newP=()=>({x:rand(-W*0.05,W*1.05),y:rand(-H*0.05,H*1.05),r0:rand(0.6,2.2),a:rand(0.22,0.7),vx:rand(-0.04,0.04),vy:rand(-0.015,-0.06),tw:rand(0.8,1.8),ph:rand(0,Math.PI*2),amp:ampBase*rand(0.7,1.3)}); const resize=()=>{const r=el.getBoundingClientRect();W=r.width;H=r.height;el.width=Math.max(1,(W*dpr)|0);el.height=Math.max(1,(H*dpr)|0);ctx.setTransform(dpr,0,0,dpr,0,0);const n=Math.max(50,Math.round(base0*(W*H)/(1280*720)*mult));parts=Array.from({length:n},newP)}; const reset=(p:any)=>Object.assign(p,newP()); const draw=()=>{ if(!running) return; ctx.clearRect(0,0,W,H); (ctx as any).globalCompositeOperation='lighter'; for(const p of parts){ p.x+=p.vx;p.y+=p.vy;p.ph+=0.02; if(p.y<-40||p.x<-40||p.x>W+40) reset(p); const pulse=1+p.amp*Math.sin(p.ph*p.tw); const R=p.r0*6*pulse; const tw=p.a*(0.7+0.3*Math.cos(p.ph*p.tw*1.1)); const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,R); g.addColorStop(0,`rgba(255,215,0,${tw})`); g.addColorStop(0.35,`rgba(240,200,20,${tw*0.6})`); g.addColorStop(1,'rgba(255,215,0,0)'); ctx.fillStyle=g as any; ctx.beginPath(); ctx.arc(p.x,p.y,R,0,Math.PI*2); ctx.fill() } requestAnimationFrame(draw) }; const onR=()=>resize(); resize(); draw(); addEventListener('resize',onR); (window as any).__sparkles={start:()=>{if(running) return; running=true; draw()}, stop:()=>{running=false}, setDensity:(n:number)=>{mult=Math.max(0.3,Math.min(n,3)); resize()}}; return ()=>{running=false; removeEventListener('resize',onR)} },[force])
  return (<div className="gold-back" aria-hidden><canvas ref={ref} className="absolute inset-0 w-full h-full"/><div className="gold-bokeh"/><div className="gold-noise"/></div>)
}
TSX

  cat > components/ParallaxHero.tsx <<'TSX'
'use client'
import { useEffect, useRef } from 'react'
export default function ParallaxHero({ src, poster, children }:{ src:string; poster?:string; children?:React.ReactNode }){
  const vidRef = useRef<HTMLVideoElement>(null)
  useEffect(()=>{ const bg=vidRef.current; if(!bg) return; let t=false; const run=()=>{ const y=scrollY||0; const k=Math.min(40,y*0.06); (bg as any).style.transform=`translate3d(0,${k}px,0) scale(1.02)`; t=false }; const onS=()=>{ if(!t){ t=true; requestAnimationFrame(run) } }; run(); addEventListener('scroll',onS,{passive:true}); const io='IntersectionObserver'in window? new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){ bg.play().catch(()=>{}) } else { bg.pause() } }) },{threshold:0.2}) : null; io?.observe(bg); return ()=>{ removeEventListener('scroll',onS); io?.disconnect() } },[])
  return (<section className="parallax-hero"><video ref={vidRef} src={src} poster={poster} autoPlay muted playsInline loop /><div className="veil"/><div className="inner section">{children}</div></section>)
}
TSX

  cat > components/Window.tsx <<'TSX'
import { ReactNode } from 'react'
export default function Window({ children, withChrome=true }: { children:ReactNode; withChrome?:boolean }){
  return (<div className="window">{withChrome && (<div className="chrome"><span className="dot red"/> <span className="dot yellow"/> <span className="dot green"/></div>)}<div className="body p-5">{children}</div></div>)
}
TSX

  cat > components/MagnetCard.tsx <<'TSX'
'use client'
import { HTMLAttributes } from 'react'
export default function MagnetCard({ className='', ...rest }: HTMLAttributes<HTMLDivElement>){
  const onMove=(e: any)=>{ const el=e.currentTarget as HTMLElement; const r=el.getBoundingClientRect(); const dx=(e.clientX-(r.left+r.width/2))/(r.width/2); const dy=(e.clientY-(r.top+r.height/2))/(r.height/2); el.style.setProperty('--mx',`${dx*6}px`); el.style.setProperty('--my',`${dy*6}px`) }
  const onLeave=(e: any)=>{ const el=e.currentTarget as HTMLElement; el.style.removeProperty('--mx'); el.style.removeProperty('--my') }
  return <div onMouseMove={onMove} onMouseLeave={onLeave} className={`magnet card window ${className}`} {...rest} />
}
TSX

  cat > app/page.tsx <<TSX
import GoldBack from "@/components/GoldBack";
import ParallaxHero from "@/components/ParallaxHero";
import Window from "@/components/Window";
import MagnetCard from "@/components/MagnetCard";

export default function Page(){
  return (
    <main className="relative">
      <GoldBack force />
      <ParallaxHero src="/assets/video/hero.mp4" poster="/assets/img/hero-poster.jpg">
        <div style={{textAlign:'center',maxWidth:840,margin:'0 auto'}}>
          <h1 className="sf-shine" style={{fontSize:'clamp(38px,7vw,78px)',lineHeight:1.04}}>
            ${SITE_NAME} — ${TAGLINE}
          </h1>
          <p style={{margin:'18px auto 28px',maxWidth:680,color:'var(--sf-beige)',opacity:.9}}>
            Faster than templated builders. Smarter than “just a website.” Your automation stack in one place.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href="#pricing" className="btn">Start Free →</a>
            <a href="#projects" className="btn" style={{background:'var(--sf-brown)',color:'var(--sf-gold)'}}>See Demos</a>
          </div>
        </div>
      </ParallaxHero>

      <section id="projects" className="section">
        <Window>
          <h2 className="sf-shine" style={{fontSize:'clamp(24px,4vw,40px)'}}>Projects</h2>
          <div className="grid" style={{display:'grid',gap:16,gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',marginTop:12}}>
            <MagnetCard><div className="chrome"/><div className="body"><h3>AI Bot</h3><p>Replies, DMs, content—on autopilot.</p><a className="btn" href="#">Demo</a></div></MagnetCard>
            <MagnetCard><div className="chrome"/><div className="body"><h3>Booking</h3><p>Stripe + Calendar + reminders.</p><a className="btn" href="#">Book</a></div></MagnetCard>
            <MagnetCard><div className="chrome"/><div className="body"><h3>E‑com Shops</h3><p>Fast storefronts with upsells.</p><a className="btn" href="#">Preview</a></div></MagnetCard>
            <MagnetCard><div className="chrome"/><div className="body"><h3>Websites</h3><p>Premium pages that convert.</p><a className="btn" href="#">See Sites</a></div></MagnetCard>
          </div>
        </Window>
      </section>

      <section id="pricing" className="section">
        <Window>
          <h2 className="sf-shine" style={{fontSize:'clamp(22px,3.5vw,34px)'}}>Choose your plan</h2>
          <div className="grid" style={{display:'grid',gap:16,gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',marginTop:10}}>
            <div className="card window"><div className="chrome"/><div className="body"><h3>Starter</h3><p>Launch fast.</p><a className="btn" href="#">Get Starter</a></div></div>
            <div className="card window"><div className="chrome"/><div className="body"><h3>Pro</h3><p>Scale systems.</p><a className="btn" href="#">Get Pro</a></div></div>
            <div className="card window"><div className="chrome"/><div className="body"><h3>Premium</h3><p>Done-for-you.</p><a className="btn" href="#">Get Premium</a></div></div>
          </div>
        </Window>
      </section>
      <footer className="section opacity-70"><small>© ${SITE_NAME}</small></footer>
    </main>
  )
}
TSX

  # ffmpeg helper
  cat > scripts/video-opt.sh <<'BASH'
#!/usr/bin/env bash
set -euo pipefail
IN=${1:-}; OUT=${2:-public/assets/video/hero.mp4}; POSTER=${3:-public/assets/img/hero-poster.jpg}
if [[ -z "$IN" ]]; then echo "Usage: $0 input.mp4 [out.mp4] [poster.jpg]"; exit 1; fi
mkdir -p "$(dirname "$OUT")" "$(dirname "$POSTER")"
START=${START:-0}; DUR=${DUR:-8}
ffmpeg -y -ss "$START" -t "$DUR" -i "$IN" -vf "scale='min(1280,iw)':-2:flags=lanczos,format=yuv420p" -r 30 -c:v libx264 -profile:v high -preset veryfast -crf 23 -pix_fmt yuv420p -movflags +faststart -an "$OUT"
ffmpeg -y -ss "$START" -i "$IN" -vframes 1 -vf "scale=1280:-1" "$POSTER"
echo "✅ $OUT + $POSTER ready"
BASH
  chmod +x scripts/video-opt.sh

  popd >/dev/null
fi

# --- Git init + optional GitHub (gh) ---
cd "$APP_NAME"
if [[ ! -d .git ]]; then
  git init -b main >/dev/null
  git add .
  git commit -m "feat: init SmartFlow Lux Gold kit" >/dev/null
fi

if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    echo "🌐 Creating GitHub repo '$REPO_NAME' (private)…"
    gh repo create "$REPO_NAME" --private --source . --remote origin --push >/dev/null || true
  else
    echo "⚠️  gh installed but not logged in. Run: gh auth login"
  fi
else
  echo "ℹ️  GitHub CLI not found. You can create a repo at github.com/new and then:"
  echo "    git remote add origin <your_repo_url>"
  echo "    git push -u origin main"
fi

cat > NEXT_STEPS.txt <<TXT
NEXT STEPS — Deploy the simplest way (Vercel + GitHub)
1) (If not done) Push to GitHub — see above logs or run: git remote add origin <repo>; git push -u origin main
2) Go to vercel.com → Sign in with GitHub → Import Project → pick '${REPO_NAME}'
3) Framework = Next.js (auto). Root directory = '${PWD##*/}'. No env vars needed.
4) Click Deploy. Every push to 'main' will auto-deploy.

Optional (optimize your video):
  scripts/video-opt.sh /path/to/your.mp4
TXT

printf "\n✅ All set in %s\n→ Open: %s\n→ Dev: npm run dev\n→ Read: NEXT_STEPS.txt for Vercel steps\n" "$APP_NAME" "$APP_NAME"

#!/usr/bin/env bash
set -euo pipefail
[ -d node_modules ] || npm install --no-audit --no-fund

framework="$(node - <<'NODE'
const fs=require('fs');
try{
  const j=JSON.parse(fs.readFileSync('package.json','utf8'));
  const d={...j.dependencies, ...j.devDependencies};
  if(d?.next)            { console.log('next');       }
  else if(d?.nuxt)       { console.log('nuxt');       }
  else if(d?.astro)      { console.log('astro');      }
  else if(d?.['@sveltejs/kit']) { console.log('sveltekit'); }
  else if(d?.vite)       { console.log('vite');       }
  else                   { console.log('unknown');    }
} catch { console.log('unknown'); }
NODE
)"
PORT="${PORT:-5173}"

case "$framework" in
  next)       npx next dev -H 0.0.0.0 -p "$PORT" ;;
  nuxt)       npx nuxt dev --host 0.0.0.0 --port "$PORT" ;;
  astro)      npx astro dev --host 0.0.0.0 --port "$PORT" ;;
  sveltekit)  npm run dev -- --host 0.0.0.0 --port "$PORT" ;;
  vite|unknown)
              npm run dev -- --host 0.0.0.0 --port "$PORT" ;;
esac

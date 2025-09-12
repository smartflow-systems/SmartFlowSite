#!/usr/bin/env bash
set -euo pipefail
say(){ printf "\033[1;36m==> %s\033[0m\n" "$*"; }
err(){ printf "\033[31m%s\033[0m\n" "$*"; }

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { err "Run inside your repo."; exit 1; }

BACKUP="$(ls -1t package.json.bak-* 2>/dev/null | head -n1 || true)"
[[ -z "${BACKUP:-}" ]] && { err "No package.json.bak-* backup found."; exit 1; }

say "Repairing backup (strip comments, fix quotes, remove newlines inside strings, strip trailing commas, quote keys)…"
node <<'NODE'
const fs = require('fs');

function normalizeAndRepair(s){
  // Normalize line endings & BOM
  s = s.replace(/\r/g,'');
  if (s.charCodeAt(0)===0xFEFF) s = s.slice(1);
  // Normalize “ ” ’ quotes to "
  s = s.replace(/[“”]/g,'"').replace(/[’]/g,"'");

  // 1) Strip // and /* */ comments, normalize quotes to ", and REMOVE newlines INSIDE strings
  let out='', inStr=false, q='"', esc=false, line=false, block=false;
  for (let i=0;i<s.length;i++){
    const c=s[i], n=s[i+1];
    if (line){ if (c==='\n'){ line=false; out+=c; } continue; }
    if (block){ if (c==='*'&&n==='/'){ block=false; i++; } continue; }
    if (!inStr){
      if (c==='/'&&n==='/'){ line=true; i++; continue; }
      if (c==='/'&&n==='*'){ block=true; i++; continue; }
      if (c==='\"'||c==="'"){ inStr=true; q=c; out+='"'; continue; } // open string, normalize to "
      out += c;
    } else {
      if (esc){ out+=c; esc=false; continue; }
      if (c==='\\'){ out+='\\'; esc=true; continue; }
      if (c==='\n'){ out+=' '; continue; } // <-- key fix: JSON cannot have raw newlines in strings
      if (c===q){ inStr=false; out+='"'; continue; } // close string
      if (q==="'" && c === '"'){ out+='\\"'; continue; } // protect embedded "
      out += c;
    }
  }
  s = out;

  // 2) Remove trailing commas before } or ]
  out=''; inStr=false; esc=false;
  for (let i=0;i<s.length;i++){
    const c=s[i];
    if (inStr){
      if (esc){ out+=c; esc=false; continue; }
      if (c==='\\'){ out+=c; esc=true; continue; }
      if (c=== '"'){ inStr=false; out+=c; continue; }
      out+=c; continue;
    }
    if (c === '"'){ inStr=true; out+=c; continue; }
    if (c === ','){
      let j=i+1; while (j<s.length && /\s/.test(s[j])) j++;
      if (j<s.length && (s[j]==='}' || s[j]===']')) continue; // skip comma
    }
    out+=c;
  }
  s = out;

  // 3) Quote unquoted keys at object starts or after , or [
  s = s.replace(/(^|[{[,]\s*)([A-Za-z_][A-Za-z0-9_-]*)\s*:/gm, (_,pre,key)=> `${pre}"${key}":`);

  return s;
}

const latest = fs.readdirSync('.')
  .filter(f => /^package\.json\.bak-/.test(f))
  .sort((a,b)=>fs.statSync(b).mtime - fs.statSync(a).mtime)[0];

let src = fs.readFileSync(latest,'utf8');
let repairedText = normalizeAndRepair(src);

let repairedObj;
try {
  repairedObj = JSON.parse(repairedText);
} catch (e) {
  console.error("PARSE_FAIL");
  const m = /position (\d+)/.exec(e.message);
  if (m){
    const pos = parseInt(m[1],10);
    const ctxStart = Math.max(0, pos-200);
    const ctxEnd = Math.min(repairedText.length, pos+200);
    console.error("At char position:", pos);
    console.error("Context >>>");
    console.error(repairedText.slice(ctxStart, ctxEnd));
    console.error("<<< Context end");
  } else {
    console.error(e.message);
  }
  process.exit(1);
}

// Merge repaired backup into current
let cur = {};
try { cur = JSON.parse(fs.readFileSync('package.json','utf8')); } catch {}
const deepMerge = (a,b) => {
  if (Array.isArray(a) && Array.isArray(b)) return Array.from(new Set([...a, ...b]));
  if (a && typeof a==='object' && b && typeof b==='object') {
    const out = {...a};
    for (const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k]);
    return out;
  }
  return b ?? a;
};

const merged = {
  name: repairedObj.name || cur.name || 'smartflowsite',
  version: repairedObj.version || cur.version || '0.1.0',
  private: true,
  type: repairedObj.type || cur.type || 'module',
  scripts: deepMerge(cur.scripts||{}, repairedObj.scripts||{}),
  dependencies: deepMerge(cur.dependencies||{}, repairedObj.dependencies||{}),
  devDependencies: deepMerge(cur.devDependencies||{}, repairedObj.devDependencies||{}),
  engines: repairedObj.engines || cur.engines || { node: '>=18' }
};

fs.writeFileSync('package.json.repaired-from-backup', JSON.stringify(repairedObj, null, 2));
fs.writeFileSync('package.json', JSON.stringify(merged, null, 2));
console.log("OK");
NODE

say "Validating merged package.json…"
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))" >/dev/null

say "Committing & pushing…"
git add package.json package.json.repaired-from-backup
./tools/sf save "fix: repair+merge package.json (strip newlines in strings)"

say "Done ✅  CI will now use your restored scripts/deps where available."

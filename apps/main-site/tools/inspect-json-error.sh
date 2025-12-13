#!/usr/bin/env bash
set -euo pipefail
F="$(ls -1t package.json.bak-* 2>/dev/null | head -n1 || true)"
[[ -z "${F:-}" ]] && { echo "No package.json.bak-* found."; exit 1; }
node - <<'NODE'
const fs = require('fs');
const latest = fs.readdirSync('.').filter(f=>/^package\.json\.bak-/.test(f)).sort((a,b)=>fs.statSync(b).mtime - fs.statSync(a).mtime)[0];
const s = fs.readFileSync(latest,'utf8');
try { JSON.parse(s); console.log("Backup is valid JSON:", latest); process.exit(0); }
catch(e){
  const m = /position (\d+)/.exec(e.message)||[];
  const pos = +m[1]||0;
  const lines = s.split('\n');
  let count=0, idx=0;
  while (count<pos && idx<lines.length){ count+=lines[idx].length+1; idx++; }
  const start = Math.max(0, idx-4), end = Math.min(lines.length, idx+3);
  for (let i=start;i<end;i++){
    const ln = (i+1).toString().padStart(4,' ');
    console.log(ln+': '+lines[i]);
  }
  console.log("\n^^ Fix around these lines in the backup file, then rerun the repair script.");
}
NODE

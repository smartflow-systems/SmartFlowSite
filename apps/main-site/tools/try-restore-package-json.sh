#!/usr/bin/env bash
set -euo pipefail
say(){ printf "\033[1;36m==> %s\033[0m\n" "$*"; }
err(){ printf "\033[31m%s\033[0m\n" "$*"; }

# Find the newest backup created by the one-touch script
BACKUP="$(ls -1t package.json.bak-* 2>/dev/null | head -n1 || true)"
[[ -z "${BACKUP:-}" ]] && { err "No package.json.bak-* found."; exit 1; }

say "Checking if backup is valid JSON: $BACKUP"
if ! node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" "$BACKUP" 2>/dev/null; then
  err "Backup is NOT valid JSON. I won't overwrite your working package.json."
  echo "Open $BACKUP, fix commas/quotes, and re-run this script."
  exit 1
fi

say "Merging fields from backup into current package.json (scripts/dependencies/devDependencies)…"
node <<'NODE'
const fs = require('fs');
const deepMerge = (a,b) => {
  if (Array.isArray(a) && Array.isArray(b)) return Array.from(new Set([...a, ...b]));
  if (a && typeof a==='object' && b && typeof b==='object') {
    const out = {...a};
    for (const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k]);
    return out;
  }
  return b ?? a;
};

const backups = fs.readdirSync('.').filter(f=>/^package\.json\.bak-/.test(f)).sort((a,b)=>fs.statSync(b).mtime - fs.statSync(a).mtime);
const backup = backups[0];
const cur = JSON.parse(fs.readFileSync('package.json','utf8'));
const old = JSON.parse(fs.readFileSync(backup,'utf8'));

const keep = {
  name: cur.name || old.name || 'smartflowsite',
  version: cur.version || old.version || '0.1.0',
  private: true,
  type: cur.type || old.type || 'module',
  scripts: deepMerge(cur.scripts||{}, old.scripts||{}),
  dependencies: deepMerge(cur.dependencies||{}, old.dependencies||{}),
  devDependencies: deepMerge(cur.devDependencies||{}, old.devDependencies||{}),
  engines: cur.engines || old.engines || { node: '>=18' }
};
fs.writeFileSync('package.json', JSON.stringify(keep, null, 2));
console.log('Wrote merged package.json from', backup);
NODE

echo
say "Done. Commit/push:"
echo "./tools/sf save \"chore: restore/merge package.json\""

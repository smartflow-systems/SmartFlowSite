#!/usr/bin/env bash
set -euo pipefail

echo "[sfs-doctor] Checking local environment"
node -v
npm -v
python3 --version

if [[ ! -f package.json ]]; then
  echo "[sfs-doctor] package.json not found"
  exit 1
fi

required_scripts=(doctor "sfs:new-branch" "sfs:verify" test)
for script_name in "${required_scripts[@]}"; do
  if npm run | rg -q "^[[:space:]]+${script_name}$"; then
    echo "[sfs-doctor] npm script present: ${script_name}"
  else
    echo "[sfs-doctor] missing npm script: ${script_name}"
    exit 1
  fi
done

if [[ -f app.py ]]; then
  python3 -m pytest --version
fi

echo "[sfs-doctor] OK"

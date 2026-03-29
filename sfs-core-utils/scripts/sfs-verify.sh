set -euo pipefail
rm -f /tmp/sfs_site.log || true
(npm install >/dev/null 2>&1 || true)
(timeout 15s bash -lc 'npm run dev' > /tmp/sfs_site.log 2>&1 &)
sleep 3
if curl -fsS -m 2 http://127.0.0.1:5000/ >/dev/null; then
  echo "PROBE 5000: OK"
else
  echo "PROBE 5000: NO"
  echo "LOG HEAD:"; head -n 60 /tmp/sfs_site.log || true
  exit 1
fi
echo "LOG HEAD:"; head -n 30 /tmp/sfs_site.log || true

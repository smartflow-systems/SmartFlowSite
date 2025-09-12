#!/usr/bin/env bash
set -euo pipefail
CMD="${1:-}"; DIR="${2:-}"
if [[ -z "$CMD" || -z "$DIR" ]]; then
  echo "Usage: tools/deploy-config.sh '<build command>' <build_dir>"
  echo "Example: tools/deploy-config.sh 'npm run build' dist"
  exit 1
fi
tmp="$(mktemp)"
awk -v cmd="$CMD" -v dir="$DIR" '
  { if ($0 ~ /SFS_BUILD_CMD:/){ print "  SFS_BUILD_CMD: \""cmd"\""; next }
    if ($0 ~ /SFS_BUILD_DIR:/){ print "  SFS_BUILD_DIR: \""dir"\""; next }
    print
  }
' .github/workflows/sfs-ci-deploy.yml > "$tmp" && mv "$tmp" .github/workflows/sfs-ci-deploy.yml
echo "Updated sfs-ci-deploy.yml with:"
echo "  SFS_BUILD_CMD: $CMD"
echo "  SFS_BUILD_DIR: $DIR"

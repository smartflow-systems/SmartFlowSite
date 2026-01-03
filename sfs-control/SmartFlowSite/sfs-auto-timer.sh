#!/usr/bin/env bash
set -euo pipefail
source .sfs/config.env
echo "SFS timed commits every $AUTO_COMMIT_INTERVAL"
while true; do
  sleep "${AUTO_COMMIT_INTERVAL%m}"m
  git ac || true
done

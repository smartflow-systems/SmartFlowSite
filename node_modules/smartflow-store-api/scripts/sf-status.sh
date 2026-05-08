#!/usr/bin/env bash
set -euo pipefail
echo '== GitHub recent PRs =='; gh pr list -L 5 || true
echo '== Recent runs =='; gh run list -L 5 || true
echo '== Branch =='; git status -sb

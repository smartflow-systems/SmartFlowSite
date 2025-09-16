## Apply-All
(see commits in this PR; scripts and workflows added)

## Verify
- Health job uploads `sfs-health-reports` artifact
- `docs/SmartFlow-Agent-Rules.md` renders cleanly
- `scripts/sfs-health.sh` prints `FAIL=0`

## Undo
git revert -m 1 HEAD  # or reset if unmerged

bundle & apply now?

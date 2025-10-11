<!-- SmartFlow Systems — PR Template -->

## Summary
<!-- What changed & why (one or two lines) -->

## Linked Issues
Closes #

## Type of change
- [ ] Feature
- [ ] Fix
- [ ] Chore / CI
- [ ] Docs
- [ ] Refactor (no behavior change)
- [ ] Security

## Screenshots / Demos (optional)
<!-- GIF/URL/Notes -->

## How to test
1.
2.
3.
**Expected:** `/health` → `{"ok":true}` (Replit port ${PORT:-5000})

## CI & checks
- Latest run: Actions tab shows ✅ green
- Status checks required by ruleset pass (build/test)

## Risk & rollback
Risk: Low / Medium / High  
Rollback: `git revert <merge_sha>` or redeploy previous tag

## Checklist
- [ ] Commits are **signed** and conventional (e.g., `feat:`, `fix:`)
- [ ] Updated docs under `docs/` if needed
- [ ] No secrets or keys in diff
- [ ] Owner(s) reviewed (CODEOWNERS)
- [ ] Linear history (squash merge only)

## Notes for release (optional)
<!-- Changelog line, migration, env vars -->

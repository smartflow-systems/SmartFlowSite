# SFS Codex Powerhouse Setup

## Workflow Rules
- Branch format: `codex/{feature}-{YYYYMMDDHHmm}` in Europe/London time.
- Commit format: `feat|fix|chore(scope): message`.
- No force push.
- Run `npm ci`, `npm test`, and `pytest` when `app.py` exists.

## Codex Command Sequence
1. `npm run doctor`
2. `npm ci`
3. `npm test`
4. `pytest` (when `app.py` exists)
5. Update `docs/CHANGELOG.md` with `VERIFY` and `UNDO`

## Security and Accessibility
- Never use raw `innerHTML`.
- Sanitize dynamic HTML with DOMPurify.
- Include ARIA labels for interactive controls.

## CI Preference
Use reusable workflow:
`smartflow-systems/SmartFlowSite/.github/workflows/sfs-ci-deploy.yml@main`.

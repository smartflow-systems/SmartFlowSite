# SmartFlowSite — What these pieces do (plain English)

## Local (your machine/Replit)
- **tools/sf**: one-liner Git helper (save/sync/branch). Use `./tools/sf save "msg"`.
- **.git/hooks/pre-commit** via `tools/pre-commit.sh`: quick checks before each commit (right now it sanity-checks shell scripts). You can add linters/tests later.

## GitHub Automation (Actions in .github/workflows/)
- **sf-shellcheck.yml**: checks `tools/sf` when you push.
- **ci.yml**: common CI steps — install deps, build, test.
- **sfs-ci-deploy.yml**: runs CI on `dev` + `main`. On `main`, it’s ready for real deploy steps.
- **labels-sync.yml** + **.github/labels.yml**: keeps issue labels in sync automatically.

## Repo hygiene
- **.github/CODEOWNERS**: GitHub auto-requests reviews from the right people.
- **README badges**: instant health view of your workflows.
- **package.json**: valid JSON so Node/npm steps don’t crash.

## Next upgrades (when you want)
- Add deploy commands to `.github/workflows/sfs-ci-deploy.yml` (Vercel/Netlify/Render/Fly/SSH/Rsync).
- Add ESLint/Prettier/TypeScript, unit tests, and wire them into `ci.yml`.
- Add secrets in GitHub → Settings → Secrets and use them in workflows.
- Protect `main` so PRs must be green before merge.

# Secrets Checklist — SmartFlow Systems
Required: `SFS_PAT` (repo + workflow). Optional: `REPLIT_TOKEN`, `SFS_SYNC_URL`.
Location (GitHub Org → Settings → Secrets → Actions): https://github.com/organizations/smartflow-systems/settings/secrets/actions

Verify from UI: Org → Settings → Secrets → Actions → Inherited secrets visible in repos.
Notes:
- PAT must have: repo, workflow. Rotate every 90 days.
- Replit: set tokens in Replit Secrets if used.

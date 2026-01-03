# SmartFlowSite — GOLD RUNBOOK (Control Plane)
## Run (Node = default)
- Shell: `npm install && npm run dev`
- App should respond on `http://127.0.0.1:5000/`

## Verify (no port tools)
- Shell: `bash scripts/sfs-verify.sh`
- Expect: `PROBE 5000: OK` and log shows server started.

## Optional Python (only if you choose)
- Shell: `pip install -r requirements.txt && python app.py`

## Secrets (GitHub Org → Actions)
- Required: `SFS_PAT`
- Optional: `REPLIT_TOKEN`, `SFS_SYNC_URL`
Link: https://github.com/organizations/smartflow-systems/settings/secrets/actions

## Undo
- Shell: `bash scripts/sfs-undo-run.sh` (stops node/vite/tsx best-effort)

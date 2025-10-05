# SmartFlowSite Status Runbook (mini)
- Check logs (host/platform)
- GET /health
- POST /api/boost (sample body: {"text":"ping"})
- Confirm CORS works (OPTIONS /api/boost from browser)
- If anything fails: record uncommitted diffs and propose 3 fixes

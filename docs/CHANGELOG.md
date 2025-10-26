# Changelog

## 2025-10-26

### Added
- Ensured the API server declares Express as a runtime dependency so the application can boot successfully.

### VERIFY
- `npm install`
- `npm ci`
- `npm test`
- `pytest`
- `npm start` (Ctrl+C to stop)

### UNDO
- `git checkout -- package.json docs/CHANGELOG.md`
- `npm ci`

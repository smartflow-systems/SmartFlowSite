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

## 2026-05-21

### Added
- Added Codex operator scripts for standard branch creation and environment doctor checks.
- Added a Codex setup runbook and reusable task prompt templates.
- Standardized the pull request template with SmartFlow VERIFY/UNDO and files touched checklist.

### Changed
- Added `doctor`, `sfs:new-branch`, and `sfs:verify` npm scripts for consistent execution.

### VERIFY
- `npm run doctor`
- `npm ci`
- `npm test`
- `pytest`

### UNDO
- `git checkout -- package.json .github/PULL_REQUEST_TEMPLATE.md docs/CHANGELOG.md docs/codex-setup.md docs/codex-prompts scripts/sfs-doctor.sh scripts/sfs-new-branch.sh`

## 2026-05-21

### Fixed
- Hardened `scripts/sfs-doctor.sh` to fail fast when required npm scripts are missing instead of silently continuing.
- Updated `sfs:verify` to run `npm ci` before `npm test` so verification follows SmartFlow install-first policy.

### VERIFY
- `npm run doctor`
- `npm run sfs:verify`

### UNDO
- `git checkout -- package.json scripts/sfs-doctor.sh docs/CHANGELOG.md`

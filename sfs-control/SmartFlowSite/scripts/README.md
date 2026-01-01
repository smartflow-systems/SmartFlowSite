# SmartFlow Systems Repository Scripts

## cleanup-repo.sh

### Purpose
Safely clean up backup files and temporary artifacts from the repository while preserving all security fixes and important changes.

### Features
- ✅ **Dry-run mode** - Preview changes before applying
- ✅ **Automatic backup** - Creates timestamped backup branch before cleanup
- ✅ **Smart cleanup** - Only removes temporary/backup files
- ✅ **Safety checks** - Verifies design system files are present
- ✅ **Preserves fixes** - Keeps all workflow, security, and code fixes

### Usage

**Preview changes (recommended first):**
```bash
./scripts/cleanup-repo.sh --dry-run
```

**Apply cleanup:**
```bash
./scripts/cleanup-repo.sh
```

### What It Cleans

| File Type | Example | Description |
|-----------|---------|-------------|
| `*.bak` | `file.js.bak` | Generic backup files |
| `*.bak.*` | `file.bak.20250101` | Timestamped backups |
| `*.orig` | `file.orig` | Merge conflict originals |
| `.gitmodules` | `.gitmodules` | Orphaned submodule config |
| `.sfs-backups/` | `.sfs-backups/*` | SFS backup directory |
| `package.json.bak*` | `package.json.bak` | Package backup files |
| `.DS_Store` | `.DS_Store` | macOS metadata |
| `*.swp`, `*.swo` | `file.swp` | Vim swap files |
| `*~` | `file.js~` | Editor backups |

### What It Preserves

- ✅ All workflow fixes (permissions, circular references)
- ✅ Security and CodeQL alert fixes
- ✅ Design system files (SFS-DESIGN-SYSTEM.md, sfs-globals.css, sfs-theme-config.json)
- ✅ All source code and actual working files
- ✅ Node modules and dependencies
- ✅ Git history and commits

### Process Flow

1. **Backup** - Creates `backup/wip-TIMESTAMP` branch and pushes to remote
2. **Clean** - Removes temporary and backup files
3. **Verify** - Checks design system files exist
4. **Commit** - Commits cleanup changes
5. **Push** - Pushes to main branch

### Requirements

- `SFS_PAT` environment variable (for pushing backup branch)
- Must be run from repository root or SmartFlowSite directory
- Git repository must be initialized

### Example Output

```
🔍 DRY RUN MODE - No changes will be made
==================================================
📂 Repository: SmartFlowSite
📍 Location: /home/garet/SmartFlowSite

📦 STEP 1: Backup current state
==================================================
[DRY RUN] Would create backup branch: backup/wip-20251101-235900
[DRY RUN] Would push to remote

🧹 STEP 2: Remove temporary files
==================================================
Would delete 41 file(s) matching: *.bak
Would delete 414 file(s) matching: *.bak.*
...

✅ Cleanup complete!
```

### Safety Notes

- Always run with `--dry-run` first to preview changes
- Backup branch is created before any changes
- Can be safely re-run multiple times
- Only removes files matching specific patterns
- Never touches source code or important configs

### Troubleshooting

**Error: "Not inside a git repository"**
- Make sure you're in the SmartFlowSite directory
- Check that `.git` folder exists

**Error: "Missing SFS_PAT"**
- Set SFS_PAT in Replit → Tools → Secrets
- Or export SFS_PAT before running: `export SFS_PAT=your_token`

**Nothing to clean:**
- Repository is already clean
- Run `git status` to verify

### Related Scripts

(Future scripts will be documented here)

---

**Maintained by:** SmartFlow Systems Team
**Last Updated:** 2025-11-01

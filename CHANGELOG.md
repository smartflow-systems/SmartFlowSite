# Changelog

## 2025-10-12

### VERIFY
- Run `npm ci` to install dependencies.
- Run `npm test` to ensure the placeholder test suite still passes.
- Open `index.html` in a browser and confirm the hero section shows the new insight card and panel trio styled in the SmartFlow black/brown/gold palette.

### UNDO
- Revert commit `feat(theme): refresh hero experience` with `git revert <commit-hash>` (after locating the commit via `git log`) if you need to roll back the theme refresh.

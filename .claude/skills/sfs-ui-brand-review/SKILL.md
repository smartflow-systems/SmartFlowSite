# Skill: sfs-ui-brand-review

Read-only. Do not edit files.

## Purpose

Review SmartFlowSite frontend files for compliance with the SmartFlow brand rules defined in `AGENTS.md`.

## Steps

1. Read `AGENTS.md` brand section — confirm current approved colours, fonts, and design patterns.
2. Search `public/` and any frontend source directories for colour literals, font references, and design pattern usage.
3. Flag any hardcoded colours that differ from `#0D0D0D` / `#3B2F2F` / `#FFD700`.
4. Flag any accessibility-breaking patterns (missing focus states, low contrast, absent semantic states).
5. Report findings.

## Output format

- Overall compliance: compliant / minor issues / needs review
- Per-file findings with line references
- No patches — report only

## Constraints

- No file edits.
- No secrets inspection.
- No git mutations.
- No install, build, test, or deploy commands.
- Scope: SmartFlowSite `public/` and frontend source only.

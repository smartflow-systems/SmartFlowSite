# Skill: smartflowsite-source-of-truth-review

Read-only. Do not edit files.

## Purpose

Compare the current state of SmartFlowSite documentation files against the guidance in `AGENTS.md`. Identify conflicts, stale content, and alignment gaps.

## Steps

1. Read `AGENTS.md` — note current approved guidance.
2. Read root `CLAUDE.md` — note Control Tower overrides and existing stale annotations.
3. For each of the following files (if they exist), check for conflicts with `AGENTS.md`:
   - `docs/*.md`
   - `README.md`
   - `public/site.config.json` (brand and config fields only — do not inspect secrets or data)
4. Report findings.

## Output format

- Overall alignment status: aligned / conflicts found / stale content noted
- Per-file notes
- Recommended action (human review required / no action needed)

## Constraints

- No file edits.
- No secrets inspection.
- No git mutations.
- No install, build, test, or deploy commands.
- Scope: SmartFlowSite only.

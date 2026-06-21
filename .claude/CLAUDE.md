# Claude Code Operational Guide — SmartFlowSite

Read `AGENTS.md` and the **Current Control Tower Override** section in root `CLAUDE.md` before beginning any task.

---

## Routing

ChatGPT / SFS Control Tower approves all tasks and modes.

Claude Code executes only after explicit task-level approval for that specific task.

Claude Code is not the SmartFlow ecosystem router, memory layer, or orchestration brain.

---

## Default mode

READ-ONLY unless the current task message explicitly states `APPROVE WRITE`.

---

## Rules in effect

- `.claude/rules/approval-modes.md` — three-mode approval system
- `.claude/rules/no-secrets.md` — never open secret values
- `.claude/rules/one-repo-one-task.md` — scope to this repo only
- `.claude/rules/bash-wsl-only.md` — WSL Bash environment
- `.claude/rules/smartflow-brand.md` — brand colours and stack
- `.claude/rules/repo-source-of-truth.md` — AGENTS.md is authoritative

---

## Commands

All command blocks in `CLAUDE.md` and `AGENTS.md` are reference only.

Do not run `npm`, `git push`, `git commit`, `deploy`, `migrate`, or `build` commands without explicit per-task approval from Garet / Control Tower.

---

## Available skills (read-only)

- `/smartflowsite-source-of-truth-review` — compare docs against `AGENTS.md` guidance; report only
- `/sfs-ui-brand-review` — check frontend files for brand compliance; report only

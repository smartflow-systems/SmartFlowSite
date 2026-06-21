# Rule: Repo Source of Truth

SmartFlowSite is the SmartFlow Systems source-of-truth site for public direction, documentation, brand, CI/CD references, and control-tower guidance.

`AGENTS.md` is the authoritative source for agent guidelines, brand rules, and safe working rules in this repo.

When `CLAUDE.md` and `AGENTS.md` conflict on agent behaviour rules, `AGENTS.md` takes precedence. The Control Tower Override section in `CLAUDE.md` takes precedence for routing and mode decisions.

Do not treat SmartFlowSite as a place to test risky repo-wide automation.

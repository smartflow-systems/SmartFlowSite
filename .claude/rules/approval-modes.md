# Rule: Approval Modes

Three modes govern all Claude Code work in this repo.

## READ-ONLY ONLY

Allowed: inspect safe files, review diffs, map repo structure, produce reports.

Not allowed: edit files, delete files, install packages, deploy, push, run migrations, open or print secrets.

## APPROVE WRITE

Allowed only within the approved repo, file, and scope stated in the current task.

Still not allowed without separate explicit approval: deploy, push, npm install, npm build, npm test, migrations, touching secrets.

## APPROVE MEMORY UPDATE ONLY

Allowed only for approved memory-vault markdown files.

Do not edit repo source code.

---

Default is READ-ONLY unless the current task message explicitly states APPROVE WRITE.

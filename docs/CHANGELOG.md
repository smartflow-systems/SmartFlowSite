## VERIFY
- Trigger the `ci` workflow via a pull request or the `workflow_dispatch` event and confirm that the reusable platform job and the project test job both complete successfully.
- Inspect the workflow run to ensure `npm ci`, `npm test -- --watch=false`, and `pytest` steps execute without errors.

## UNDO
- Revert `.github/workflows/ci.yml` to the placeholder workflow that only emitted `echo` statements.
- Remove the current entry from `docs/CHANGELOG.md` if the revert is intentional.

# Theaa Development Rules

## Before every feature

1. Read `DEVELOPMENT_RULES.md`.
2. Read `PROJECT_STATE.md`.
3. Read `ROADMAP.md`.
4. Inspect the actual related files.
5. Confirm the current Git branch.
6. Confirm the previous feature was committed, pushed, verified remotely, and merged.
7. Preserve all working features.
8. Keep changes small and the file structure clean.

## Feature completion gate

A feature is not complete until:

1. Syntax checks pass.
2. `git diff --check` passes.
3. Manual Discord tests pass.
4. Regression checks pass.
5. `ROADMAP.md` is updated.
6. `PROJECT_STATE.md` is updated.
7. All created, changed, and deleted files are documented.
8. The problem solved and new behavior are documented.
9. Known limitations are documented.
10. Changes are committed.
11. The feature branch is pushed.
12. The remote branch is verified.
13. The feature is merged into `main`.
14. `main` is pushed and verified.
15. A completion report is sent.
16. The next recommended feature is stated.

Do not start another feature before this gate is complete.

## Required completion report

- Completed
- Roadmap status
- Files created
- Files changed
- Files deleted
- Why they changed
- What now works
- Problem solved
- Verification
- Regression checks
- Known limitations
- Feature branch
- Commit
- Remote push
- Main merge
- Project-state sections updated
- Next recommended feature

## Structure rules

- Do not create unnecessary files or folders.
- Keep command files thin.
- Put reusable logic in focused shared modules.
- Do not duplicate command data.
- Slash, prefix, mention, reply, and natural-language inputs must share action logic.
- Do not claim success before Git or Discord confirms it.

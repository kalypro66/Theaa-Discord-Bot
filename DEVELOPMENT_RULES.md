# Theaa Development Rules

## Before every feature or fix

1. Read `DEVELOPMENT_RULES.md` from the latest working branch.
2. Read `PROJECT_STATE.md` from the latest working branch.
3. Read `ROADMAP.md` from the latest working branch.
4. Read `CHATGPT_HANDOFF.md` from the latest working branch.
5. Inspect the actual related source files.
6. Confirm the repository, current branch, and latest remote commit.
7. Confirm the previous feature's commit, push, remote verification, and merge state.
8. Check whether the phone contains uncommitted or untracked work before pulling, resetting, cleaning, or applying packages.
9. Preserve all working features and keep changes small.

Never rely only on chat summaries or documentation claims when the source can be inspected.

## Source-of-truth states

Always distinguish these states explicitly:

- **GitHub branch state:** committed files currently visible on the remote branch.
- **Local phone state:** modified or untracked files that exist only in Termux/Acode.
- **Packaged state:** corrected files prepared in an archive but not yet extracted.
- **Committed state:** changes committed locally but not necessarily pushed.
- **Pushed state:** remote branch verified to contain the intended commit.
- **Merged state:** feature verified on `main`.

GitHub is the permanent source of truth. Phone-only work is not part of the project history until it is committed, pushed, and remotely verified.

## GitHub write fallback

When GitHub allows repository writes, apply the smallest safe changes directly.

When GitHub rejects writes with `403 Resource not accessible by integration`:

1. Create the corrected files or deterministic update package.
2. Package them in a downloadable `.tar.gz` archive.
3. Give exact Termux commands to inspect the branch, extract, verify, stage only intended paths, commit, and push.
4. Never require large manual edits in Acode.
5. After the user pastes output, inspect it and verify the remote branch contains the intended result.

## Required inspection before editing

Inspect:

- Directly changed files
- Their imports and callers
- Command registration and metadata
- Slash and message adapters
- Prefix, mention, reply, and natural-language routing when relevant
- Permission and hierarchy behavior
- Discord.js API usage
- Existing documentation records

Ask for `git status --short`, focused `git diff`, or a backup archive whenever phone-only changes could affect the work.

## Verification gate

A feature is not complete until all applicable checks pass:

1. `node --check` passes for every changed JavaScript file.
2. Imports and file paths resolve.
3. `git diff --check` passes.
4. Command registration is verified.
5. Slash behavior is verified.
6. Prefix behavior is verified.
7. Mention behavior is verified.
8. Reply behavior is verified.
9. Natural-language behavior is verified.
10. Permissions, target checks, and role hierarchy are verified.
11. Discord.js methods and response APIs are valid and non-deprecated where practical.
12. Manual Discord tests pass where behavior depends on Discord runtime.
13. Regression checks confirm existing features were not broken.
14. `ROADMAP.md`, `PROJECT_STATE.md`, and `CHATGPT_HANDOFF.md` are updated.
15. All created, changed, and deleted files are documented.
16. Known limitations are documented.
17. Changes are committed and pushed.
18. The remote branch is inspected and verified.
19. The feature is merged into `main` when the milestone requires completion.
20. A completion report and real next roadmap task are stated.

Do not start another feature before the active feature's applicable gate is complete.

## Structure rules

- Do not create unnecessary files or folders.
- Keep command files thin.
- Put reusable logic in focused shared modules.
- Do not duplicate command data or Discord mutation logic.
- Slash, prefix, mention, reply, natural-language, dashboard, and scheduled inputs must share action logic.
- AI providers must never directly manipulate Discord.
- Do not claim success before Discord or Git confirms it.
- Do not run destructive Git cleanup commands while unpushed phone work exists.
- Do not use `git add .` or `git add -A` when unrelated local work is present.

## Documentation rules

After every verified feature:

- Update `PROJECT_STATE.md` with exact behavior, technical changes, files, tests, limitations, branch, commit, push, and merge state.
- Update `ROADMAP.md` by marking only what is actually complete and selecting the real next unfinished task.
- Update `CHATGPT_HANDOFF.md` with the current branch, latest remote commit, completed work, phone-only work, pending work, and next action.
- Update this file only when the development workflow itself changes.

## Embed rules

- Every new or modified command embed must include `.setTimestamp()` through the shared helper.
- Standard command footers must use Theaa's avatar and `Theaa | Server Name`.
- Use `src/discord/embeds/embedStyle.js` for shared color, footer, server context, and timestamp behavior.
- Command-specific authors, thumbnails, and images remain the formatter's responsibility.

## Custom emoji rule

Custom emojis are postponed until the required emoji files and Discord emoji IDs are supplied. Do not add placeholder IDs or invent assets.

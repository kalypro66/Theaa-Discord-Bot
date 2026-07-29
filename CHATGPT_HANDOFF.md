# Theaa ChatGPT Handoff

Repository: `kalypro66/Theaa-Discord-Bot`
Environment: Android, Acode, Termux
Stack: JavaScript, Node.js, discord.js
Updated: 2026-07-29

## Read First

1. `DEVELOPMENT_RULES.md`
2. `PROJECT_STATE.md`
3. `ROADMAP.md`
4. `CHATGPT_HANDOFF.md`
5. Inspect the actual related source files from the latest branch.

## Current Branch

`feature/image-understanding`

## Latest Code Commit

`0b1fa0025e2c23eeb1e695e0d5ed4936ba365ed3` — Keep AI private to owner DMs

## Integration Target

`feature/existing-command-parity`

Do not merge directly into `main`.

## Current Product Direction

Theaa is a conventional Carl-bot-style command and server-management bot inside servers.

AI is private and isolated to direct messages from the configured developer account.

## Server Behavior

- Twenty normal guild slash commands are deployed.
- Exact prefix commands work.
- Natural-language commands are disabled.
- Mentioning Theaa does not start a conversation.
- Replying to Theaa does not start a conversation.
- Server image and screenshot analysis is disabled.
- The server `/chat` command was deleted.
- Server AI media commands were removed.
- AutoMod remains active.
- AI-folder commands are excluded from server command loading, routing, and help metadata.

## Owner-DM Behavior

- Only the configured developer account receives DM replies.
- Every other user's DM is silently ignored.
- AI chat remains unchanged.
- Owner-DM conversation memory remains.
- Image and screenshot understanding remains.
- Images continue the existing conversation instead of resetting it.
- Adult-capable consensual conversation remains with narrow prohibited-category safeguards.
- Private media commands remain:
  - `/siteimage`
  - `/nsfwimage`
  - `/nsfwgif`

## Deployment

Verified runtime deployment:

- 20 guild commands
- 3 owner-DM commands

No server AI commands should be registered.

## Files in the Code Commit

Modified:

- `deploy-commands.js`
- `src/ai/context.js`
- `src/ai/openrouter.js`
- `src/ai/prompt/ownerDm.js`
- `src/ai/providerManager.js`
- `src/events/messagecreate.js`
- `src/events/ownerDm.js`
- `src/handlers/commandHandler.js`
- `src/router/commandRegistry.js`

Created:

- `src/ai/attachments.js`
- `src/ai/vision.js`
- `src/commands/ai/nsfwgif.js`
- `src/commands/ai/nsfwimage.js`
- `src/commands/ai/siteimage.js`
- `src/utils/adultMediaSearch.js`
- `src/utils/siteImages.js`

Deleted:

- `src/commands/ai/chat.js`

## Verification Completed

- Installer verification passed.
- Syntax checks passed.
- Imports resolved.
- `git diff --check` passed.
- Runtime command deployment passed.
- Owner-DM AI replied successfully.
- Server AI routes were verified inactive.
- Exact prefix and slash commands remained functional.
- Commit was pushed and remotely verified.

## Phone-Only State

`src/data/prefixes.json` may remain locally modified as runtime data. Do not stage it.

Do not run destructive Git cleanup commands.

Do not use:

- `git add .`
- `git add -A`
- `git reset --hard`
- `git clean`

## Protected Stashes

Never drop, clear, or pop these without an explicit safe restoration procedure:

- `WIP kick compact validator and addrole followup`
- `Working shared validators and kick embed pending 2026-07-27`
- `Phone work before shared validators 2026-07-27`
- `Local work before Theaa prefix fix`

## Exact Next Action

1. Commit and push this documentation update.
2. Remotely verify the documentation commit.
3. Fast-forward `feature/existing-command-parity` to the completed feature branch.
4. Resume shared permission and hierarchy validation from the protected work.
5. Fix the addrole acknowledgement issue without touching unrelated files.
6. Convert remaining legacy moderation commands into native shared actions.

## Permanent Rule

Never claim a feature is complete until runtime behavior, syntax, imports, focused diffs, documentation, commit, push, remote verification, and required merge state are confirmed.

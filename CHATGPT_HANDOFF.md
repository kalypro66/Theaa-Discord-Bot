# Theaa ChatGPT Handoff

Repository: kalypro66/Theaa-Discord-Bot
Environment: Android, Acode, Termux
Stack: JavaScript, Node.js, discord.js
Updated: 2026-07-27

## Read First
1. DEVELOPMENT_RULES.md
2. PROJECT_STATE.md
3. ROADMAP.md
4. CHATGPT_HANDOFF.md
5. Inspect the actual related source files from the latest branch

## Current Branch
feature/owner-only-dms

## Current Feature Code Commit
`2b2ff3cdbefa6d01db845104435d41662d9619f9` — Add owner-only DMs and improve AI conversations

## Feature Base
`f55faa4c535db95d21a34024dc1d1a3ee2d60250` — Record parity foundation remote verification

This feature branch must be pushed and then merged into `feature/existing-command-parity`, not directly into `main`.

## Current Feature State
Existing Command Parity is in progress.

Pushed and remotely verified on the GitHub branch:
- Automatic paginated help, shared embed styling, and shared member resolution remain present.
- `ping`, `setprefix`, and `chat` expose shared `run(context)` implementations.
- Protected multilingual developer identity responses mention the configured developer ID.
- AI replies remove only an exact leading `Theaa:` or `Thea:` prefix.
- Central command metadata defaults are present for legacy commands.
- The temporary message-to-interaction compatibility adapter is present.
- Shared message result sending handles strings, embeds, reply objects, and `afterReply` callbacks.
- The registry loads 21 commands: 9 native shared actions and 12 legacy moderation commands.
- Compact `serverinfo` formatting lives inside its shared `run(context)` action.
- `serverinfo` passed slash, prefix, mention, reply, natural-language, and detailed-help tests with one response per request.

## Commit Contents
Created:
- `src/router/commandDefaults.js`
- `src/router/messageInteractionAdapter.js`

Changed:
- `index.js`
- `src/router/commandMatcher.js`
- `src/router/commandRegistry.js`
- `src/router/executeCommand.js`
- `src/router/messageRouter.js`
- `src/commands/information/serverinfo.js`
- `ROADMAP.md`
- `PROJECT_STATE.md`
- `CHATGPT_HANDOFF.md`

## Phone-Only Work
The phone still contains many modified and untracked source files outside the verified commit. Treat them as unfinished and unpushed until separately inspected.

Still excluded from the remote parity foundation:
- `src/discord/responseNormalizer.js`
- `src/discord/executeSlashCommand.js`
- `src/discord/validation/`
- Kick hierarchy changes
- Custom emojis, which remain postponed

Do not run destructive Git cleanup commands or stage all files while this work exists.

## Exact Next Action
1. Commit this documentation record after code commit `2b2ff3cdbefa6d01db845104435d41662d9619f9`.
2. Push `feature/owner-only-dms` and remotely verify both commits and their exact file sets.
3. Merge `feature/owner-only-dms` into `feature/existing-command-parity`; do not merge directly into `main`.
4. Resume shared permission and hierarchy validation from the protected stash without restoring unrelated phone work.
5. Redesign the kick result embed using the compact serverinfo-style layout.
6. Convert the remaining legacy moderation commands to native shared `run(context)` actions after validators are stable.

Do not drop or clear any stash. Do not begin the dedicated `serverowner` command until Existing Command Parity is complete, verified, documented, pushed, and merged.

## Required Entry Methods
Every existing and future command must support:
- Slash command
- Prefix command
- Bot mention
- Reply to Theaa
- Natural-language command
- Detailed help lookup

All entry methods must invoke the same action logic and share permissions, hierarchy checks, errors, embeds, and logging.

## Permanent Embed Rule
Every new or modified embed must include:
- Appropriate author and icon
- Relevant image or thumbnail
- Footer icon using Theaa's avatar
- Footer text: Theaa | Server Name
- Timestamp

Use `src/discord/embeds/embedStyle.js` for standard color, footer, server context, and timestamp behavior.

## Serverowner Decision
The dedicated serverowner embed must show:
- Small server icon and server name at the top
- Owner as a clickable Discord mention
- Large server icon as the thumbnail
- Footer: Theaa | Server Name
- Timestamp
- No moderator list

## Dashboard Decision
Build a mobile-first Theaa website after the bot and shared configuration architecture are stable.

Discord keeps essential moderation, AutoMod enable/disable/status, emergency setup, basic status checks, and the dashboard link. Detailed customization moves to the website while both surfaces use the same configuration and database.

## Source-of-Truth Rule
GitHub is the permanent source of truth. Phone-only files must be clearly labeled as local and unpushed. Never claim they are part of the branch until the remote commit is verified.

## Important
Do not call a feature complete until syntax, imports, registration, applicable entry methods, Discord behavior, documentation, commit, push, remote verification, and merge requirements have passed.

## Owner-only DM and Conversation Feature

Code commit: `2b2ff3cdbefa6d01db845104435d41662d9619f9`

Included:

- Developer-only DM gate with silent rejection for all other accounts.
- Isolated owner girlfriend persona.
- Mature server persona with context-dependent emoji use.
- Groq primary and OpenRouter fallback for replies and classification.
- Gemini module and dependency removal.
- Role-aware short-term memory isolated per DM owner or server channel-and-user.
- Purge range increased to 500 using batches of at most 100.
- Safe purge response handling after the invoking message is deleted.

Manual behavior reported as passing:

- Owner DM replies.
- Outsider DM silence.
- Server persona isolation.
- Short follow-up memory.
- Purge above 100 messages.

Protected stashes still expected:

- `Working shared validators and kick embed pending 2026-07-27`
- `Phone work before shared validators 2026-07-27`
- `Local work before Theaa prefix fix`

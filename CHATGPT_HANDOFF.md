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
feature/existing-command-parity

## Current Remote Branch Tip
`5b88d8b8bea6d88b4c85aaced2239929d47b40fe` — Add command parity compatibility foundation

The remote branch is six commits ahead of `main` and has not been merged.

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
- AI memory and prompt changes
- Kick hierarchy changes
- Custom emojis, which remain postponed

Do not run destructive Git cleanup commands or stage all files while this work exists.

## Exact Next Action
1. Add shared permission and role-hierarchy validation as a separate verified feature.
2. Inspect the phone-only validation and kick changes only as reference; do not commit them blindly.
3. Convert the 12 legacy moderation commands to native shared `run(context)` actions after the validators are stable.
4. Run command-by-command slash, prefix, mention, reply, natural-language, and help regression.
5. Update project records, push, remotely verify, and merge only when the Existing Command Parity milestone is complete.

Do not begin the dedicated `serverowner` command until Existing Command Parity is complete, verified, documented, pushed, and merged.

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

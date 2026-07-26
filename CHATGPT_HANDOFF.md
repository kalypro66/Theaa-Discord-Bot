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
`21017b5f43452643ce16effd9755d9008ed919d9` — Sync parity branch project state

The remote branch is five commits ahead of `main` and has not been merged.

Latest remote feature-code commit:
`f264af8f7e1b5ee44f76e77c352cee7742775e91` — Strip Theaa name prefixes from AI replies

## Current Feature State
Existing Command Parity is in progress.

Verified on the GitHub branch:
- Automatic paginated help, shared embed styling, and shared member resolution remain present.
- `ping`, `setprefix`, and `chat` expose shared `run(context)` implementations.
- Protected multilingual developer identity responses mention the configured developer ID.
- AI replies remove only an exact leading `Theaa:` or `Thea:` prefix.

## Locally Verified Pending Commit

The following source changes are present and verified on the phone, but are not yet committed or pushed:

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

Documentation pending in the same commit:
- `ROADMAP.md`
- `PROJECT_STATE.md`
- `CHATGPT_HANDOFF.md`

Verified behavior:
- 21 commands registered: 9 native shared actions and 12 legacy moderation commands.
- Metadata defaults, aliases, triggers, categories, permissions, and option schemas passed local verification.
- Legacy commands have a temporary message-to-interaction compatibility route.
- Shared result sending handles strings, embeds, reply objects, and `afterReply` callbacks.
- `serverinfo` uses its own compact shared layout.
- `serverinfo` passed slash, prefix, mention, reply, natural-language, and detailed-help tests.
- No duplicate reply was observed.
- Syntax and `git diff --check` passed.

Still excluded and unverified:
- `src/discord/responseNormalizer.js`
- `src/discord/executeSlashCommand.js`
- `src/discord/validation/`
- AI memory and prompt changes
- Kick hierarchy changes
- Custom emojis, which remain postponed

## Exact Next Action
1. Apply the project-state documentation package.
2. Stage only the eight verified source files and three documentation files.
3. Commit and push to `feature/existing-command-parity`.
4. Inspect the remote commit and update this handoff with its actual SHA in a clear follow-up documentation commit.
5. Add shared permission and hierarchy validation before converting the 12 remaining legacy moderation commands to native shared actions.

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

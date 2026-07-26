# Theaa ChatGPT Handoff

Repository: kalypro66/Theaa-Discord-Bot
Environment: Android, Acode, Termux
Stack: JavaScript, Node.js, discord.js
Updated: 2026-07-26

## Read First
1. DEVELOPMENT_RULES.md
2. PROJECT_STATE.md
3. ROADMAP.md
4. CHATGPT_HANDOFF.md
5. Inspect the actual related source files from the latest branch

## Current Branch
feature/existing-command-parity

## Latest Remote Commit
`f264af8f7e1b5ee44f76e77c352cee7742775e91` — Strip Theaa name prefixes from AI replies

The branch is four commits ahead of `main` and has not been merged.

## Current Feature State
Existing Command Parity is in progress.

Verified on the GitHub branch:
- Automatic paginated help remains present from `main`.
- Shared embed styling remains present from `main`.
- Shared server-member resolution remains present from `main`.
- `ping`, `setprefix`, and `chat` expose shared `run(context)` implementations for slash and message routing.
- Protected developer/owner identity responses are implemented.
- Developer/owner responses mention the configured developer Discord ID.
- Protected responses support English, Hindi, Urdu, and Roman Urdu detection.
- AI replies remove only an exact leading `Theaa:` or `Thea:` prefix before sending.

Not present on the GitHub branch:
- `src/discord/executeSlashCommand.js`
- `src/discord/responseNormalizer.js`
- `src/router/commandDefaults.js`
- `src/router/messageInteractionAdapter.js`
- `src/discord/validation/`
- `src/config/emojis.js`

The phone previously showed those paths as untracked local files. Treat them as phone-only and unverified until their contents are inspected and committed.

Also not verified on the GitHub branch:
- Improved memory isolation; remote memory is still keyed only by guild ID.
- Prompt hardening; the remote prompt index still contains conflicting exports.
- Invoking-moderator kick hierarchy validation; remote `kick.js` checks only whether the bot can kick the target.

Custom emojis remain postponed until the emoji files and IDs are supplied.

## Exact Next Action
1. Obtain `git status --short` and focused diffs or a backup archive from the phone.
2. Inventory every existing command and dependency.
3. Separate the phone-only adapter, validation, memory, prompt, and kick changes into reviewable commits.
4. Continue converting every existing command to one shared multi-entry action implementation.

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

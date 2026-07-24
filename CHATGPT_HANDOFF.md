# Theaa ChatGPT Handoff

Repository: kalypro66/Theaa-Discord-Bot
Environment: Android, Acode, Termux
Stack: JavaScript, Node.js, discord.js

## Read First
1. DEVELOPMENT_RULES.md
2. PROJECT_STATE.md
3. ROADMAP.md
4. CHATGPT_HANDOFF.md
5. Inspect the actual related code files

## Current Branch
main

## Current Feature State
Paginated help navigation is complete.

Verified Git state:
- Feature commit: `f862aa4e3889b3c8b7d7d4c40fdd4a2159480485`
- Feature branch push: verified
- Merge commit: `73da2224eaa3299e98d861987fd1e78a0c5088b1`
- Remote `main`: verified
- Post-merge documentation correction: complete

## Next Planned Feature
Existing Command Parity.

Required entry methods for every existing command:
- Slash command
- Prefix command
- Bot mention
- Reply to Theaa
- Natural-language command
- Detailed help lookup

Required architecture:
- One shared `run(context)` or equivalent action implementation
- Slash and message adapters call the same action
- Identical permissions, hierarchy checks, errors, embeds, and logging
- Correct inaccurate command categories during the parity audit
- Future commands follow this structure from their first implementation

## Previous Feature Completed
Paginated help overview.

Completed:
- Added `src/help/helpPagination.js`
- Added a two-page category layout
- Added text-only Previous and Next buttons
- Added Page X of Y
- Added requester-only button controls
- Added a ten-minute collector lifetime
- Added shared `afterReply` handling
- Fixed mention-based help arguments
- Replaced deprecated interaction reply options
- Verified all six help entry methods in Discord
- Verified page navigation and disabled states
- Committed as `f862aa4`
- Merged into `main` as `73da222`
- Feature branch and remote `main` verified

## Permanent Embed Rule
Every new or modified embed must include:
- Appropriate author and icon
- Relevant image or thumbnail
- Footer icon using Theaa avatar
- Footer text: Theaa | Server Name
- Timestamp

Use `src/discord/embeds/embedStyle.js` for standard color, footer, server context, and timestamp behavior.

## Permanent Command Entry Rule
Every existing and future command must support:
- Slash
- Prefix
- Mention
- Reply
- Natural language
- Detailed help lookup

All entry methods must invoke the same action logic.

## Planned Next Features
1. Existing Command Parity
2. Dedicated serverowner command
3. Shared permission validation
4. Shared role-hierarchy validation
5. Core Command Parity expansion

## Serverowner Decision
The dedicated serverowner embed must show:
- Small server icon and server name at the top
- Owner as a clickable Discord mention
- Large server icon as the thumbnail
- Footer: Theaa | Server Name
- Timestamp
- No moderator list

## Dashboard Decision
Build a proper mobile-first Theaa website after the bot and shared configuration architecture are stable.

Discord keeps:
- Essential moderation commands
- AutoMod enable, disable, and status
- Emergency and basic setup controls
- Basic status checks
- Dashboard link

Website handles:
- Detailed AutoMod customization
- Exempt roles and channels
- Logging and staff-role configuration
- Command permissions
- Welcome systems, tickets, AI settings, analytics, and other detailed customization

The Discord commands and website must update the same shared configuration and database.

## Important
Do not start another feature until the current feature is tested, documented, committed, pushed, remotely verified, merged into main, and followed by the final completion report.

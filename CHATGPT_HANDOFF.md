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

## Next Planned Feature
Shared embed-style helper and timestamp migration.

## Previous Feature Completed
Shared server-member resolver.

Completed:
- Added `src/discord/resolvers/memberResolver.js`
- Converted avatar, banner, and userinfo to shared member resolution
- Added timestamps to avatar, banner, and userinfo
- Changed the missing-banner response to a generic message
- Restored normal AI conversation routing for mentions and replies
- Committed as `d910c0b`
- Pushed, merged into `main`, and remotely verified

## Permanent Embed Rule
Every new or modified embed must include:
- Appropriate author and icon
- Relevant image or thumbnail
- Footer icon using Theaa avatar
- Footer text: Theaa | Server Name
- Timestamp

## Planned Next Features
1. Shared embed-style helper and timestamp migration
2. Dedicated serverowner command
3. Shared permission validation
4. Shared role-hierarchy validation
5. Core command parity pack

## Serverowner Decision
The dedicated serverowner embed must show:
- Small server icon and server name at the top
- Owner as a clickable Discord mention
- Large server icon as the thumbnail
- Footer: Theaa | Server Name
- Timestamp
- No moderator list

## Important
Do not start another feature until the current feature is tested, documented, committed, pushed, remotely verified, and merged into main.

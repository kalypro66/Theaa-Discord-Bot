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
feature/shared-member-resolver

## Current Feature
Shared server-member resolver.

Completed in this branch:
- Added src/discord/resolvers/memberResolver.js
- Converted avatar to the shared resolver
- Converted banner to the shared resolver
- Added timestamps to avatar and banner
- Missing banner message is now generic
- Restored normal AI conversation routing for mentions and replies

Still required:
- Convert userinfo to the shared resolver
- Add timestamp to userinfo
- Test avatar, banner, userinfo, AI chat, prefix, mention, and reply behavior
- Update ROADMAP.md and PROJECT_STATE.md
- Commit, push, verify, merge into main, and report completion

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

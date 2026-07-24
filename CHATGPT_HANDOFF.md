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
feature/shared-embed-style

## Current Feature State
Shared embed-style implementation and manual Discord verification are complete.

Pending:
- Final documentation review
- Commit
- Feature-branch push
- Remote verification
- Merge into main
- Main remote verification
- Post-merge documentation correction
- Final completion report

## Next Planned Feature
Paginated help overview using text-only Previous and Next buttons.

Confirmed behavior:
- Edit the same help message
- Show Page X of Y
- Disable Previous on the first page
- Disable Next on the final page
- Keep /help command:<name> for detailed command information
- Do not use emojis on the navigation buttons

## Previous Feature Completed
Shared server-member resolver.

Completed:
- Added `src/discord/resolvers/memberResolver.js`
- Converted avatar, banner, and userinfo to shared member resolution
- Restored normal AI conversation routing
- Committed as `d910c0b`
- Pushed, merged into main, and remotely verified
- Final documentation commit: `f2c2ec2`

## Permanent Embed Rule
Every new or modified embed must include:
- Appropriate author and icon
- Relevant image or thumbnail
- Footer icon using Theaa avatar
- Footer text: Theaa | Server Name
- Timestamp

Use `src/discord/embeds/embedStyle.js` for standard color, footer, server context, and timestamp behavior.

## Planned Next Features
1. Paginated help overview
2. Dedicated serverowner command
3. Shared permission validation
4. Shared role-hierarchy validation
5. Core Command Parity pack

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

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
Shared embed styling and the AutoMod staff exemptions are complete.

Verified Git state:
- Feature commit: `4b1c6ccfa64764955892b85225d66855a995f292`
- Feature branch push: verified
- Merge commit: `5e7c71ca889e71d7fe20903299d822344b87bae1`
- Remote `main`: verified
- Post-merge documentation correction: complete

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
Shared embed styling and AutoMod staff exemptions.

Completed:
- Added `src/discord/embeds/embedStyle.js`
- Migrated information, moderation, help, and AutoMod log embeds
- Standardized the exact `Theaa | Server Name` footer
- Added automatic timestamps through the shared helper
- Preserved command-specific colors and media
- Exempted the server owner and recognized moderation staff from AutoMod
- Manually verified avatar, serverinfo, help, help errors, and AutoMod status
- Committed as `4b1c6cc`
- Merged into `main` as `5e7c71c`
- Feature branch and remote `main` verified

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

# Theaa Project State

**Purpose:** Permanent technical memory for Theaa  
**Repository:** `kalypro66/Theaa-Discord-Bot`  
**Environment:** Android, Acode, Termux  
**Stack:** JavaScript, Node.js, discord.js  
**Updated:** 2026-07-25

# 1. Mandatory Procedure

This file exists so development never depends only on ChatGPT memory.

## Before every code change

1. Read `DEVELOPMENT_RULES.md`.
2. Read this file.
3. Read `ROADMAP.md`.
4. Inspect the actual related repository files.
5. Verify the current implementation instead of trusting old descriptions.
6. Confirm the previous feature was committed, pushed, verified remotely, and merged.
7. Identify the smallest safe file set.
8. Trace dependencies.
9. Protect all working features listed here.

## After every successful feature

Update:

- Feature name and date
- User-visible behavior
- Commands and intents
- Files created, changed, moved, or deleted
- Why each file changed
- Dependencies
- Environment variables
- Configuration and storage
- Permissions and safety rules
- Tests
- Regression checks
- Known limitations
- Branch, commit, PR, and merge state
- Roadmap checkboxes
- Next recommended feature

A feature is not complete until it is tested, documented, committed, pushed, remotely verified, merged into `main`, reported, and followed by the next recommendation.

# 2. Vision

Theaa is an AI-first Discord assistant combining:

- Mature moderation and server management
- Slash and prefix commands
- Natural-language Discord control
- AI conversation
- Images, screenshots, emojis, stickers, files, audio, and video
- User and server memory
- Server summaries and intelligence
- Automations
- Future dashboard and plugins

AI providers may classify or propose actions, but must never directly manipulate Discord. All actions must go through verified shared services.

# 3. Architecture Rules

1. Events receive Discord input.
2. One dispatcher decides the route.
3. Classifiers identify conversation, question, or action.
4. Routers choose a verified command/action.
5. Resolvers find users, roles, channels, messages, and durations.
6. Validators check permissions, hierarchy, targets, arguments, and safety.
7. Shared services perform Discord operations.
8. Formatters create replies.
9. Audit logging records important actions.
10. AI providers remain replaceable.

## Forbidden

- AI provider directly calling Discord mutation methods
- Duplicating action logic for slash, prefix, and natural language
- Large unrelated rewrites
- Claiming success before Discord confirms it
- Secrets or real runtime data in tracked files
- Destructive bulk actions without confirmation

# 4. Known Repository Structure

```text
Theaa-Discord-Bot/
├── DEVELOPMENT_RULES.md
├── index.js
├── deploy-commands.js
├── package.json
├── package-lock.json
├── data/
│   ├── automod.json
│   └── warnings.json
└── src/
    ├── ai/
    ├── commands/
    │   ├── ai/
    │   ├── information/
    │   ├── moderation/
    │   └── utility/
    ├── config/
    ├── data/
    ├── discord/
    ├── events/
    ├── handlers/
    ├── help/
    ├── router/
    └── utils/
```

This reflects the repository inspected on 2026-07-24. Recheck before editing.

# 5. Known Entry Points

## `index.js`

- Creates the Discord client
- Loads environment variables
- Enables Guilds, GuildMessages, and MessageContent intents
- Loads command and event handlers
- Executes slash commands
- Logs in with `TOKEN`

## `deploy-commands.js`

- Recursively loads `src/commands`
- Serializes command builders
- Deploys guild-specific commands using `CLIENT_ID` and `GUILD_ID`

## `src/handlers/commandHandler.js`

- Loads slash commands into `client.commands`

## `src/handlers/eventHandler.js`

- Loads events from `src/events`

## Routing prototypes

- `src/router/commandRegistry.js`
- `src/router/messageRouter.js`
- `src/router/executeCommand.js`

## Message events

- `src/events/messagecreate.js` — the only registered `messageCreate` event
- `src/automod/processMessage.js` — reusable automod processor called before command and AI routing

Current controlled flow:

```text
Discord message
      ↓
Ignore bots and DMs
      ↓
Detect prefix, bot mention, or reply
      ↓
Run AutoMod
      ↓
Blocked? Stop processing
      ↓
Command or AI dispatcher
```

Direct interactions with Theaa skip only the spam counter. Invite, link, mass-mention, and everyone checks remain active.

# 6. Dependencies

Known:

- `discord.js`
- `dotenv`
- `@google/genai`

Before adding a package:

1. Confirm necessity.
2. Confirm Node compatibility.
3. Prefer maintained packages.
4. Record the reason.
5. Update this section and the lockfile.

# 7. Known Features

Legend:

- `[x]` implemented and believed working
- `[~]` partial or prototype
- `[ ]` planned

## Foundation

- [x] Client startup
- [x] Environment loading
- [x] Command handler
- [x] Event handler
- [x] Guild slash deployment
- [x] Prefix storage prototype
- [x] Command registry prototype
- [x] Message router prototype
- [x] Command executor prototype
- [~] Shared action contract — avatar, banner, and userinfo use shared member resolution
- [~] Deterministic local natural-language routing
- [x] Typing indicator for mention, reply, and prefix processing

## Utility

- [x] Ping
- [x] Help — generated automatically from registered command metadata
- [x] Set prefix

## Information

- [x] Server info
- [x] User info
- [x] Avatar — slash, prefix, and natural-language inputs share one embed action
- [x] Banner

## Moderation

- [x] Ban
- [x] Unban
- [x] Kick
- [x] Timeout
- [x] Warn
- [x] Purge
- [x] Nuke
- [x] Lock
- [x] Unlock
- [x] Add role
- [x] Remove role
- [x] Set logs
- [~] Automod

## AI

- [x] Gemini adapter
- [x] Groq adapter
- [x] OpenRouter adapter
- [x] Provider manager prototype
- [x] AI manager prototype
- [~] Chat slash command
- [~] Message AI conversation
- [~] In-memory history

Important: current memory is not persistent and is lost on restart.

# 8. Runtime Data

## `src/config/logs.json`

Maps guild IDs to log-channel IDs.

## `src/data/automod.json`

Stores per-guild automod settings.

## `src/data/prefixes.json`

Stores per-guild prefixes.

## `data/warnings.json`

Stores warning history.

## Risk

Real guild, channel, user, prefix, and moderation data is tracked publicly. Replace tracked runtime data with example files and ignore real storage, or migrate to a database.

# 9. File Responsibility Registry

| Path | Responsibility | Must not contain |
|---|---|---|
| `index.js` | Startup and top-level wiring | Feature business logic |
| `deploy-commands.js` | Slash registration | Runtime execution |
| `src/handlers/commandHandler.js` | Load slash commands | Intent classification |
| `src/handlers/eventHandler.js` | Load events | Feature implementations |
| `src/events/` | Receive and forward Discord events | Large action logic |
| `src/automod/processMessage.js` | Check messages before routing and report whether they were blocked | AI and command routing |
| `src/router/commandRegistry.js` | Discover commands/actions | Discord side effects |
| `src/router/messageRouter.js` | Route command input | Provider API code |
| `src/router/executeCommand.js` | Invoke verified interface | Intent guessing |
| `src/help/helpService.js` | Read, group, and search registered command metadata | Discord embed formatting |
| `src/help/helpFormatter.js` | Build help overview, detail, and error embeds | Command discovery or routing |
| `src/discord/embeds/embedStyle.js` | Create standard embed colors, Theaa footer context, and timestamps | Command-specific business logic |
| `src/ai/manager.js` | AI orchestration | Direct Discord actions |
| `src/ai/providerManager.js` | Provider selection/fallback | Discord execution |
| `src/ai/gemini.js` | Gemini adapter | Routing |
| `src/ai/groq.js` | Groq adapter | Routing |
| `src/ai/openrouter.js` | OpenRouter adapter | Routing |
| `src/ai/context.js` | Build model context | Discord mutations |
| `src/ai/memory.js` | Temporary chat history | Cross-guild leakage |
| `src/discord/` | Context, resolvers, validators | AI provider calls |
| `src/commands/` | Command adapters/current actions | Provider selection |
| `src/utils/logger.js` | Moderation log sending | General routing |
| Runtime data files | Per-guild state | Secrets or public data |

Update this registry whenever responsibilities change.

# 10. Known Risks

- [x] Duplicate `messageCreate` handling removed
- [x] Prefix and AI routing now share one controlled event flow
- [ ] Commands may mix parsing, validation, execution, and replies
- [ ] Memory resets on restart
- [ ] Memory may be scoped too broadly
- [ ] Runtime data is committed
- [ ] Slash commands are guild-only
- [ ] No automated tests
- [ ] `npm test` currently fails intentionally
- [ ] Provider fallback needs verification
- [ ] Prompt and future modules may be empty placeholders
- [x] Help is generated automatically from registered command metadata

# 11. Approved Build Strategy

Do not blindly copy every command first. Do not focus only on AI.

1. Audit current flow.
2. Stabilize a shared action platform.
3. Add the Core Command Parity Pack.
4. Expose verified actions to natural-language routing.
5. Alternate command packs and AI improvements.
6. Add vision and persistent memory after routing is stable.
7. Build advanced systems, plugins, and dashboard later.

We may reproduce useful capabilities from bots such as Carl-bot and Dyno, but must not copy their source code, branding, or proprietary implementation.

# 12. Current Milestone

## Milestone A — Audit and reusable action foundation

- [x] Document exact message flow
- [x] Verify and remove duplicate processing
- [~] Inventory commands and dependencies — information and embed-producing commands reviewed
- [ ] Define shared action contract
- [ ] Add shared permission checks
- [ ] Add shared hierarchy checks
- [x] Convert `avatar` as the reference action
- [x] Preserve slash and prefix behavior for avatar
- [x] Auto-generate help
- [x] Add shared embed defaults and migrate existing command embeds
- [x] Add paginated Previous/Next help navigation
- [ ] Begin Core Command Parity

# 13. Feature History

Add new entries at the top.

## 2026-07-25 — Paginated help overview

**Status:** Complete, manually verified, committed, pushed, remotely verified, merged into `main`, and post-merge documentation corrected.

### Files created

- `src/help/helpPagination.js`

### Files changed

- `src/commands/moderation/nuke.js`
- `src/commands/moderation/purge.js`
- `src/commands/utility/help.js`
- `src/help/helpFormatter.js`
- `src/router/executeCommand.js`
- `src/router/messageRouter.js`
- `ROADMAP.md`
- `PROJECT_STATE.md`
- `CHATGPT_HANDOFF.md`

### Files deleted

- None.

### What changed

- Added a two-page automatically generated help overview.
- Page 1 contains Utility, Information, and Server.
- Page 2 contains General.
- Added text-only Previous and Next buttons.
- Navigation edits the original help message.
- Added Page X of Y.
- Disabled unavailable navigation directions.
- Restricted navigation to the user who opened the menu.
- Increased button lifetime to ten minutes.
- Added shared `afterReply` handling for message-based commands.
- Fixed mention-command argument extraction.
- Replaced deprecated `fetchReply: true` response options in help, nuke, and purge.

### What now works

- `/help`
- `?help`
- `@Theaa help`
- Replying to Theaa with `help`
- `/help command:avatar`
- `@Theaa help avatar`
- Previous and Next update the same message.
- Only the original requester can control the buttons.

### Problem solved

The generated help overview could not scale cleanly as more commands were added. Mention-based help could also incorrectly treat the command name as a help query.

### Verification

- Every JavaScript file under `src` passed `node --check`.
- `git diff --check` passed.
- Formatter tests confirmed the two-page category layout.
- The bot logged in successfully.
- No `fetchReply` deprecation warning appeared after restart.
- All six help entry methods were manually tested.
- Previous, Next, page boundaries, and disabled states were manually verified.

### Regression checks

- Detailed command help still works.
- Help remains generated from command metadata.
- Slash, prefix, mention, reply, and natural-language routing remain active.
- Existing reply-object, embed, and string results remain supported.
- Nuke and purge passed syntax checks.
- No deprecated `fetchReply:` options remain under `src`.

### Known limitations

- Buttons intentionally expire after ten minutes.
- Many moderation commands currently have inaccurate General metadata.
- Several existing commands remain slash-only until Existing Command Parity.
- Automated test files have not been added.

### Git

- Feature branch: `feature/paginated-help`
- Feature commit: `f862aa4e3889b3c8b7d7d4c40fdd4a2159480485`
- Remote feature push: verified
- Main merge commit: `73da2224eaa3299e98d861987fd1e78a0c5088b1`
- Remote `main` verification: complete
- Post-merge documentation correction: complete

### Product decisions recorded

- Every existing command must support slash, prefix, mention, reply, natural language, and detailed help lookup.
- Existing commands will be migrated together instead of patched individually.
- All entry methods must call the same shared action implementation.
- Future commands must follow this architecture from their first implementation.
- Existing Command Parity is next.
- The dedicated serverowner command follows Existing Command Parity.

### Next recommended feature

- Existing Command Parity.
- Correct inaccurate command categories during the parity audit.

## 2026-07-25 — Shared embed style and AutoMod staff exemptions

**Status:** Complete, manually verified, committed, pushed, remotely verified, merged into `main`, and post-merge documentation corrected.

### Files created

- `src/discord/embeds/embedStyle.js`

### Files changed

- `src/automod/processMessage.js`
- `src/commands/information/avatar.js`
- `src/commands/information/banner.js`
- `src/commands/information/serverinfo.js`
- `src/commands/information/userinfo.js`
- `src/commands/moderation/addrole.js`
- `src/commands/moderation/automod.js`
- `src/commands/moderation/ban.js`
- `src/commands/moderation/kick.js`
- `src/commands/moderation/lock.js`
- `src/commands/moderation/nuke.js`
- `src/commands/moderation/purge.js`
- `src/commands/moderation/removerole.js`
- `src/commands/moderation/setlogs.js`
- `src/commands/moderation/timeout.js`
- `src/commands/moderation/unban.js`
- `src/commands/moderation/unlock.js`
- `src/commands/moderation/warn.js`
- `src/commands/utility/help.js`
- `src/help/helpFormatter.js`
- `ROADMAP.md`
- `PROJECT_STATE.md`
- `CHATGPT_HANDOFF.md`

### What changed

- Added one shared embed-style helper using the default Theaa color, exact `Theaa | Server Name` footer, Theaa avatar footer icon, and automatic timestamp.
- Migrated information, moderation, help, and AutoMod log embeds away from duplicated footer and timestamp code.
- Preserved command-specific colors, titles, fields, authors, thumbnails, and images.
- Added the registered-command count to the help overview description because the standard footer now contains server context.
- Added timestamps to server information and command-not-found help responses.
- Expanded AutoMod exemptions to include the server owner and members with administrator or moderation-management permissions.
- Recorded the confirmed paginated-help design using `Previous` and `Next` buttons.
- Recorded the future website decision: essential controls stay in Discord while detailed server customization moves to the dashboard.

### What now works

- Embed color, footer context, footer icon, and timestamps are controlled from one shared module.
- Existing migrated command embeds consistently display `Theaa | Server Name`.
- Avatar, server information, help overview, help details, help errors, and AutoMod status retain their existing command behavior.
- AutoMod ignores the server owner and members with recognized moderation permissions.
- Help remains generated from the command registry.

### Verification

- `git diff --check` passed.
- Every JavaScript file under `src` passed `node --check`.
- Runtime imports passed for all 20 changed JavaScript files.
- The bot logged in successfully.
- Avatar output was manually verified.
- Server information output was manually verified.
- Help overview output was manually verified.
- Help command-detail output was manually verified.
- Help command-not-found output was manually verified.
- AutoMod status output was manually verified.
- Standard footer icon, footer text, timestamp, images, and single-response behavior were checked in Discord.

### Regression checks

- Existing slash-command execution still works.
- Existing prefix and natural-language adapters were not replaced.
- Help still discovers registered commands automatically.
- AutoMod processing and logging remain active for non-exempt members.
- No temporary diagnostic or deletion-tracing code remains.
- No duplicate bot responses were observed.

### Known limitations

- The shared helper standardizes color, footer, server context, and timestamp; command-specific authors and relevant media must still be selected by each formatter.
- Some older moderation embeds still need future command-specific author or thumbnail improvements.
- Custom staff roles without moderation permissions are not configurable yet.
- AutoMod settings still use synchronous JSON storage.
- Automated tests have not been added.

### Git

- Feature branch: `feature/shared-embed-style`
- Feature commit: `4b1c6ccfa64764955892b85225d66855a995f292`
- Remote feature push: verified
- Main merge commit: `5e7c71ca889e71d7fe20903299d822344b87bae1`
- Remote `main` verification: complete
- Post-merge documentation correction: complete

### Product decisions recorded

- Paginated help was selected as the next feature and has now been completed.
- Pagination edits the existing message, shows `Page X of Y`, and disables unavailable directions.
- Existing Command Parity now comes before the dedicated `serverowner` command.
- A proper mobile-first website will be built after the bot and shared configuration architecture are stable.
- Discord will retain essential moderation and AutoMod enable/disable/status controls.
- Detailed customization will move to the website dashboard and use the same underlying configuration as Discord commands.

### Next recommended feature

- Existing Command Parity.
- Then build the dedicated `serverowner` command.


## 2026-07-24 — Shared server-member resolver

**Status:** Complete, manually verified, committed, pushed, merged into `main`, and remotely verified.

### Files created

- `src/discord/resolvers/memberResolver.js`
- `CHATGPT_HANDOFF.md`

### Files changed

- `src/commands/information/avatar.js`
- `src/commands/information/banner.js`
- `src/commands/information/userinfo.js`
- `src/dispatcher/routeIntent.js`
- `DEVELOPMENT_RULES.md`
- `ROADMAP.md`
- `PROJECT_STATE.md`

### What changed

- Added one shared resolver for slash-selected members, mentions, explicit user IDs, and self words.
- Converted avatar, banner, and userinfo to the shared resolver.
- Added timestamps to avatar, banner, and userinfo embeds.
- Changed the missing-banner response to: `This user doesn't have a profile banner.`
- Restored AI replies for classifier results using the `conversation` intent.
- Added a permanent ChatGPT handoff file.
- Recorded the future shared embed-style and server-owner plans.

### What now works

- Avatar, banner, and userinfo share target-resolution behavior.
- Self requests work.
- Mentioned server members work.
- Explicit server-member IDs work.
- Plain username guessing remains intentionally disabled.
- Missing server members receive consistent errors.
- Normal AI conversation through mentions and replies works again.
- Bare mentions receive an AI response.
- Normal unmentioned messages remain ignored.
- Successful avatar, banner, and userinfo embeds include timestamps.

### Verification

- Syntax checks passed for all changed JavaScript files.
- `git diff --check` passed.
- Avatar slash, prefix, mention, self, member, and ID tests passed.
- Banner slash, prefix, mention, self, member, and ID tests passed.
- Userinfo slash, prefix, mention, self, member, and ID tests passed.
- Plain username rejection passed.
- AI `roast me` mention test passed.
- Bare mention test passed.
- Normal unmentioned-message test passed.
- No duplicate responses were observed.
- No unexpected AutoMod deletion occurred during final regression testing.

### Known limitations

- Fuzzy username and display-name resolution are intentionally unsupported.
- Only the member resolver exists; role, channel, message, and duration resolvers remain planned.
- Existing embeds outside avatar, banner, and userinfo may still lack timestamps.
- Shared embed styling has not been implemented yet.

### Git

- Feature branch: `feature/shared-member-resolver`
- Commit: `d910c0b`
- Remote feature push: verified
- Main merge: complete and remotely verified

### Next recommended feature

- Shared embed-style helper and migration.
- Then add the dedicated server-owner command.


## 2026-07-24 — Auto-generated command help

**Status:** Complete, manually verified, committed, pushed, merged into `main`, and remotely verified.

### What changed

- Created src/help/helpService.js for command discovery, grouping, and lookup.
- Created src/help/helpFormatter.js for overview, detail, and error embeds.
- Rebuilt src/commands/utility/help.js as a shared slash, prefix, and natural-language command.
- Created DEVELOPMENT_RULES.md to enforce saving, documentation, remote verification, merging, and completion reports.

### What now works

- /help automatically displays registered commands.
- /help command:avatar displays detailed command information.
- Prefix help uses the server current configured prefix.
- Prefix and natural-language help use the same help system.
- Newly registered commands appear without manually editing the help menu.

### Problem solved

- The help menu no longer contains a duplicated and outdated command list.
- Prefix changes automatically appear in help usage examples.
- Completed features can no longer be treated as finished before they are saved and merged.

### Verification

- Help service, formatter, and command syntax checks passed.
- Slash overview and detail help passed.
- Prefix overview and detail help passed.
- Mention-based help passed.
- Slash commands were deployed successfully.

### Git

- Feature branch: feature/auto-generated-help
- Code commit: e736514
- Remote feature push: verified
- Main merge: complete and remotely verified at `a72e365`

### Known limitations

- Help quality depends on commands having accurate metadata.
- Detailed slash-option usage is not yet generated automatically.

### Next recommended feature

- Shared server-member resolver.
- This will prevent avatar, banner, userinfo, role, and moderation commands from duplicating target-resolution logic.

## 2026-07-24 — Single message dispatcher and controlled AutoMod flow

**Status:** Complete and manually verified.

### User-visible behavior

- Every server message enters one `messageCreate` listener.
- Normal messages without a prefix, mention, or reply receive no response.
- Prefix commands continue to work.
- Bot mentions and replies continue to work.
- Theaa displays typing status while processing.
- AutoMod runs before command and AI routing.
- AutoMod-blocked messages do not reach the dispatcher.
- Direct Theaa interactions do not trigger the spam counter.
- Invite, link, mass-mention, and everyone rules still apply to Theaa interactions.

### Files created

- `src/automod/processMessage.js` — reusable AutoMod processor returning whether processing should stop.

### Files changed

- `src/events/messagecreate.js` — became the single controlled message event.
- `ROADMAP.md` — recorded dispatcher milestone progress.
- `PROJECT_STATE.md` — recorded architecture, behavior, tests, and limitations.

### Files deleted

- `src/events/aiMessage.js` — removed because its behavior was merged into the main message event.

### Verification

- Syntax checks passed for `processMessage.js` and `messagecreate.js`.
- Only one `messageCreate` event remains.
- Normal unmentioned messages receive no response.
- Prefix avatar works.
- Mention-based avatar works.
- Reply-based avatar works.
- Each request receives one response.
- Theaa interactions are no longer deleted by the spam rule.

### Regression checks

- Shared avatar output preserved.
- Typing status preserved.
- AutoMod still runs before routing.
- Administrator and Manage Messages exemptions preserved.

### Limitations

- AutoMod configuration is still read synchronously from JSON.
- Spam tracking remains in memory and resets when the bot restarts.
- Automated tests have not yet been added.

### Git

- Branch: `feature/single-message-dispatcher`
- Commit: `Unify message dispatch and automod flow`
- Pull request: not created
- Merged: no

### Next recommendation

- Feature: auto-generated help command.
- Reason: the current help output is manually maintained and does not reflect all registered commands.

## 2026-07-24 — Shared avatar action, deterministic routing, and typing indicator

**Status:** Complete and manually verified.

### User-visible behavior

- `/avatar` and the configured prefix avatar command return the same Discord embed.
- Mentioning or replying to Theaa with `show my avatar` returns the requester's avatar.
- `show @member avatar` returns the mentioned server member's avatar.
- Plain username lookup is intentionally disabled.
- An unmentioned or unavailable target returns a server-member error instead of silently returning the requester's avatar.
- Theaa displays Discord typing status while processing message-based requests.

### Commands and intents

- Slash: `/avatar [user]`
- Prefix: `<configured-prefix>avatar [@member]`
- Natural language: `show my avatar` and `show @member avatar` through a bot mention or reply

### Files changed

- `src/commands/information/avatar.js` — added the shared `run(context)` action, consistent embed output, mention-only targeting, and server-membership validation.
- `src/dispatcher/dispatcher.js` — added deterministic local command routing before AI classification and preserved classified command arguments.
- `src/events/aiMessage.js` — added Discord typing status before message processing.
- `ROADMAP.md` — recorded partial and completed milestone progress.
- `PROJECT_STATE.md` — recorded behavior, implementation, verification, limitations, and Git state.

### Dependencies

- Added: none
- Removed: none
- Updated: none

### Configuration and storage

- Environment variables: unchanged
- Configuration: unchanged
- Data migration: none

### Permissions and safety

- Avatar is read-only and performs no Discord mutation.
- Another user must be explicitly mentioned.
- The target must be a member of the current server.
- The bot's own mention is ignored as an avatar target.
- No destructive-action confirmation is required.

### Verification

- Syntax: `avatar.js`, `dispatcher.js`, and `aiMessage.js` passed `node --check`.
- Manual: slash self-avatar passed.
- Manual: slash mentioned-user avatar passed.
- Manual: prefix avatar passed.
- Manual: natural-language self-avatar passed.
- Manual: natural-language mentioned-user avatar passed.
- Error case: plain username no longer falls back to the requester's avatar.
- Error case: unavailable or unmentioned target returns a server-member error.
- Typing status was confirmed visible in Discord.

### Regression checks

- Slash avatar output preserved.
- Prefix avatar output preserved.
- All supported avatar triggers use the same embed builder.
- Local avatar routing works without Gemini availability.
- Normal AI-provider behavior was not fully regression-tested because Gemini returned HTTP 429 quota exhaustion during development.

### Limitations

- Only avatar is currently verified as a complete shared reference action.
- Other commands may still be slash-only or use legacy message execution.
- Plain username resolution is intentionally unsupported; users must mention the target.
- Typing is currently a standard typing indicator, not streamed output.
- Gemini intent classification remains subject to provider quotas.

### Git

- Branch: `feature/shared-avatar-typing`
- Commit: `Add shared avatar routing and typing status`
- Pull request: not created
- Merged: no

### Roadmap

- Completed: avatar reference action
- Completed: slash and prefix preservation for avatar
- Partial: deterministic natural-language command routing
- Partial: typing indicators

### Next recommendation

- Feature: audit and consolidate the two `messageCreate` listeners.
- Reason: prevent routing races, duplicate processing, and automod/AI conflicts.

## 2026-07-24 — Master roadmap and permanent project-state system

**Status:** Complete; files were manually committed by the project owner.

### Added

- Command-platform-first hybrid strategy
- Carl-bot-class command and system roadmap
- Permanent technical memory procedure
- File responsibilities
- Current features and risks
- Regression checklist
- Feature completion template

### Files

- `ROADMAP.md`
- `PROJECT_STATE.md`

### Source-code impact

No bot code changed.

### Limitation

The connected GitHub app still cannot write repository content, but the project owner committed and pushed these files manually through Termux.

### Next

Audit the current execution flow.

# 14. Feature Entry Template

```markdown
## YYYY-MM-DD — Feature name

**Status:** Complete / Partial / Reverted

### User-visible behavior
- ...

### Commands and intents
- Slash:
- Prefix:
- Natural language:

### Files created
- `path` — purpose

### Files changed
- `path` — exact reason

### Files deleted
- `path` — why safe

### Dependencies
- Added:
- Removed:
- Updated:

### Configuration and storage
- Environment variables:
- Configuration:
- Data migration:

### Permissions and safety
- User permissions:
- Bot permissions:
- Hierarchy:
- Confirmation:

### Verification
- Syntax:
- Automated:
- Manual:
- Error cases:

### Regression checks
- Commands:
- AI:
- Storage:

### Limitations
- ...

### Git
- Branch:
- Commit:
- Pull request:
- Merged:

### Roadmap
- Completed:
- Added:
- Reordered:

### Next recommendation
- Feature:
- Reason:
```

# 15. Regression Checklist

## Startup

- [ ] Environment loads
- [ ] Bot logs in
- [ ] Handlers load
- [ ] No duplicate events
- [ ] No unhandled rejection

## Slash

- [ ] Deployment runs
- [ ] Existing commands remain
- [ ] New command appears
- [ ] Errors are safe

## Prefix

- [ ] Prefix loads
- [ ] Existing command works
- [ ] Unknown command is safe
- [ ] Normal chat is ignored

## AI

- [ ] Normal chat receives one response
- [ ] Prefix commands are not treated as chat
- [ ] Slash commands bypass chat
- [ ] Provider failure is handled
- [ ] Memory is isolated
- [ ] AI cannot bypass validators

## Moderation

- [ ] User permission
- [ ] Bot permission
- [ ] Role hierarchy
- [ ] Self-target
- [ ] Owner target
- [ ] Log created
- [ ] Failure never claims success

## Data

- [ ] Existing data preserved
- [ ] Invalid data handled
- [ ] Defaults safe
- [ ] Real runtime data not committed

# 16. Required Completion Report

```text
Completed:
Roadmap status:
Files changed:
Why:
What works:
Verification:
Regression checks:
Commit:
Project-state sections updated:
Next recommended feature:
```

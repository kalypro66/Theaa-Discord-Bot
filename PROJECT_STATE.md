# Theaa Project State

**Purpose:** Permanent technical memory for Theaa  
**Repository:** `kalypro66/Theaa-Discord-Bot`  
**Environment:** Android, Acode, Termux  
**Stack:** JavaScript, Node.js, discord.js  
**Updated:** 2026-07-24

# 1. Mandatory Procedure

This file exists so development never depends only on ChatGPT memory.

## Before every code change

1. Read this file.
2. Read `ROADMAP.md`.
3. Inspect the actual related repository files.
4. Verify the current implementation instead of trusting old descriptions.
5. Identify the smallest safe file set.
6. Trace dependencies.
7. Protect all working features listed here.

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

A feature is not complete until this file and `ROADMAP.md` are updated and pushed.

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
- [~] Shared action contract — avatar reference implementation
- [~] Deterministic local natural-language routing
- [x] Typing indicator for mention, reply, and prefix processing

## Utility

- [x] Ping
- [x] Help
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
- [ ] Help may require manual updates

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
- [ ] Inventory commands and dependencies
- [ ] Define shared action contract
- [ ] Add shared permission checks
- [ ] Add shared hierarchy checks
- [x] Convert `avatar` as the reference action
- [x] Preserve slash and prefix behavior for avatar
- [ ] Auto-generate help
- [ ] Begin Core Command Parity

# 13. Feature History

Add new entries at the top.

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

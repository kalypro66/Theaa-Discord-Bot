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

- `src/events/messagecreate.js`
- `src/events/aiMessage.js`

Potential risk: both may listen to `messageCreate` and process one message twice. Verify before routing work.

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

## Utility

- [x] Ping
- [x] Help
- [x] Set prefix

## Information

- [x] Server info
- [x] User info
- [x] Avatar
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

- [ ] Possible duplicate `messageCreate` handling
- [ ] Prefix and AI routing may both respond
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

- [ ] Document exact message flow
- [ ] Verify duplicate processing
- [ ] Inventory commands and dependencies
- [ ] Define shared action contract
- [ ] Add shared permission checks
- [ ] Add shared hierarchy checks
- [ ] Convert `avatar` or `serverinfo` as the reference action
- [ ] Preserve slash and prefix behavior
- [ ] Auto-generate help
- [ ] Begin Core Command Parity

# 13. Feature History

Add new entries at the top.

## 2026-07-24 — Master roadmap and permanent project-state system

**Status:** Files prepared; repository write access is still blocked.

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

The connected GitHub app returned HTTP 403 for branch and repository-content writes. The files must be uploaded or committed once write permission is available.

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

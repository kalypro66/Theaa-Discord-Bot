# Theaa Master Roadmap

**Project:** Theaa — AI-first Discord assistant and server-management bot  
**Stack:** JavaScript, Node.js, discord.js  
**Environment:** Android, Acode, Termux  
**Repository:** `kalypro66/Theaa-Discord-Bot`  
**Updated:** 2026-07-24

## Vision

Theaa should combine mature Discord management features with AI:

- Slash and prefix commands
- Natural-language Discord control
- AI conversation
- Chat-versus-command detection
- Image and screenshot understanding
- Emoji and sticker understanding
- File, audio, and video understanding
- Persistent user and server memory
- Automod, logs, roles, tickets, reminders, polls, suggestions, giveaways
- Future dashboard and plugin system

```text
Message / command / reply / attachment
                 ↓
            Dispatcher
                 ↓
    Conversation / question / action
         ↙                    ↘
      AI chat             Discord intent
                              ↓
                 Resolve + validate + confirm
                              ↓
                    Shared action service
                              ↓
                    Result + audit logging
```

## Permanent Rules

1. Read `PROJECT_STATE.md` before every code change.
2. Inspect all directly related files before editing.
3. Preserve working features.
4. Prefer small isolated changes.
5. AI must never directly manipulate Discord.
6. Slash, prefix, natural-language, dashboard, and scheduled calls should share action logic.
7. Validate permissions, hierarchy, targets, arguments, and safety.
8. Confirm destructive, ambiguous, or bulk actions.
9. Keep development practical on Android.
10. Every successful feature must be tested, committed, pushed, and recorded in both roadmap and project state.

# Priority Decision

We will **not** blindly add hundreds of commands first, and we will **not** make the AI smarter while it has almost nothing reliable to execute.

Approved order:

1. Stabilize the reusable command/action foundation.
2. Add a large core command pack.
3. Expose only verified actions to natural-language routing.
4. Add the next command pack.
5. Improve AI routing after each pack.
6. Add vision and persistent memory after routing is stable.

> Broad Discord capability and AI intelligence will grow together, but the shared action platform comes first.

# Phase 0 — Security and Reliability

- [x] `.env` ignored
- [x] `node_modules` ignored
- [ ] Remove real guild, channel, user, warning, and prefix data from tracked JSON
- [ ] Add example configuration files
- [ ] Add `.env.example`
- [ ] Validate required environment variables
- [ ] Separate runtime data from source control
- [ ] Add startup diagnostics
- [ ] Add global error handling
- [ ] Add graceful shutdown
- [ ] Add structured logging
- [ ] Add useful npm scripts
- [ ] Add syntax checks and tests
- [ ] Add GitHub Actions CI
- [ ] Add setup documentation

# Phase 1 — Shared Command and Action Platform

**Highest priority**

- [ ] Audit command handler, event handler, registry, router, executor, and AI message flow
- [ ] Detect duplicate `messageCreate` processing
- [ ] Define command metadata
- [~] Define standard action input and result — avatar reference implementation complete
- [ ] Separate parsing, validation, execution, and reply formatting
- [ ] Add user, role, channel, message, and duration resolvers
- [ ] Add permission and role-hierarchy checks
- [ ] Add cooldowns
- [ ] Add confirmation prompts
- [ ] Add audit logging
- [ ] Add consistent errors
- [ ] Auto-generate help from command metadata
- [~] Preserve slash and prefix compatibility — verified for avatar

Definition of success: one action can be called by slash, prefix, natural language, future dashboard, or automation without duplicated Discord logic.

# Phase 2 — Core Command Parity

## Moderation

Existing:

- [x] Ban
- [x] Unban
- [x] Kick
- [x] Timeout
- [x] Warn
- [x] Purge
- [x] Lock
- [x] Unlock
- [x] Nuke

Add:

- [ ] Remove timeout
- [ ] Mute / unmute abstraction
- [ ] Hard mute with role restoration
- [ ] Softban
- [ ] Temporary ban
- [ ] Mass ban with preview and confirmation
- [ ] Warning list
- [ ] Remove one warning
- [ ] Clear warnings
- [ ] Moderation case IDs
- [ ] View and edit cases
- [ ] User moderation history
- [ ] Moderator notes
- [ ] Temporary punishments
- [ ] Server lockdown
- [ ] Timed lockdown
- [ ] Report command and report channel
- [ ] Set nickname
- [ ] Cleanup bot messages

## Purge filters

- [ ] By user
- [ ] Bot messages
- [ ] Contains text
- [ ] Embeds
- [ ] Custom emojis
- [ ] Files
- [ ] Images
- [ ] Links
- [ ] Mentions
- [ ] Human messages
- [ ] Reactions
- [ ] Preserve pinned messages
- [ ] Preview large purges

## Information

Existing:

- [x] Ping
- [x] Avatar
- [x] Banner
- [x] User information
- [x] Server information

Add:

- [ ] Role information
- [ ] Channel information
- [ ] Bot information
- [ ] Member roles and permissions
- [ ] Server icon, banner, owner, counts
- [ ] Recent joins
- [ ] Account age and join position
- [ ] Message information
- [ ] Invite information
- [ ] Boost information
- [ ] List roles
- [ ] List members in a role

## Roles

Existing:

- [x] Add role
- [x] Remove role

Add:

- [ ] Toggle role
- [ ] Multiple roles
- [ ] Remove all manageable roles
- [ ] Create, delete, rename, recolor, hoist, and mention roles
- [ ] Persistent roles
- [ ] Temporary roles
- [ ] Mass roles for humans, bots, or members of another role
- [ ] Mass-role progress and cancellation
- [ ] Protected roles
- [ ] Joinable roles

## Channels and server management

- [ ] Create, clone, delete, rename, and move channels
- [ ] Categories
- [ ] Topic, slowmode, NSFW, and permission sync
- [ ] Invites
- [ ] Emojis and stickers
- [ ] Announcements

## Configuration and permissions

- [x] Prefix prototype
- [x] Log-channel prototype
- [ ] Multiple prefixes
- [ ] Enable/disable commands and categories
- [ ] Per-command allowed or blocked roles and channels
- [ ] Redirect output
- [ ] Moderator, manager, and protected roles
- [ ] Ignored users, roles, and channels
- [ ] Diagnose command/module
- [ ] Configuration export/import

# Phase 3 — Carl-bot-Class Systems

## Reaction and component roles

- [ ] Reaction roles
- [ ] Button roles
- [ ] Select-menu roles
- [ ] Setup, edit, move, list, and remove panels
- [ ] Unique, verify-only, remove-only, reversed, binding, and linked modes
- [ ] Temporary roles
- [ ] Role limits
- [ ] Whitelists and blacklists
- [ ] Panel locking and self-destruction
- [ ] Persistence after restart

## Automod

- [~] Basic prototype
- [ ] Bad words and regex
- [ ] Invite and link filtering
- [ ] Mention, flood, duplicate, caps, emoji, sticker, and attachment spam
- [ ] New-account restrictions
- [ ] Raid detection
- [ ] Per-rule actions, cooldowns, and exemptions
- [ ] Escalating punishment
- [ ] Automod logs
- [ ] Human approval mode

## Logging and cases

- [ ] Deleted and edited messages
- [ ] Joins, leaves, bans, unbans, and timeouts
- [ ] Role, nickname, channel, invite, and voice changes
- [ ] Automod and AI action logs
- [ ] Split event channels
- [ ] Ignored events/channels
- [ ] Searchable cases and evidence

## Greetings and onboarding

- [ ] Welcome, leave, ban, and DM messages
- [ ] Rich embeds and variables
- [ ] Test greeting
- [ ] Autorole and delayed autorole
- [ ] Verification and rules acceptance
- [ ] Account-age checks
- [ ] Auto nickname
- [ ] Role restoration

## Community and engagement

- [ ] Suggestions and voting
- [ ] Anonymous suggestions and decision logs
- [ ] Starboard
- [ ] Sticky messages
- [ ] Polls
- [ ] Giveaways
- [ ] AFK
- [ ] Custom commands and tags
- [ ] Triggers and autoresponders
- [ ] Embed builder
- [ ] Repeating and scheduled messages
- [ ] Reminders
- [ ] Twitch, YouTube, RSS, and other feeds
- [ ] Server-stat channels
- [ ] Levels, economy, games, fun, and music later

# Phase 4 — Main Message Dispatcher

- [x] One message dispatcher
- [x] Prevent double responses from separate message listeners
- [x] Prefix detection
- [x] Mention and reply detection
- [ ] Configured AI channels
- [ ] Disabled channels
- [ ] Safe DM behavior
- [ ] Structured message context
- [ ] Guild and user rate limits

# Phase 5 — Chat Versus Command Detection

- [ ] Intent schema
- [ ] Confidence score
- [ ] Entity extraction
- [ ] Destructive and ambiguity flags
- [ ] Confirmation rules
- [~] Deterministic obvious-command detection — local routing prototype added
- [ ] AI fallback classification
- [ ] Conversation, question, Discord action, memory, reminder, and attachment detection
- [ ] False-command regression tests

Example:

```json
{
  "type": "discord_action",
  "intent": "moderation.ban",
  "confidence": 0.96,
  "entities": {
    "targetUserId": "123456789",
    "reason": "Repeated spam"
  },
  "requiresConfirmation": true
}
```

# Phase 6 — Natural-Language Discord Control

First actions:

- [ ] Server owner and member/channel counts
- [~] Avatar complete; banner and user information remain
- [ ] Lock and unlock
- [ ] Timeout and warn
- [ ] Ban with confirmation
- [ ] Add and remove role
- [ ] Purge with confirmation

Later:

- [ ] Every stable registered action
- [ ] Multi-step requests
- [ ] Bulk-action previews
- [ ] Undo where possible
- [ ] Explain failures and completed actions
- [ ] Action-history queries

# Phase 7 — AI Chat Platform

Existing:

- [x] Gemini
- [x] Groq
- [x] OpenRouter
- [x] Provider manager prototype
- [~] Basic AI chat
- [~] In-memory history

Add:

- [ ] Provider health, timeout, retry, fallback, rate-limit, token, and cost tracking
- [ ] Configurable model priority
- [~] Typing indicator added; streaming remains
- [ ] Stable personality
- [ ] Server, user, channel, and reply context
- [ ] Know when not to answer
- [ ] Prompt-injection resistance
- [ ] Tool-call validation
- [ ] Never claim success before Discord confirms it

# Phase 8 — Vision and Media Understanding

## Images

- [ ] Detect attachments and embeds
- [ ] Understand replied images
- [ ] Describe and answer questions
- [ ] Read screenshots and errors
- [ ] Extract text when needed
- [ ] Understand memes
- [ ] Compare images
- [ ] File limits and safety

## Emojis and stickers

- [ ] Unicode emoji meaning and combinations
- [ ] Contextual tone and sarcasm
- [ ] Custom emoji names and artwork
- [ ] Animated emoji handling
- [ ] Sticker names, descriptions, artwork, and emotion

## Files, audio, and video

- [ ] Text, code, JSON, and supported documents
- [ ] Voice-message transcription
- [ ] Audio summaries
- [ ] Video transcription, frames, and summaries
- [ ] Processing limits

# Phase 9 — Memory

## Short-term

- [ ] Guild, channel, user, and reply-chain isolation
- [ ] Context trimming and summaries
- [ ] Expiry and reset
- [ ] No private/public leakage

## Long-term

- [ ] User preferences, names, relationships, projects, dates, and communication style
- [ ] Server rules, culture, FAQs, important channels/roles, moderation history
- [ ] Confidence, source, timestamps
- [ ] View, edit, delete, clear, export, consent, and retention controls

# Phase 10 — Tickets, Reminders, and Automation

- [ ] Ticket panels, forms, routing, claim, transfer, transcripts, notes
- [ ] AI ticket summaries, replies, FAQ suggestions, and escalation
- [ ] One-time and recurring reminders
- [ ] Natural-language dates and timezones
- [ ] Scheduled messages
- [ ] Temporary roles and punishments
- [ ] List, edit, pause, and delete schedules
- [ ] Calendar later

# Phase 11 — AI Server Intelligence

- [ ] Channel, thread, daily, and date-range summaries
- [ ] Moderator handover reports
- [ ] Explain warnings and cases
- [ ] Find unanswered questions, spam patterns, disputes, and inactivity
- [ ] FAQ generation
- [ ] Weekly reports
- [ ] AI ticket triage
- [ ] Scam, toxicity, and harassment detection
- [ ] Human approval before severe punishment

# Phase 12 — Plugin System

- [ ] Plugin contract, metadata, lifecycle, configuration, permissions, storage, and error isolation
- [ ] Command, action, and event registration
- [ ] Per-guild enable/disable
- [ ] First-party moderation, roles, welcome, tickets, and reminders plugins
- [ ] Economy and leveling plugins later

# Phase 13 — Dashboard

- [ ] Discord OAuth and guild permission verification
- [ ] Mobile-first interface
- [ ] Commands, AI, providers, automod, logging, roles, tickets, cases, memory, analytics, and secure API

# Phase 14 — Voice and Advanced Media

- [ ] Voice transcription and conversations
- [ ] Text-to-speech
- [ ] Meeting and voice-channel summaries
- [ ] Explicit activation
- [ ] Image generation
- [ ] Rich components and integrations

# Current Milestone

## Milestone A — Audit and reusable action foundation

1. [x] Document current execution flow
2. [x] Verify and remove duplicate message handling
3. [ ] Inventory every command and dependency
4. [ ] Define shared action contract
5. [ ] Add shared permission and hierarchy validation
6. [x] Convert `avatar` as the reference action
7. [x] Preserve slash and prefix behavior for the avatar reference action
8. [ ] Auto-generate help
9. [ ] Begin Core Command Parity
10. [~] Natural-language routing verified for avatar; remaining actions require conversion

# Completion Report

After each working feature, report:

```text
Completed:
Roadmap update:
Files changed:
Why they changed:
What now works:
Verification:
Regression checks:
Commit:
PROJECT_STATE.md update:
Next recommended feature:
```

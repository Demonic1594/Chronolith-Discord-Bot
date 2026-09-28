# Chronolith

A full-featured Discord **moderation** bot built on [ForgeScript](https://github.com/TryForge/ForgeScript) — punishments with a case system, automod, anti-raid, snipe, tickets, logging, and per-guild configuration, in one package.

Every command exists as both a prefix command and a slash command. All state is per-guild and survives restarts (ForgeDB).

---

## Features

| Area | What you get |
|---|---|
| **Punishments** | `warn` (auto-escalation), `mute`/`unmute`, `quarantine`/`unquarantine` (isolation role + 28d mute), `kick`, `ban`, `softban`, `unban`, `tempban` (scheduled auto-unban, restart-safe), `massban`, `setnick` — every action validated (self/bot/owner protection, role hierarchy, bot capability), case-logged, DM-notified |
| **Case system** | numbered cases with modlog embeds, `case` inspection, per-user `cases` history, `reason` edits; **manual bans/unbans done through Discord are also auto-logged** with the real executor from the audit log |
| **Automod** | invite blocking, banned words, **link filter with domain whitelist**, mention limit, all-caps, **flood ratelimit (auto-mute)** — each module toggleable, violations delete + log + notice |
| **Anti-nuke** | Wick-style: watches channel/role deletes, webhooks, bans, kicks, prunes via the audit log; non-mods crossing the threshold (default 3 in 20s) are auto-banned/kicked/stripped and every hit alerts the modlog |
| **Anti-raid & verification** | join throttle (N joins / M seconds → alert or automatic lockdown), minimum-account-age gate, **join verification** (unverified role + DM button, `%verify` fallback), alt signals (new-account flags) in join logs |
| **Channels** | `purge` (optionally single-user), `slowmode`, `lock`/`unlock`, `lockdown`/`unlockdown` (panic button — and restore exactly what it locked) |
| **Logging** | modlog channel for cases, plus join/leave, **deleted/edited message**, nickname-change, and channel/role create+delete+update log channels — every embed consistently branded |
| **Utility** | `snipe` / `editsnipe` (last 5 per channel), `userinfo` with warning counts, `serverinfo`, `roleinfo`, `inrole`, `avatar`, `banner`, `stats`, `role add/remove`, `report`, private `ticket` channels with a close button, `ping`, paginated button `help`, `%quicksetup` one-shot defaults |
| **Config** | everything per-guild: modlog channel, mod roles, muterole, autorole, warn escalation, automod modules, join gate, log channels, ticket category |
| **Safety** | owner-only `eval` in the maintainer-recommended shape, cooldown keys on author IDs, no user input reaches `$eval`/`$djsEval`, permission hierarchy checks on both the invoking mod *and* the bot |

## Setup

```bash
git clone https://github.com/Demonic1594/Chronolith-Discord-Bot
cd Chronolith-Discord-Bot
npm install
cp .env.example .env    # then edit .env and put in your BOT_TOKEN
npm start
```

**Required in the [Discord developer portal](https://discord.com/developers/applications):**
- Privileged Gateway Intents: **Server Members** and **Message Content** (both are used)
- The bot needs roles *below the members it moderates* — hierarchy is enforced by Discord itself

**Recommended bot permissions** when inviting (integer `1101682311286` or use the link generator):
View Channels, Send Messages, Embed Links, Attach Files, Read Message History, Manage Messages, Manage Channels, Manage Roles, Moderate Members, Kick Members, Ban Members.

First steps in your server (as someone with Manage Server):

```
%modlog #mod-log          — where cases are posted
%modrole add @Moderator   — who can use mod commands
%automod invites on       — try the automod
%warnset 3 mute 1h        — 3 warns → 1h auto-mute
```

## Commands

Prefixes: `c!`, `c?` or `%`. Every command below also exists as a slash command (except `eval`).

### Security
| Command | Effect |
|---|---|
| `%antinuke <on\|off> [threshold] [ban\|kick\|strip]` | Anti-nuke defense (whitelist = mods) |
| `%verify <role\|off>` | Join verification gate |
| `%quarantine <user> [reason]` / `%unquarantine <user>` | Instant isolation |
| `%tempban <user> <dur> [reason]` | Temporary ban with scheduled auto-unban |
| `%massban <ids...>` | Ban many users by ID |

### Punishments
| Command | Effect |
|---|---|
| `%warn <user> [reason]` | Warn; escalates at the configured threshold |
| `%warnings <user>` | List warnings |
| `%delwarn <user> <case#>` | Strike one warning (kept as history with an amended reason) |
| `%clearwarns <user>` | Clear all warnings |
| `%mute <user> <duration> [reason]` | Mute (muterole if configured, else timeout; max 28d for timeouts) |
| `%unmute <user>` | Remove mute/timeout |
| `%kick <user> [reason]` | Kick |
| `%ban <user> [reason]` | Ban (ID works for users who already left) |
| `%softban <user> [reason]` | Ban + delete last day of messages + unban |
| `%unban <id> [reason]` | Unban |
| `%setnick <user> [nick]` | Change a nickname |

### Channels
| Command | Effect |
|---|---|
| `%purge <1-100> [user]` | Delete messages (optionally only one user's) |
| `%slowmode <seconds\|off>` | Set channel slowmode |
| `%lock [channel]` / `%unlock [channel]` | Lock/unlock one channel |
| `%lockdown` / `%unlockdown` | Lock/restore every text channel |

### Cases & logs
| Command | Effect |
|---|---|
| `%case <number>` | Inspect a case |
| `%cases <user>` | A user's full history |
| `%reason <case#> <new reason>` | Edit a case reason |
| `%modlog <#channel\|off>` | Set the case-log channel |
| `%logs <joinleave\|serverlogs> <#channel\|off>` | Set log channels |

### Automod & anti-raid
| Command | Effect |
|---|---|
| `%automod <invites\|mentions\|caps> <on\|off>` | Toggle a module |
| `%wordadd <word>` / `%worddel <word>` / `%words` | Manage the banned-word list (active whenever non-empty) |
| `%joingate <minAgeDays> <joins> <windowSec> [lockdown]` | Account-age gate + raid throttle |

### Setup
| Command | Effect |
|---|---|
| `%config` | Show current settings |
| `%modrole add\|remove <role>` | Moderator roles (ManageServer always qualifies) |
| `%muterole <role\|off>` | Use a mute role instead of timeouts |
| `%warnset <threshold> <mute\|kick\|ban\|none> [duration]` | Escalation |
| `%autorole <role\|off>` | Role to hand out on join |
| `%tickets <#category\|off>` | Category for ticket channels |

### Info & utility
`%help` (paginated) · `%ping` · `%userinfo [user]` · `%serverinfo` · `%roleinfo <role>` · `%avatar [user]` · `%inrole <role>` · `%snipe [index]` · `%editsnipe [index]` · `%report <user> [text]` (everyone) · `%ticket` (everyone)

### Owner only
`%eval <code>` — evaluates ForgeScript, output to a file if long.

## Architecture

```
index.js          client: ForgeScript ^2.7 + ForgeDB, curated intents/events
functions/        the engines ("thin commands, fat functions")
  config.js       per-guild config JSON + $isMod permission gate
  punish.js       $punish pipeline: validate → apply → case → notify → escalate
  cases.js        numbered case storage (guild vars)
  notify.js       modlog embeds + silent target DMs
  lockdown.js     channel/server lock + unlock-what-was-locked
  snipe.js        snipe cache reader
  help.js         help pages (shared by prefix/slash/paginator)
  duration.js     $durationToMs: "10m" → 600000 (the $parseMS gap-filler)
  reports.js      report lifecycle: create → claim → resolve/dismiss → archive
  notes.js        staff notes with add/edit/remove/clear
  targets.js      $resolveTargets: mention/username/ID/reply parsing
  scan.js         $scanMessages: history scanner for filtered purges
  massban.js      $massBan: multi-target ban driver
  timed.js        $timedList: active moderation reader
  antinuke.js     $anCheck: destructive-action watcher
  tempban.js      $tempban + $tempbanSweep: scheduled bans
  theme.js        color palette + action emoji mapping
events/           automod filter (6 modules), snipe capture, join gate + autorole +
                  raid throttle, verification, message/channel/role logs, ban sync,
                  anti-nuke audit watcher, button router, ready sweeper
prefixesCmd/      prefix commands (generated from one spec: tools/gen_commands.py)
slashesCmd/       slash mirrors (same spec — the two can never drift)
tools/            gen_commands.py, check.py, audit.py, fslint.py (24-check analyzer)
validate.js       compiles EVERY file through the real ForgeScript compiler, no login
tests/            synth.js (synthetic gateway), actor.js (two-bot E2E driver)
```

Design decisions worth knowing:

- **Who is a mod:** the bot owner, anyone with **Manage Server**, or holders of a configured `%modrole`. Automod bypasses mods.
- **Per-guild config** is one JSON blob in a guild variable (`cfg`); cases are `case_<n>` guild vars plus a per-user index. List-shaped settings are stored comma-separated.
- **Manual-ban sync:** when someone bans through Discord's own UI, Chronolith reads the audit log and files the case with the real executor and reason.
- **Lockdown remembers** exactly which channels it locked; `unlockdown` restores those, not "everything with a deny".
- **`mute` prefers a configured muterole** (add/remove role) and falls back to native timeouts; `unmute` clears both paths.
- Prefix and slash command files are **generated from a single spec** (`tools/gen_commands.py`) so the mirrors stay identical; `python3 tools/gen_commands.py` regenerates them, `python3 tools/check.py` + `node validate.js` sanity-check and compile-check everything.

## Development

```bash
node validate.js              # compile-check all commands/events/functions (no token needed)
python3 tools/fslint.py       # 24-check static analyzer (brackets, types, security, leaks)
python3 tools/check.py        # fast bracket + function-name sanity check
python3 tools/gen_commands.py # regenerate command files after editing the spec
python3 tools/fslint.py --deps       # custom-function dependency graph
python3 tools/fslint.py --explain '$fn'  # KB lookup for any function
python3 tools/fslint.py --sim '$code'    # trace execution order
```

## License

Apache-2.0 (see LICENSE).

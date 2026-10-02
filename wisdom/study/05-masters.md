# Level 05 — Masters: architecture

**Prerequisite:** 04. **Passing:** you design the *shape* of a system before writing any command, and you can justify every boundary.

## Lesson 1: the hybrid boundary (when scripts stop being enough)

ForgeScript is a command layer, not an application runtime. The scaling pattern (amc): **thin commands → fat custom functions → TS/Node bridges**. When logic needs real libraries (youtubei, canvas pipelines, crypto), write a custom function whose body is one `$djsEval` bridge — command code stays pure ForgeScript.

The `$djsEval` bridge API (from production): `ctx.getEnvironmentKey(name)` (the `$let` store), `ctx.getKeyword(name)`, `ctx.member`, `ctx.channel`, `ctx.client`. Escape `;` as `\\;` inside eval code. Shape: `$return[$try[$djsEval[…your JS…; true\\;];false]]`.

## Lesson 2: state architecture — three tiers by lifetime

| Lifetime | Store | Examples |
|---|---|---|
| one execution | `$let` env | intermediate results |
| cross-command, process-lifetime | Edge cache tables (`$getCache[table;k]`) | player message IDs, presence flags |
| cross-restart | ForgeDB/QuorielDB | economy, configs, scheduled work |

Namespace keys by scope: `musicplayer_message_$guildID_channelid` (amc). One table per subsystem (`initclientmusic`) — tables are your isolation boundary. Data that must survive restarts gets **snapshotted at capture time** (JSON with IDs, never live context functions).

## Lesson 3: command-file taxonomy (design-time choices)

- message commands: `name`+`aliases`+`type:"messageCreate"` — compiled triggers, `prefixMode`/`unprefixed` for prefix-less commands, `nameCaseInsensitive` default true.
- slash: `data` (raw Discord JSON or builder; `type` = RegistrationType 0/1/2), autocomplete flags on options.
- event handlers: `type:"<eventName>"`, `allowedInteractionTypes` for interaction sub-filtering.
- extension-event handlers: load via `music.commands.load(...)` / `db.commands.load(...)` with the extension's event names (`playerTrigger`, `databaseConnect`) — payloads arrive as `$env[rawKey]`.

## Lesson 4: interaction UX systems (the hard part of real bots)

- **Owner-of-the-message pattern**: send `_ _` placeholder, capture ID, edit forever after (music players). Cross-command ownership lives in cache: `message_$guildID_messageid`.
- **CustomID protocol**: versioned envelope `page-rows-action-authorID`; delimiters chosen by payload alphabet (`-` for digits, `!!!` when payloads may contain `-`); author verification segment mandatory for mutating actions; whitelist check against forged IDs.
- **Pagination math**: rows-per-page bound by Discord's 5-action-row cap (4 item rows + nav). `$arraySplice[entries;0;rows]` chunking (starter patterns from timeout-system).
- **Autocomplete at scale**: dual-counter scan, cap 25, `$applicationSubCommandName` scoping for subcommand commands.

## Lesson 5: security architecture (not just gates)

- Owner eval is acceptable ONLY in the maintainer shape: gate first line, `$eval[$message;false]`, long output → attachment, silent reaction (audit #8).
- Secrets: process.env via `$djsEval[process.env.X]` at runtime — never in command code, never in `$log`.
- User input trust: `$message`/options are attacker text. Never feed into `$eval`/`$djsEval`/URL-typed args unvalidated; cooldown keys must be IDs (text keys = bypass); `$httpRequest` URLs from users = SSRF surface — whitelist.
- The five greps when reviewing someone's command file: `$djsEval`, `$eval`, `$exec`, `$httpRequest`, webhook execution.

## Lesson 6: operational design

- Log with `$logger[type;text]` / `$chalkLog` sparingly; `logLevel` controls verbosity globally.
- `respondOnEdit` (bool or ms window) re-runs messageCreate on edits — decide deliberately.
- Startuptime work in `clientReady`: register fonts, load config files (`$readFile`), arm intervals, resweep persisted schedules.
- Version pinning: npm releases vs `#dev`; assume experimental-family semantics may shift between them.

## Exercises — WRITE (design documents, then code)

W1. Design (file tree + data flow, then code): a ticket system — open/close buttons, transcript attachment on close, per-guild config, restart-safe open-ticket registry.
W2. Design a `leaderboard` command over a ForgeDB economy var: pagination, refresh button, cache the computed top-100 for 5 min.
W3. Turn W2's compute into a TS-bridged custom function using `$djsEval` (sorting 10k records in JS).

## Exercises — FIX (architecture smells)

F1. A bot where every command re-fetches the same API. Name the fix at each tier.
F2. Buttons work for anyone; author check "added later" via `$onlyIf[$authorID==$env[owner]]` but `$env[owner]` is empty. Structural cause + fix.
F3. Music player message duplicates after restarts. Which state wasn't namespaced/cleared?

## Answer key (sketches — full code in your head should follow)

- W1 sketch: `commands/ticket.js` (open; writes `tickets_$guildID_$authorID` row: channel, msg, owner into DB), `events/interactionCreate` (CustomID `tk-close-$authorID` → archive channel messages via fetch loop → `$attachment[transcript...]` → delete row), config via `$getGuildVar[ticketCategory]`. Registry in DB = restart-safe.
- W2: compute `$getUserLeaderboard…` or scan into `$arrayLoad`, chunk `$arraySplice`, render 4 rows/page, `lb-$page-$rows-lbrefresh-$authorID` CustomIDs, cache table `lb` key `top100_$guildID` with `$setInterval` 5m refresh.
- W3: `new ForgeFunction({name:"topN", params:["var","n"], code: \`$return[$djsEval[ (()=>{ const db=require('...').default; const rows=…; return JSON.stringify(rows.slice(0,ctx.getEnvironmentKey('n'))) })()\\; ]]\`})` — shape matters, adapt to your DB access.
- F1: request tier → `$httpRequest` once per interval; state tier → cache table with TTL key; UI tier → commands read cache.
- F2: `$env[owner]` lives in the *command's* execution; the interaction handler is a different execution. Encode the owner in the CustomID at build time (stateless) or store message→owner in cache/DB (stateful).
- F3: The player-message cache keys weren't re-validated on startup: `clientReady` must load the registry, delete orphans, and only then re-arm (the timeout system's resume + dedupe check is the reference).

## Flashcards

| Prompt | Answer |
|---|---|
| Hybrid boundary | commands → custom fns → `$djsEval` TS bridge |
| djsEval context access | `ctx.getEnvironmentKey/getKeyword/member/channel` |
| Cache isolation unit | the table name |
| Restart-safe schedule | absolute endTime in DB + clientReady resweep |
| CustomID author segment | mandatory for mutating actions |
| Rows per paginated page | 4 (+ nav row = Discord's 5-row cap) |
| Cooldown keys must be | IDs, never user text |
| The five review greps | djsEval, eval, exec, httpRequest, webhook |

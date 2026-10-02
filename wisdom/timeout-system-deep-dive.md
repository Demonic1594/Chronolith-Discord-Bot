# Timeout-system deep dive — patterns proven by real production code

> Source: `../../code/advanced-timeout-system/` (fetched 2026-09-26, current version per author updates). This file records what working code taught me that metadata never could. Every claim below was cross-checked against ForgeScript `main` source.

## The system in one paragraph

`$advancedTimeout[$escapeCode[code];time;id;data?]` stores escaped code + metadata in ForgeDB, arms a *native named timer* (`$setTimeout`), and survives restarts via a `clientReady` sweep that recomputes remaining time and re-arms (or fires overdue) timeouts. It's the best reference implementation I have for custom functions (`knowledge/core/custom-functions.md`), JSON env flows, and component CustomID routing.

## Pattern 1: beating the 32-bit timer limit with recursion

Node's `setTimeout` breaks beyond 2,147,483,647 ms (~24.8 days) — it fires immediately or misbehaves. The system's bypass:

- Store an absolute `endTime` (`$math[$getTimestamp + time]`), never a relative duration.
- Arm the native timer for `min(totalLeft, 2147483647)`.
- When the step timer fires: re-read `endTime` from DB; if still in the future, **re-call `$advancedTimeout` recursively** with `{"forceEndTime": ...}` in the data field (the recursion marker that also disables the duplicate-ID check); if past due, delete from DB and execute.

Wisdom: any ForgeScript timer > 24 days needs this shape (or host-side cron). Also note the deliberate `$!advancedTimeout[...]` negation — recursion is fire-and-forget, output discarded.

## Pattern 2: restart resumption

`clientReady` sweeps the DB: for each timeout, `totalLeft = endTime - now`; overdue → execute now, live → re-arm via the same recursion path. **Bug class the author already fixed:** if the sweep deletes-then-re-adds carelessly, timeouts vanish on restart — the fix is letting the re-arm path preserve the record (duplicate check skips when `forceEndTime` present). Lesson: resume logic must distinguish "fresh insert" from "reschedule" — a state flag in the data payload is the clean way.

## Pattern 3: context death across restarts

Inside `clientReady` there is **no author, channel, or message context** — `$authorID`/`$channelID` are dead. The system snapshots them as JSON at scheduling time (`data` arg) and does literal `{placeholder}` substitution into the escaped code before storage. Wisdom: anything that must survive a restart gets its context *serialized at capture time*; placeholder substitution beats re-resolution because re-resolution can't happen later.

## Pattern 4: freeze/thaw for code-as-data

`$escapeCode[...]` (alias `$esc`) is the only way to pass code through a param — custom functions unwrap args (inner functions would execute immediately). Storage round-trip: escape → replace real newlines with `{N}` (DB/storage mangles `\n`) → on fire, decode `{N}` → `\n` → `$eval[code;false]` wrapped in `$try`. The `$try` matters: stored code may reference things that expired (channels deleted, etc.) — a failed timeout shouldn't crash the sweep.

## Pattern 5: CustomID as a protocol

Buttons carry `page-rows-action-authorID` (nav/refresh) or `page!!!rows!!!timeoutID!!!action!!!authorID` (row actions). Two delimiters because **timeout IDs may contain `-`** but never `!!!`; page/rows/authorID are numeric so `-` is safe there. The last segment is always the author — the interaction handler verifies `$arrayIncludes[IID;$authorID]` so only the invoker can use the buttons (plus `$onlyIf` on allowed action names — a whitelist against forged CustomIDs). Wisdom: CustomID is your only server-side state channel for components; design it as a typed, delimiter-safe envelope with an authenticity check.

## Pattern 6: `maxRows=4` is a Discord law, not a preference

Each timeout row renders one action row of 3 buttons + the list header/footer needs the nav row. Discord hard-caps messages at **5 action rows** — 4 item rows + 1 nav row = the maximum. The code literally warns "MORE THAN 4 ROWS CAN CAUSE ISSUES WITH DISCORD INTERACTIONS". Any paginated component UI inherits this arithmetic.

## Function-shape corrections/confirmations vs my docs

All verified consistent with `../knowledge/` after alias resolution — the six functions that looked "missing" are aliases: `$esc`→`$escapeCode`, `$fn`→`$localFunction`, `$callFn`→`$callLocalFunction`, `$stopTimeout`→`$clearTimeout`, `$inline`→`$inlineCode`, `$isValidJSON`→`$isJSON`. The alias-stub files in `functions/` paid off immediately.

Notable shapes real code leans on that docs under-explain:

- `$loop[times;code;var;asc]` — **omit `asc` and it counts DOWN**; real code always passes `true` and reads `$env[i]` (1-based).
- `$env[...]` rest-args = nested path access — `$env[timeouts;id;code]`, `$env[listPage;i;0]` (array index). The dominant data-access style in real code, alongside `$jsonLoad`.
- `$arrayMap[name;var;code;outputVar]` — the 4th arg is where mapped results land.
- `$arraySome[name;var;code]` — predicate with its own element var.
- `$setTimeout[code*;time;name]` (raw code, runs later on a cloned ctx) + `$clearTimeout[name]` (returns bool) = the named-timer registry.
- `$attachment[content;filename;asText]` — raw text becomes a file attachment (used to export timeout code as `Code.bash`).
- `$onlyForUsers[code*; users(rest)]` — note the code arg comes FIRST; real usage `$onlyForUsers[;$botOwnerID]` passes an empty code (silent stop).
- `$getGlobalVar[name;default]` — second-arg default makes cold-start (`{}`) handling one-liner clean.

## Idiom upgrades I'm adopting into my own recipe writing

1. `$fn[helper;...;params]` + `$callFn[helper;args]` for inner error paths (see `throwError` in the base file) — better than copy-pasted error blocks.
2. `$function[... $return[expr]]` IIFE blocks for pure validation/derivation logic (the `rowsArg`/`pageArg` sanitizers are textbook: validate → `$return` fallback).
3. `$default[$option[page];$message[0]]` — one command file serving both slash and prefix invocations.
4. `$interactionUpdate[$displayTimeoutsListContainer]` + `$ephemeral`-flagged `$interactionFollowUp` — the update-then-notify split for component UX.
5. Encode-then-store discipline: never store raw multi-line code in DB vars; pick a sentinel (`{N}`) and decode at use.

## Open questions / version watch

- The whole system rides experimental functions (`$loop`, `$switch`, `$case`, `$function`, `$try`, array iterators). If their semantics shift, `refresh.sh` + re-reading this code is the drift check.
- `$parseMS`/`$parseString`/`$discordTimestamp` (enum arg `RelativeTime`) worked in this system — good confirmation of the Time/enum coercion docs.

## Superseded in part: `forge.timers` (npm) — the production-grade answer (verified 2026-09-28)

Community extension audit (see `community-ecosystem-field-study.md`) found **ForgeTimers** (`npm i forge.timers`, v2.0.0, peer-dep ForgeScript ≥2.7.0 + ForgeDB ≥2.1.1 or QuorielDB): it **overrides the core `$setTimeout`/`$setInterval`/`$clearTimeout`/`$clearInterval`** with signature supersets (`[code;time;name?;persist?;maxOverdue?]`, `$setCron[code;expr;name?;tz?]` + 23 functions, 10 events, shard-aware restore, sqlite/mysql/postgres/mongo/lmdb backends). Patterns 1–4 above are now my *fallback* implementation; for any new bot, prefer `forge.timers` unless avoiding the dependency.

What it does better than the hand-rolled system (mechanism notes worth stealing even if you keep your own):

- **Whole-context snapshot** instead of placeholder substitution: `PersistedVars.ts` serializes env + keywords + **`$fn` local functions** (`{code,args}` rehydrated) with Date/Map/Set/BigInt tagged under a versioned `$forge` discriminator, per-value drop logging, `Infinity` as a string sentinel. This is the strongest realization of Pattern 3 I've seen.
- **32-bit limit**: host-side `setLongTimeout` chunking at `MAX_DELAY` with deadline re-arm — same math as Pattern 1, no interpreter round-trip.
- **Bounded replay**: per-kind restore policy (`persist`, `maxOverdue` drop, `restoredTicksLimit` missed-tick replay), then a `timersReady` event.
- **Failure grading**: channel gone → still run; transient fetch error → keep record, retry next boot; code no longer compiles → drop with `timerDrop` event.
- **Sharding**: guildless timers → shard 0; guild timers by Discord's shard formula — exactly one shard arms each.

Trade-offs: unnamed timers never persist (the hand-rolled system persists all with generated IDs); complexity of typeorm/peer pins; no per-call `data` JSON injection (state lives in the env snapshot instead — cleaner but different).

**Cross-extension hazard proven:** ForgeTimers registers `$cron`/`$deleteCron` as aliases; **ForgeCron** (Tape490) registers `$cron`/`$deleteCron` with a **different argument order**. Loading both silently cross-wires calls. Before adding any community extension, diff its function names against everything already loaded.

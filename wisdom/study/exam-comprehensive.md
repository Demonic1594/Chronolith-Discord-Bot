# Doctoral comprehensive exam — ForgeScript

Eight problems, each graded by a model solution and a *rule set* (the rules are the real learning). Time yourself: 90 minutes. No peeking at knowledge/ until after.

---

## P1 — The silent economy (WRITE)

Build `!daily` for a multi-guild bot: 24h cooldown, random 100–500 coins, per-guild-per-user balance, restart-safe, abuse-gated (no DM usage). Model answer must survive a restart mid-cooldown.

**Model solution:**
```fs
$onlyIf[$guildID!=;Server only.]
$cooldown[$authorID-daily-$guildID;24h;You already claimed daily.]
$let[pay;$randomNumber[100;500]]
$setUserVar[balance;$math[$getUserVar[balance]+$get[pay]]]
$setUserVar[lastDaily;$getTimestamp]
You claimed **$get[pay]** coins! Balance: **$getUserVar[balance]**
```
**Rules exercised:** gate-first ordering; composite cooldown key (user+action+guild); DB as the only restart-safe store; `$setUserVar` defaults to context user; duplicate `lastDaily` write = belt-and-suspenders for the in-memory cooldown.

---

## P2 — The vanishing button (FIX)

```fs
$let[mid;$sendMessage[$channelID;Ready?;true]]
$addButton[go;Go;Success]
```
Button never appears. Two independent defects.

**Answer:** (1) Buttons must sit in an action row: `$addActionRow` before `$addButton`. (2) The buttons attach to the *outgoing container* — but `$sendMessage` already sent its own container with just the text; components added after the send never attach to that message. Build before sending: `$addActionRow\n$addButton[...]$sendMessage[$channelID;Ready?;true]` (embed/component fns before the send call), or edit the message after.

---

## P3 — The 40k-autocomplete (DESIGN + FIX)

An autocomplete handler parses a 40k-entry JSON from raw.githubusercontent **on every keystroke**, then `$arrayForEach`s all entries adding every match. Users see 3s lag. Diagnose and redesign.

**Answer:** Defects: per-keystroke network fetch; full-array scan; unbounded adds (>25 breaks). Redesign: fetch-once into a cache table (`clientReady` + `$setInterval` refresh, `$onlyIf[$httpRequest[...]==200]` gate), scan with the dual-counter `$while` (break at 25 AND at array end), `$addChoice` only on match. The maintainer's docs-bot handler is the reference implementation.

---

## P4 — Context loss after restart (READ + FIX)

```fs
// schedules: $setTimeout[$sendMessage[$channelID;hi $username[$authorID]];1h]
```
Bot restarted after 30min. Nothing sent. Explain every failure layer and rebuild it.

**Answer:** Layers: (1) `$setTimeout` code resolves lazily but the timer itself is in-memory — restart killed it; (2) even live, the code inside resolves at fire-time against a `clientReady`-like context with no author/channel — `$channelID`/`$username[$authorID]` die. Rebuild: capture context as data at schedule time (`{"channel":"$channelID","user":"$authorID"}`), persist endTime+code+data in a DB (`$escapeCode` the code, `{N}` newlines), `clientReady` resweep re-arms or fires overdue — the advanced-timeout architecture.

---

## P5 — The pointer puzzle (READ)

`$roleInfo[$guildID;$roleID;color]` errors `InvalidArgType <@&123…>` — the caller passed a *mention*. Fix the call, then fix the *caller* so it can't happen.

**Answer:** Mention → snowflake: `$roleInfo[$guildID;$replace[$get[r];<@&;];color]`-style stripping is the hack; correct fix upstream: resolve once with `$mentionedRoles[0]` (or equivalent lookup) and store the raw ID. Rule: **IDs cross arg boundaries; mentions never do.**

---

## P6 — The pagination protocol (WRITE)

Spec: leaderboard page `P` of `R` rows-per-page, prev/next/refresh buttons, only the original invoker may use them, empty-page and single-page edge cases. Deliver the CustomID protocol and the handler skeleton.

**Model:**
```fs
; build: $addButton[$get[page]-$get[rows]-lbPrev-$authorID;◀;Primary]  (+Next, Refresh: lbRefresh)
; handler:
$onlyIf[$advancedTextSplit[$customID;-;0]==lbPrev]      ; or prefix family check
$onlyIf[$advancedTextSplit[$customID;-;3]==$authorID]
$let[page;$advancedTextSplit[$customID;-;0]]
$let[rows;$advancedTextSplit[$customID;-;1]]
; recompute pages, clamp: page<1→maxPages, page>maxPages→1
$displayPage[$get[page];$get[rows]]
$interactionUpdate
```
**Rules:** `-` delimiter safe (all-digit payloads); author segment = 4th; wrap-around clamp both ends; recompute pages fresh each click (data may have changed).

---

## P7 — The experimental audit (DESIGN)

Your bot uses `$while`, `$ifx`, `$try`, `$cooldown`, `$arrayMap`, `$switch`. Upstream ships a new minor. Design the upgrade-check procedure in priority order with reasons.

**Answer:** (1) Diff experimental/deprecated sets (all six flagged experimental — semantics may shift silently); (2) changelog pages for flagged functions; (3) re-run signature drills against your corpus (arg-count drift); (4) validator pass (bracket/arg-count topology); (5) staging: the five heaviest commands, watch for silent-miss pointer bugs. Rationale: risk = (flag × usage) — flagged+heavily-used first.

---

## P8 — The reviewer's hour (READ/FIX — security)

```fs
$name: $eval[$message]
$httpRequest[$option[url];GET]
$cooldown[$message[0];10s;slow]
$let[cmd;$djsEval[$option[action]]]
```
Rank by severity and fix each.

**Answer:** (1) `$eval[$message]` — RCE, worst: gate to owner AND restrict surface (whitelisted actions), never raw eval of user text. (2) `$djsEval[$option[action]]` — same class via interaction. (3) `$httpRequest[$option[url]]` — SSRF: whitelist domains, or map user choice → fixed URL. (4) `$cooldown[$message[0];…]` — cooldown bypass (vary the text): key on `$authorID`. Rule set: user input × power functions = the review axis.

---

## Scoring

- 8/8 with rules cited: PhD. 6–7: Masters — redo the missed *rules*, not the problems.
- ≤5: back to the level files; do the FIX tracks cold before re-attempting.

# Level 01 — Elementary: the argument gate and data basics

**Prerequisite:** 00. **Passing:** predict arg-gate pass/fail cold; use `$let`/`$get`/`$env` without hesitation.

## Lesson 1: every arg crosses a type gate (the #1 bug source)

When a function has `unwrap: true`, each resolved arg is checked before the body runs. Fail = whole command dies with `InvalidArgType`. Memorize the gate rules (full table: `../../knowledge/core/arg-types.md`):

| Type | Accepts | Silent killers |
|---|---|---|
| Boolean | **only** `true` / `false` | `yes`, `1`, `True` all FAIL |
| Snowflake-typed (Channel/User/Role/Member/Message/…) | 16–23 digit ID | mentions `<@…>`, usernames, URLs FAIL |
| URL | `https://…` | plain `http://` FAILS the regex |
| Number | `5`, `-3.5`, `1e3` | `abc` FAILS |
| Permission | camelCase flag (`ManageMessages`) | spaces/wrong case FAIL |
| Time | number (ms) or `10m`/`1h30m` | `10 minutes` FAILS |
| Json | JSON text | invalid JSON FAILS |
| Emoji | `<:name:id>`, raw id, CDN URL | some resolvers reject bare `:smile:` |

**The empty-optional exception**: optional args left empty skip the gate entirely (arrive as `null` — implementation picks a default). That's why `[id;;flag]` with a hole can work.

## Lesson 2: pointers — args resolve against earlier args

Entity types (Member/Role/Message/…) resolve against a *previously resolved arg* (their `pointer`) or the context. `$roleMembers[guildID;roleID]` = "find guild from arg 0, then the role INSIDE it". Reorder = silent miss (no error, just nothing). **Argument order is part of the contract.**

## Lesson 3: context — the invisible args

Every command runs inside an event's context. `$authorID`/`$channelID`/`$message` need a message; `$customID`/`$option` need an interaction; `clientReady` has **none** (no author, no channel — snapshot anything you need into JSON BEFORE a restart). Per-event availability: `../../knowledge/events/_INDEX.md`.

## Lesson 4: `$message` is 0-based

`!give @bob 100 coins` → command `give`, then: `$message[0]`=`@bob`... wait — mentions: `$mentioned[0]` is the first *mention*; `$message[0]` is the first raw *argument*. Both 0-based. `$message[1;3]` slices. Bare `$message` = all args joined. The command name is already stripped. **Reflex check: every `[1]` you see in aoi-style code is a latent bug.**

## Lesson 5: variables — three readers, one store

| Function | Reads | Use for |
|---|---|---|
| `$get[key]` | single key | simple values |
| `$env[key;sub;sub2;0]` | **paths**: nested objects, array indices | JSON/arrays (rest-args walk the tree) |
| `$let[key;value]` | (writes) | — |

Env keeps real JS types until stringified. `$let[arr;a;b;c]` stores an actual array; `$get[arr]` prints it JSON-pretty. Writes inside custom functions / `$function` blocks don't propagate out (cloned context) — pass data out with `$return` or a DB.

## Worked example

```fs
$let[uid;$mentioned[0]]
$onlyIf[$get[uid]!=;Mention someone!]
$userTag[$get[uid]] joined $parseDate[$userCreatedAt[$get[uid]];LocaleDate]
```

Mention → gate → cross-type use (String ID into User-typed arg — the *gate* wants a snowflake string, `mentioned` returns exactly that).

## Exercises — READ

R1. `$sendMessage[$channelID;hi;yes please]` — passes or fails, and where?
R2. `$hasPerms[$guildID;$authorID;manage messages]` — ?
R3. `$wait[10 minutes]` — ?
R4. `$arrayAt[list;1]` where list = `a;b;c` → ?
R5. In `clientReady`: `$username[$authorID]` → ?

## Exercises — WRITE

W1. Store the first arg, gate it non-empty, reply with it uppercased (`$toUpperCase`).
W2. Read `config.color` from a JSON you loaded with `$jsonLoad[config;{"color":"#fff"}]`.
W3. Compute days since a member joined (`$memberJoinedAt` → days), using `$math` and `$getTimestamp`.

## Exercises — FIX

F1. `Avatar: $userAvatar[@bob]` fails. Two things wrong — name both.
F2. `$onlyIf[$message[1]!=;usage: !kick <user>]` never fires when user types `!kick @bob`. Why?
F3. Outside: `$let[x;5]`. Custom function `bump` contains `$let[x;8]`. Code: `$callFunction[bump]$get[x]` prints `5`. Why?

## Answer key

- R1: FAILS at arg 2 — Boolean gate: `yes please` ≠ `true`.
- R2: FAILS — permissions are camelCase: `ManageMessages`.
- R3: FAILS — Time gate: `10m` or `600000`, not prose.
- R4: `b` — 0-based.
- R5: Empty/fails — `clientReady` has no author context; `$authorID` resolves nothing.
- W1: `$let[target;$message[0]]$onlyIf[$get[target]!=;missing arg]$toUpperCase[$get[target]]`
- W2: `$env[config;color]`
- W3: `$math[($getTimestamp - $memberJoinedAt[$guildID;$authorID]) / 86400000]` (integer-ish; `$round` to taste)
- F1: (a) arg must be a snowflake ID, not a mention string; (b) resolve the mention first: `$userAvatar[$mentioned[0]]`.
- F2: First arg is index **0**: `$message[0]`.
- F3: Custom functions run in a **cloned context** (shallow env copy) — `$let` writes inside `bump` never propagate back to the caller. Pass data out with `$return` and capture: `$let[x;$callFunction[bump]]`. (Trained habit: when output ≠ expectation, check modifiers/escapes first, then verify semantics on the function's page.)

## Flashcards

| Prompt | Answer |
|---|---|
| Boolean gate accepts | exactly `true`/`false` |
| Mention → ID function | `$mentioned[0]` (0-based) |
| URL gate requires | `https://` |
| Optional empty arg becomes | `null` (skips the gate) |
| Pointer args resolve against | earlier resolved args / context |
| `$env[a;b;0]` does | walks path a→b→index0 |
| `$message` base | 0-based, command name stripped |
| `clientReady` has | no user/channel/message context |

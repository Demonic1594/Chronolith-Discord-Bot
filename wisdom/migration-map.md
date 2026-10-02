# Migration map — aoi.js / BDFD / DBScript → ForgeScript

> Consolidated from the official migration post (`../../code/migration-guide/`) plus every verified difference found during code audits #1–#5. This is the cheat sheet I use when a snippet "looks right" but came from a sibling language.

## The one rule that causes most migration bugs

**ForgeScript indexes are 0-based.** `$message[0]` is the first argument, `$mentioned[0]` the first mention (source: `mentions.users.at(i)`), `$arrayAt[arr;0]` the first element, `$splitText[0]` after `$textSplit`. The sibling languages are 1-based — every migrated snippet using `[1]` for "first" is subtly wrong. (Upstream's own note: some functions were 1-based historically and are being normalized — if a `[0]` misbehaves, check the function's `execute()` in its knowledge page for the indexing base.)

## Text splitting: both paths exist, prefer arrays

- aoi-style `$textSplit[text;sep]` + `$splitText[index]` **do exist** in ForgeScript (array category) for compatibility — one implicit shared slot, 0-based reads.
- The idiomatic path is `$arrayLoad[name;sep;values]` — named slots, so multiple arrays coexist (`$arrayLoad[nums;,;1,2,3]` + `$arrayLoad[texts;,;a,b]` don't clobber each other, unlike the implicit `$textSplit` slot), plus the whole `$array*` toolkit (`$arrayAt`, `$arrayMap` filter-map, `$arrayJoin`, ...) operates on named arrays.

## Function responses are containers, not parsed strings

Embed/component functions may live *inside* a response argument:

```fs
$sendMessage[$channelID; $title[Hello!]
$description[This is an embed message!] ]
```

Mechanics (source-verified): response-arg resolution executes the inner `$title`/`$description` etc., which mutate `ctx.container`; `$sendMessage` sets `container.content` and sends the whole container. Same for `$onlyIf[cond;response]` (sends the container then stops) and `$cooldown[id;dur;message]`. No special parsing — it's just execution order.

## Action rows are explicit

`$addActionRow` starts a row (source: replaces `container.actionRow` with a fresh builder). Discord's platform rules apply: ≤5 buttons per row, a select menu takes the whole row, never mix. One `$addActionRow` per 5 buttons. In Components V2 containers (`$addContainer[...]`) the same functions compose per-section.

## Names that DON'T exist here (aoi.js reflexes)

| aoi.js/BDFD habit | ForgeScript reality |
|---|---|
| `$suppressErrors[...]` | doesn't exist → `$#fn[...]` per call, or `$try[code;catch;errVar]` |
| `$interactionReply[msg;;;ephemeral;...]` 5-arg shape | `$interactionReply[content*;return message ID]` — ephemeral via bare `$ephemeral` flag |
| `$channelSendMessage[id;msg]` | alias of `$sendMessage[channel ID*;content;returnID]` (this one IS real) |
| `$giveRole` / `$takeRole` | `$memberAddRoles[guild;user;roles]` / `$memberRemoveRoles[...]` |
| `$argsCount` | `$argCount[text]` (bare form counts command args) |
| 1-based `$message[1]` for first arg | `$message[0]` |
| `$onlyIf[$hasRoles[user;role]]` 2-arg | `$hasRoles[guild*;user*;roles*]` — pointer first |
| `$sendDM[user;msg]`-style naming | `$sendDM[user ID*;content;return message ID]` (close, but check) |
| `$pingms` / `$pingMS` (DBM/DBD folklore) | **never existed** — `$ping` / `$clientPing`. Found copy-pasted in 6 of 8 community bots; their ping commands break at runtime |
| `$httpPingms` | `$httpPing` (alias `$httpResponseTime`) |

Cooldown shape differs too: `$cooldown[id*;duration*;code]` (id is the bucket key — composite keys like `$authorID-$commandName` prevent cross-command sharing), and it **sends its message and stops the command** itself.

## Structural differences (files, not functions)

- Slash commands: `data:` field with raw Discord JSON (or a builder) — `name`/`type: "slash"` top-level style is legacy README-era.
- Command files may carry `type: "interactionCreate"` + `allowedInteractionTypes: ['button'|'autocomplete'|...]` for event filtering.
- Custom functions: `client.functions.add({name, params, code})` or `functions:` folder files; invoke directly (`$myFn[...]`), via `$callFunction[name;args]`, or keep helpers per-run with `$fn` + `$callFn` (see `custom-functions-two-systems.md`).
- Persistence: `$let`/`$get` are per-execution; cross-restart state needs ForgeDB (or QuorielDB).
- Old/new state accessors: `$oldMessage[prop]`/`$newMessage[prop]` inside `*Update` events (see `../knowledge/events/_INDEX.md` for per-event state tables).

## Migration QA checklist

1. Grep the snippet for `[1]`-style "first" indexing → convert to 0-based.
2. Grep for `$suppressErrors` → replace with `$#`/`$try`.
3. Check every interaction reply shape (2 args + `$ephemeral` flag).
4. Move textSplit chains to `$arrayLoad`/`$arrayAt`.
5. Run through the validator (`../knowledge/validate/README.md`) — it catches unknown functions only partially (it does NOT flag them!), so verify names against `../knowledge/functions/_INDEX.md` manually.
6. Grep for ghost names from *other* bot frameworks: `$pingms`, `$httpPingms`, `$giveRole`, `$argsCount` — copied muscle memory compiles as literal text and dies at runtime (see `error-decoder.md` → Ghost names).

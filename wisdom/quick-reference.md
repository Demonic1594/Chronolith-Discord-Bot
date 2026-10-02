# Quick reference — the one page to keep open while writing code

> Everything here was re-verified against `../knowledge/` on 2026-09-27 (signature pages + audited production code). If this page and a function page ever disagree, the function page wins — then fix this page.

## Anatomy & prefixes

```fs
$name[arg1;arg2]        ; = separator, [ ] wrap args, names case-insensitive
$!fn[...]               negation — run, discard output
$#fn[...]               silent — run, swallow errors
$@[sep]fn[...]          count — output = number of sep-pieces of result
$!#fn[...]              composable
```

Escapes: `\[` `\]` `\;` `\$` `\\` — backslash literalizes the next character. Nothing else (`\n` in text is literally `\n`... no — it's a backslash-escaped `n` = letter `n`; use real newlines in multi-line strings).

## The type gate (fails = whole command dies)

| Type | Accepts | Rejects |
|---|---|---|
| Boolean | exactly `true` / `false` | `yes`, `1`, `True` |
| Any entity (User/Channel/Role/…) | 16–23 digit snowflake | mentions, names, URLs |
| URL | `https://…` | plain `http://` |
| Number | `5`, `-3.5`, `1e3` | `abc` |
| Permission | camelCase key (`ManageMessages`) | spaces, wrong case |
| Enum | **exact key** (ButtonStyle = `Primary`/`Secondary`/`Success`/`Danger`/`Link` — PascalCase) | any other casing |
| Time | ms number or `45s`/`10m`/`1h30m`/`2d` | `10 minutes` |

Optional arg left empty → skips the gate, arrives `null`. Entity args with a **pointer** resolve against an earlier arg — order is contract.

## Index bases & counters

- `$message[0]` = first user arg (command name already stripped); `$message` bare = all; `$message[0;3]` slices. **0-based.**
- `$mentioned[0]` = first mention (0-based); `$argCount[$message]` counts args.
- `$arrayAt[arr;0]` = first element (0-based; negatives from end).
- `$loop` counter `$env[i]` is **1-based** (reset each iteration) → the `-1` idiom inside the body.
- `$selectMenuValues[0]` — 0-based.

## Condition fields (inside `$if`/`$onlyIf`/`$while`/filters)

`==` `!=` stringified; `< <= > >=` numeric; bare value vs `"true"`; **no `&&`/`||`** — use `$and[...]`/`$or[...]` (or nest `$checkCondition`).

## Control flow

```fs
$if[cond;then;else]                       single-expression pick (branches lazy, single-statement)
$ifx[ $if[c1;a] $elseIf[c2;b] $else[c] ]  sibling-chain assembler; multi-statement bodies
$while[cond;body]                          re-evaluates raw cond each pass — mutate inside or it never ends
$loop[times;code;var;asc]                  asc=true → 1..N (omit → N..1); -1 = infinite; $break/$continue
$switch[value; $case[fast;code] $default[code] ]
$try[code;catch;errVar]                    error message lands in $get[errVar]
$onlyIf[cond;]                             empty response = silent stop; with response = sends it, stops
```

Experimental family (per source flags): `$ifx $while $loop $switch $case $try $async $coroutine $function` + all cooldowns + array iterators. Fine to use; wrap load-bearing uses in `$try`.

## Arrays & JSON

```fs
$arrayLoad[name;sep;values]   bare $arrayLoad[name] = empty array
$arrayAt[name;i]  $arrayJoin[name;sep]  $arrayPush[name;...vals]  $arrayLength[name]
$arrayMap[name;var;$if[cond;$return[$env[var]]];name]   map+filter in one; output var = input var = filter in place
$arraySome/Every/Find/FindIndex[name;var;code]          predicates read $env[var]
$jsonLoad[var;jsonText]       $env[var;k1;k2;0] walks paths   $jsonStringify[var]
$jsonSet[var;k;v]             rest-shaped: ...keys;value    $jsonEntries[var] → [key,value] pairs
[\]                           escaped empty-JSON-array literal
```

`$let` keeps real JS types until printed (arrays print as 4-space-indented JSON). Env writes inside custom functions/`$function` blocks are **clones** — data exits via `$return` or a DB only.

## Stores (pick by lifetime)

| Lifetime | Store |
|---|---|
| one execution | `$let` / `$get` / `$env` |
| cross-command, dies on restart | Edge cache tables `$getCache[t;k]` / `$setCache[t;k;v]` |
| restart-safe | ForgeDB `$setUserVar/$getUserVar/$setGlobalVar/$getGlobalVar[name;default]` (or QuorielDB) |

## Output & messaging (verified shapes)

```fs
$sendMessage[channel ID*;content;return message ID]
$reply[channel ID*;message ID*;disable ping]   or bare $reply — marks container as reply to trigger message
$editMessage[channel ID*;message ID*;content]
$sendDM[user ID*;content;return message ID]
$interactionReply[content*;return message ID]  $ephemeral BEFORE it; slow work: $defer → $interactionFollowUp[content]
$interactionUpdate[content*]                   component-message refresh
```

Embed fns (`$title[text*;hyperlink;index]`, `$description`, `$addField`, `$color`, …) mutate the outgoing container — they may sit inside a response arg; order matters, "return value" doesn't. Rich UI: Components V2 (`$addContainer[components*;accentColor]` + `$addTextDisplay`/`$addSection`/`$addSeparator`).

## Components

```fs
$addActionRow                                  bare marker — starts a row (≤5 buttons; a select takes the whole row)
$addButton[custom ID*;label*;style*;emoji;disabled]    style = ButtonStyle enum, PascalCase!
$addStringSelectMenu[custom ID*;placeholder;disabled;minValues;maxValues]
$addOption[name*;description;value*;emoji;default]     select options — a select without options is dead UI
$awaitComponent[channel ID*;message ID*;filter*;success code*;time*]
$customID                                      read the envelope; route: $arrayLoad[id;-;$customID] + prefix check
```

CustomID = your only server-side state channel: typed, delimiter-safe envelope (`-` for digit-only payloads, `!!!` otherwise), author segment mandatory for mutating actions.

## Custom functions — two registries, don't mix callers

| Defined by | Call with | Wrong caller error |
|---|---|---|
| `functions/` folder file or `client.functions.add` (persists) | direct `$myFn[...]` (primary) or `$callFunction[name;args]` (dynamic names) | `UnknownXName: function` |
| `$fn[name;code;params…]` / `$localFunction` (per-execution) | `$callFn[name;args]` / `$callLocalFunction` | `UnknownXName: local function` |

Body rules: `$return[...]` is the only value out (stray text discarded, never sends its own message); params land in `$env[paramName]`; params resolve BEFORE the body (pass code through `$escapeCode[...]`); shallow env clone — writes don't escape.

## Timers, HTTP, files

```fs
$setTimeout[code*;time;name]  $clearTimeout[name]      named registry; dies on restart — persist endTime + clientReady resweep
$setInterval[code*;time;name] $clearInterval[name*]    >24.8 days: re-arm recursively from absolute endTime
$httpAddHeader[k;v] $httpSetBody[..] $httpSetContentType[..]   staged, auto-cleared after the call
$httpRequest[url*;method*;var?]        RETURNS STATUS CODE; body → env var (auto-typed); https only
$readFile[path*;encoding?]  $attachment[content;filename;asText]
```

## Errors

- Compile: `requires brackets` · `missing brace closure` · `expects N arguments at most` · `is not registered` (typo or extension load order — never casing).
- Runtime: `InvalidArgType <v> for argument <n>` (see gate table) · `MissingArg` (required slot empty).
- **Silence is the default failure mode**: gates fired, `notAllowed` permission stops, pointer misses — all produce *no* error text. "Nothing happened" debugging order: gates → permissions → pointer order → `$!` prefix ate it.
- No `$suppressErrors` here. Tools: `$#fn[...]` per call, `$try[code;catch;errVar]`.

## Security five-grep (before shipping anyone's command file)

`$djsEval` · `$eval` · `$exec` · `$httpRequest` · webhook execution — user input + these = RCE/SSRF. Eval is owner-gated or absent. Cooldown keys on IDs, never user text.

## Validator honesty

`/v1/validate` = syntax-only. It can't see unknown functions, can't see type errors, and false-positives after `$!#` and `$@[sep]`. Clean report ≠ correct code.

## Where to look (paths from `wisdom/`)

| Question | Go to |
|---|---|
| exact signature/quirks of `$x` | `../knowledge/functions/<category>/$x.md` — **Signature + Reference implementation sections**; the auto-authored Examples there can lie (see meta-lessons audit #9) |
| unknown function name | alias stubs first (`rg -l "Alias of .\$name" ../knowledge/functions/`), then `functions/_INDEX.md`, then extension indexes — absence in core ≠ absence in ecosystem |
| what an event provides | `../knowledge/events/_INDEX.md` |
| enum values | `../knowledge/enums/$Name.md` |
| weird behavior | `../knowledge/core/arg-types.md` then `debugging-playbook.md` |
| composition patterns | `task-to-function-map.md`, `building-recipes.md`, the deep-dives |

## Storing data (the three jsonSet laws)

Verified live 2026-09-28 — all three silently corrupt, none fail loudly:

1. **Snowflake values must be quote-wrapped**: `$jsonSet[c;u;"$env[user]"]` — `$jsonSet` parseJSONs every value; a bare ID becomes a JS number and loses precision past 2^53 (`1553806204885798952` → `...799000`).
2. **No consecutive dynamic keys**: `$jsonSet[cfg;$get[k1];$get[k2];v]` writes nothing. One dynamic key is fine. Flatten: dynamic *variable names* (`tb_<uid>`, `ms_<uid>`) + literal keys inside records + CSV index vars (`tb_all`).
3. **Top-level value-returning db calls leak output** — negate them: `$!jsonSet`, `$!jsonLoad` (leaks nothing but negation is free insurance).

Registry shape that survives everything: scalar values under dynamic var names, JSON records with literal keys, a CSV index var, and `$default[...]` guards for cold reads. Empty-string arrayLoads yield a `[""]` phantom element — filter before join, or guard the empty case first.

## Silent-death checklist (zero output, zero errors)

In order of likelihood, after a gate check: **duplicated `$cooldown`** (generator/spec both embedding the gate) → custom-fn `$return` at top level ending the command (capture in `$let`) → arg-order swap at a custom-fn call site (grep the call sites, don't trust the fields that "look right") → jsonSet silently no-op'ing (dynamic keys) → a broken .js in the loader dir poisoning the whole load (`node --check` every file).

## Engine coercion traps (verified live 2026-09-28)

| Function | Trap | Safe pattern |
|---|---|---|
| `$jsonSet[var;k;value]` | parseJSONs the **value** — bare snowflakes become Numbers, losing precision past 2^53 | Quote-wrap: `$jsonSet[var;k;"$id"]` |
| `$arrayIncludes[arr;needle]` | parseJSONs the **needle** — digit-string → Number, never matches string array | Use `$arraySome[arr;x;$checkCondition[$env[x]==needle]]` |
| `$parseMS[n]` | Takes a **Number** (ms) and returns human text — NOT a duration parser | `$parseString[text]` IS the native text→ms converter (returns 0 on failure) |
| `$arrayLoad[name;sep;""]` | Empty string → `[""]` phantom element, inflates `$arrayLength` by +1 | Guard with `$if[$raw!=;jsonLoad;arrayLoad-bare]` |

## Audit checklist for any ForgeScript codebase

Before shipping a bot, verify:
1. Every `jsonSet` value that carries a snowflake is quote-wrapped
2. Every `arrayIncludes` with digit-string data uses `arraySome` + `checkCondition` instead
3. No `parseMS` is used as text→ms (it's ms→text)
4. No user text reaches `djsEval` bodies without numeric sanitization
5. Empty-string `arrayLoad` defaults are guarded
6. Read-modify-write guild vars aren't racing (or the race is acknowledged)
7. Error messages in `$onlyIf[cond;message]` don't contain semicolons (splits args)
8. Commas in `$and`/`$or` bodies are at the right depth (tooling must be depth-aware)
9. Command aliases don't collide with other registered command names
10. Event handlers have `$guildID` guards for DM-possible events

## Runtime corrections (verified live 2026-09-28 — supersedes earlier claims)

These are KB corrections discovered by executing code against the real runtime:

**Status 2026-09-29: the knowledge base itself has been corrected** — core docs, 1,756 generated pages, and the page generator now teach the right-hand column. This table remains as the audit record.

| Claim in earlier docs | Actual behavior (verified) |
|---|---|
| Unknown functions cause compile errors | They become plain text; inner real functions inside unknown wrappers still execute |
| `$let`/`$get` = `$env` store | Different stores. `$let`/`$get` = keywords; `$env` = environment (jsonLoad, custom fn params, `$try` error var) |
| `$#` on nested calls silences and continues | `$#` only works on TOP-LEVEL calls; nested `#` is ignored. Top-level `$#` suppresses the alert but still aborts (nothing after runs) |
| `$clientToken` doesn't exist | It exists (`knowledge/functions/bot/$clientToken.md`); amc uses it for raw Discord REST |
| Build a djsEval regex parser for text→ms | `$parseString[text]` IS the native text→ms converter (returns 0 on failure) |
| Local function env writes don't escape | `$callLocalFunction` SHARES env with the caller (writes DO escape). The clone applies to `functions.add` ForgeFunctions, not `$fn` locals |
| `$parseMS` takes 1 arg (ms→text) | Actually takes `[ms; precision; separator; (4th)]` |
| `\$fn` = literal backslash + function call | The function EXECUTES (SystemRegex bug/feature) — the backslash vanishes |
| `$loop` body output accumulates | Only `$return` values accumulate; plain output is discarded |
| Json-typed args reject invalid JSON | Invalid JSON returns the raw string (no error). Color-typed args return NaN (no error). |

## Hidden state stores (three of them)

1. **JSON last-loaded pointer**: `$jsonSet[keys...;value]` / `$jsonDelete[keys]` operate on the MOST RECENTLY `$jsonLoad`-ed JSON. No variable parameter.
2. **SplitText instance**: `$textSplit[text;sep]` writes to a hidden store; `$splitText[i]` reads it. Separate from named arrays.
3. **ctx.http staging**: `$httpAddHeader`/`$httpSetBody`/`$httpAddForm` stage options consumed and CLEARED by each `$httpRequest`. Restage for consecutive calls.

## The response container accumulator (83+ functions, order-sensitive)

- Embed fns (`$title`, `$description`, `$addField`...) → mutate `container.embeds[index ?? 0]`
- `$addActionRow` pushes a new row; buttons/menus attach to the NEWEST row
- `$addStringSelectMenu` sets the newest select; `$addOption` attaches to the newest select
- `$ephemeral` is read at defer/reply time — must come BEFORE
- All flushed by any send function; **manual sends RESET the container** (embeds built before a `$cooldown` error are destroyed)

## Bool-returning mutations swallow ALL errors

`$ban`, `$kick`, `$timeout`, etc. wrap their API calls in `.catch(ctx.noop)` → return `false` on ANY failure. `false` means "Discord rejected OR exception thrown" — use `$try` if the distinction matters.

## Key engine semantic: `$djsEval` two-way bridge

Read AND write ForgeScript state from eval:
- `ctx.getKeyword(name)` — reads `$let` store
- `ctx.setKeyword(name, value)` — writes back to `$let` store (visible to subsequent `$get`)
- `ctx.getEnvironmentKey(name)` — reads `$env` store
- Escape `;` as `\;`; escape string interpolation with `$jsonStringify[var]` (produces valid JS string literal)

## The color hex trap (found live, 2026-09-29)

Any hex of the form `<digits>E<digits>` (e.g. `4E5058`) is valid JS scientific
notation — ForgeScript's color resolver does `Number(value)` before hex parsing,
so it becomes `Infinity` and `$color` throws ColorConvert, killing the whole
command silently. ALWAYS `#`-prefix such hexes (`$color[#4E5058]` — the `#`
blocks the numeric path). Palette audit rule: any palette hex that `Number()`
accepts must be `#` prefixed at every call site.

## Test-suite cooldown rule

Command cooldowns key on `authorID-commandName` (~3s). Sweeps probing sibling
commands back-to-back (%modlog after %modlog recent) silently eat replies —
space same-family probes ≥3s or expect deterministic no-reply races.

## These rules are executable — fslint v4 (76 checks, ForgeVSC engine)

Everything above is enforced by `tools/fslint.py` in Chronolith: store confusion
(both directions), container-reset-by-gate ordering, component/modal producer
chains, hidden-store producers (jsonLoad/textSplit/httpRequest), time-unit traps,
defer→followUp conflicts, context-gated accessors, spin-lock throttling, the
$jsonStringify eval bridge, operator order/dupes, bare brackets-required calls,
event-type validation, and condition-field traps (multi-operator, empty-LHS,
comma-separated and/or). v4 runs on the ported official ForgeVSC parser —
escape-parity, call-bracket-aware, $c[]-region-aware — so literal brackets never
false-flag. It is also a toolkit: --complete --signature --guides --outline
--events --fix --(un)comment. If the KB and the linter disagree, trust the
linter — its checks are regression-tested against live 2.7.1 behavior and the
dist source.

## The concurrency join (the ONLY async mechanism)

```fs
$let[done;false]
$async[ ... $let[done;true] ]
$loop[-1]
  $if[$get[done]!=false;$break]
  $wait[5]
```
This is a spin-lock — no event-based join exists. Bound the poll with a max-wait counter.

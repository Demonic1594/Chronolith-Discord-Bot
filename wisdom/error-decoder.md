# Error decoder — what error strings actually mean

Map from message → plain meaning → fix. Sources: `ErrorType` implementations and `execute()` bodies in `../knowledge/functions/`.

## Compile-time (thrown at load)

| Message | Meaning | Fix |
|---|---|---|
| `Function $x requires brackets` | Called bare, but `brackets: true` | Add `[...]` (empty `[]` is fine if args are optional) |
| `Function $x is missing brace closure` | Unclosed `[` — count your brackets | Close it; remember nested functions each need their own `]` |
| `Function $x expects N arguments at most` | More `;`-separated pieces than the signature takes | Escape literal `;` as `\;` — or you're on the wrong function version |
| `Function $x is not registered` | Name unknown at compile time | Typo? Extension not loaded before compile? (aliases & casing are fine — check spelling and load order) |
| *No error — the name just renders as literal text* | Unknown function names are **not compile errors** — they pass through as plain text (verified live) | Existence-check the name against `functions/_INDEX.md` or the alias stubs before shipping |

## Ghost names — functions that never existed (community-verified 2026-09-28)

Auditing 8 community bots found a *recurring* failure class: names copied from Discord Bot Maker / DBD folklore that exist nowhere in ForgeScript (checked against every tag from 1.5.0 → 2.7.1 + live metadata + all aliases). They compile "fine" (see above — unknown = literal text) and throw only at runtime, usually in the bot's ping command:

| Ghost | Real function(s) |
|---|---|
| `$pingms` / `$pingMS` | `$ping` (also `$clientPing`, `$botPing` aliases) — found in **6 of 8** community bots |
| `$httpPingms` | `$httpPing` (alias `$httpResponseTime`) |
| aoi's `$suppressErrors` | `$#fn`, `$try[code;catch;errVar]` |

Caution before declaring any name a ghost: check the **alias stubs** first (`$clientToken` looked absent from canonical lists but is a live alias of `$botToken` — that false alarm happened twice now), and check for a **private extension** (forge.quirks, Edge — see `ecosystem-judgment.md`).

## Runtime — arg gate

| Message | Meaning | Fix |
|---|---|---|
| `InvalidArgType <value> for argument <name>` (expected type X) | The resolver rejected the value for that type | See the type table in `../knowledge/core/arg-types.md`; snowflake/boolean/URL rules cover most cases |
| `MissingArg $x for argument <name>` | Required arg resolved to null/empty | Provide the arg; watch rest args — zero pieces + required = this error |

## Runtime — domain errors (customError family)

Extensions and many core functions use `this.customError("...")` with bespoke text. Decoding the common ones:

| Pattern | Source of truth |
|---|---|
| "Failed to fetch X" / empty after ID | `client.*.fetch` failed — ID right but entity gone, no permission, or cache miss (Guild args only see cached guilds) |
| Channel-type complaints ("not a text channel") | `TextChannel` arg got a non-messageable channel |
| Permission denials | Usually **not** an error — `notAllowed()` returns stop/empty silently |

**The silence trap:** half of all failure modes produce *no error string at all* (the `notAllowed`/`stop` pattern). "No output, no error" means: gate fired, permission missing, pointer missed, or negation prefix ate the output — in that order of likelihood (see `debugging-playbook.md`).

## What errors do downstream

- An unsilenced error **aborts the whole command** — anything after it (including output) never runs. If output vanished, find the first error, not the last function.
- `$#fn[...]` silences one call; execution continues with that function contributing nothing.
- `$try[code;catch;errVar]` catches, runs catch code, stores the message in env, continues after.

## Reading errors out of the interpreter

The console/log shows the ForgeError with the compiled display form `$fn[args...]` of the failing call — the *resolved* args in that display are what the resolver actually saw. If they look wrong (empty, wrong order, stringified arrays), the bug is upstream of the flagged function.

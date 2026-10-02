# Argument types — coercion rules from source

> Ground truth: `src/structures/@internal/CompiledFunction.ts` (`resolveArg` and the `resolve*` methods) plus `ArgType` in `src/structures/@internal/NativeFunction.ts`.

When a function has `unwrap: true`, every resolved argument string is passed through a type resolver *before* `execute()` gets it. If the resolver returns `undefined`, the call fails with `InvalidArgType`. If a **required** argument resolves to `null` (e.g. missing rest values), it fails with `MissingArg`.

## The two early exits (important!)

```ts
if (!arg.required && !value) return this.unsafeSuccess(value ?? null)
```

- An **optional argument left empty** short-circuits: no type check runs, the implementation receives `null`. Implementations then apply their own defaults.
- A **required** argument that is **absent** (no field at all) → `MissingArg` error. But a **present-yet-empty** field coerces instead: `Number("")` is `0` (so `$sum[;2]` → `2`), Boolean-typed empties fail with `InvalidArgType`. `MissingArg` only fires for absent fields.
- **`unwrap: false` functions never enforce required args at all** — `$if[true]` (missing its required branch arg) returns empty success.
- **Rest args**: required-rest with zero fields → `MissingArg`; optional-rest → empty array (beware `$arrayLoad[name;sep;""]` producing a phantom `[""]` element — split-on-empty yields one empty string, inflating `$arrayLength` by +1).

## Snowflake rule

All Discord-entity types share `IdRegex = /^(\d{16,23})$/`. The value must be **16–23 digits** — a pure numeric ID. Names, mentions (`<@...>`), and full URLs are rejected. Resolve entities first (lookup-category functions, `$channelID`, `$roleID`, ...).

## Per-type behavior

| Type | Resolver | Accepts | Rejects / quirks |
|---|---|---|---|
| `String` / `Unknown` | passthrough | any text after inner-function resolution | nothing |
| `Number` | `Number(str)` | `5`, `-3.5`, `1e3` | `NaN` results (`abc`, empty) |
| `BigInt` | `BigInt(str)` | integer strings | decimals like `1.5` throw |
| `Boolean` | strict equality | exactly `true` / `false` | **`yes`, `no`, `1`, `0`, `True` all rejected** |
| `URL` | `^http?s:\/\/` + emoji special-case | `https://...` or a custom emoji string (auto-converted to CDN URL) | **plain `http://` fails** (the regex literally requires the `s`) |
| `Json` | `parseJSON(str, false)` | JSON text | **never rejects** — invalid JSON returns the raw string as-is (verify with `$jsonHas` if it matters) |
| `Color` | `resolveColor(str)` | `#RRGGBB`, `RRGGBB`, decimal int, known names | **never rejects** — garbage yields `NaN` (parseInt) and passes through; implementations receive `NaN` |
| `Time` | number check → `TimeParser.parseToMS` | raw numbers (ms) or `45s`/`10m`/`1h30m`/`2d` | unparsable strings; **no `ms` unit** (a bare number IS ms); **decimals with a unit throw** (`1.5h` → error, use `90m`); `M` = **month (30d)** vs `m` = minute; `y` = 360d |
| `Date` | `new Date(...)` | ms timestamps or any `Date`-parsable string | `Invalid Date` slips through — implementations handle it |
| `Channel` | `client.channels.fetch(id)` | snowflake | non-snowflake; fetch failure |
| `TextChannel` | Channel + `messages` present | textable channel snowflakes | category/forum-without-messages channels |
| `User` | `client.users.fetch(id)` | snowflake | mentions |
| `Member` | pointer guild `.members.fetch(id)` | snowflake **+ a resolvable pointer guild/context guild** | DM contexts |
| `Role` | pointer guild `.roles.cache.get(id)` | snowflake in cached guild | roles of uncached guilds |
| `RoleOrUser` | Role first, then User | either snowflake | — |
| `Guild` | `client.guilds.cache.get(id)` | **cached** guild snowflakes | guilds the bot isn't in |
| `Message` | pointer channel `.messages.fetch(id)` | snowflake; needs a resolvable channel (pointer or context) | cross-channel fetches without pointer |
| `Emoji` | CDN URL regex → `parseEmoji` → guild emojis, then application emojis | `<:name:id>`, `<a:name:id>`, raw id, CDN URL | unknown emoji → `undefined` |
| `GuildEmoji` / `ApplicationEmoji` | same, scoped | one emoji scope only | — |
| `Sticker` | `client.fetchSticker(id or CDN URL)` | snowflake or CDN URL | — |
| `Invite` | `client.fetchInvite(str)` | snowflake-shaped **code** | full `discord.gg/...` URLs |
| `Webhook` | `client.fetchWebhook(id)` | snowflake | — |
| `Reaction` | `parseEmoji` + pointer message `.fetch().reactions.cache` | emoji on the pointer message | no pointer message |
| `Attachment` | URL → download; local path → `existsSync`; else raw text buffer | URL, existing path, or literal content | — |
| `Permission` | key of `PermissionFlagsBits` | `ManageMessages`, `BanMembers`, ... | `manage messages`, wrong casing |
| `OverwritePermission` | leading symbol + permission | `+Perm` (allow), `-Perm` (deny), `/Perm` (inherit) | missing symbol |
| `Enum` | `arg.enum[str]` | exact enum key | wrong key (usually `undefined` → InvalidArgType) |
| `ForumTag` | pointer channel `.availableTags` | tag snowflake | — |
| `AutomodRule` | pointer guild `autoModerationRules.fetch` | snowflake | — |
| `ScheduledEvent` | pointer guild `scheduledEvents.fetch` | snowflake | — |
| `StageInstance` | channel-based or guild cache | snowflake | — |
| `SoundboardSound` | pointer guild `soundboardSounds.fetch` | snowflake | — |
| `Template` | `client.fetchGuildTemplate(code)` | template code | — |

## Pointers — the hidden argument dependency

Types like `Member`, `Role`, `Message`, `Reaction`, `ForumTag`, `AutomodRule`, `ScheduledEvent`, `SoundboardSound`, `StageInstance`, `RoleOrUser` declare a `pointer` index: **"resolve me against previously resolved argument #N"** (falling back to the context's guild/channel/message). Practical consequence: argument order in the signature matters. Example: `$roleMembers[guildID;roleID]` — the role is looked up inside the guild resolved from argument 0. Reorder them and resolution breaks.

## Rest arguments

A `rest: true` argument swallows **all remaining `;`-separated fields** into a JS array:

- `$log[a;b;c]` → message = `["a","b","c"]`
- If zero fields are provided: required-rest → `MissingArg`; optional-rest → empty array.
- Rest args are always last (the compiler stops assigning fields once rest begins).

## Condition fields

Arguments with `condition: true` are parsed with operator awareness (see `core/forgescript-syntax.md`). Inner functions on both sides resolve before comparison; `==`/`!=` compare **stringified** results, `<`/`<=`/`>`/`>=` compare numerically, and a bare value is checked against `"true"`.

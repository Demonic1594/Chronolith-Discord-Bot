# $setGuildAFKTimeout

> Sets the AFK timeout for a guild, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v2.1.0 | required | yes | `Boolean` |

> aliases: $setServerAFKTimeout

## Signature

```fs
$setGuildAFKTimeout[guild ID;seconds;reason]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to set AFK timeout for |
| 2 | `seconds` | `Number` | **yes** | no | The new AFK timeout in seconds (60, 300, 900, 1800, 3600) |
| 3 | `reason` | `String` | no | no | The reason for this action |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to set AFK timeout for. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`seconds`** (`Number`, required): The new AFK timeout in seconds (60, 300, 900, 1800, 3600). Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`reason`** (`String`, optional): The reason for this action. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$setGuildAFKTimeout` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setGuildAFKTimeout[123456789012345678;5]
```

**Full form (all arguments)**

```fs
$setGuildAFKTimeout[123456789012345678;5;value]
```

## Reference implementation (source)

Taken from `src/native/guild/setGuildAFKTimeout.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success((await guild.setAFKTimeout(seconds, reason || ctx.reason).catch(() => false)) !== false)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$setServerAFKTimeout` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createGuild`]($createGuild.md)
- [`$createGuildTemplate`]($createGuildTemplate.md)
- [`$deleteGuild`]($deleteGuild.md)
- [`$deleteGuildApplicationCommands`]($deleteGuildApplicationCommands.md)
- [`$deleteGuildTemplate`]($deleteGuildTemplate.md)
- [`$editGuildTemplate`]($editGuildTemplate.md)
- [`$getGuildInvite`]($getGuildInvite.md)
- [`$getGuildPreview`]($getGuildPreview.md)

**Source:** [`src/native/guild/setGuildAFKTimeout.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/setGuildAFKTimeout.ts)

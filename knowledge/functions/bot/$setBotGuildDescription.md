# $setBotGuildDescription

> Sets the bot description on a guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `bot` | v2.6.0 | required | yes | `Boolean` |

> aliases: $setBotGuildBio, $setClientGuildBio, $setClientGuildDescription

## Signature

```fs
$setBotGuildDescription[guild ID;description]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to set description on |
| 2 | `description` | `String` | no | no | The new description |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to set description on. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`description`** (`String`, optional): The new description. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Bot functions expose the client itself — its user, settings, uptime, presence and similar self-inspection utilities.

`$setBotGuildDescription` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setBotGuildDescription[123456789012345678]
```

**Full form (all arguments)**

```fs
$setBotGuildDescription[123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/native/bot/setBotGuildDescription.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(!!(await guild.members.editMe({ bio }).catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$setBotGuildBio`, `$setClientGuildBio`, `$setClientGuildDescription` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`description`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$applicationCommandCount`]($applicationCommandCount.md)
- [`$applicationCommands`]($applicationCommands.md)
- [`$botCount`]($botCount.md)
- [`$botCustomInvite`]($botCustomInvite.md)
- [`$botDescription`]($botDescription.md)
- [`$botDestroy`]($botDestroy.md)
- [`$botID`]($botID.md)
- [`$botInvite`]($botInvite.md)

**Source:** [`src/native/bot/setBotGuildDescription.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/bot/setBotGuildDescription.ts)

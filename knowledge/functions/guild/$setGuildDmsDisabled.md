# $setGuildDmsDisabled

> Sets the guild's DMs activity disabled for a specific duration, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v2.6.0 | required | yes | `Boolean` |

> aliases: $setServerDmsDisabled

## Signature

```fs
$setGuildDmsDisabled[guild ID;duration]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to disable DMs for |
| 2 | `duration` | `Time` | no | no | The duration for disabling DMs, omit to enable DMs again |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to disable DMs for. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`duration`** (`Time`, optional): The duration for disabling DMs, omit to enable DMs again. Expects a duration. A raw number is used as milliseconds directly; otherwise parsed by `TimeParser` (`10m`, `1h30m`, `2d`, `45s`, ...).

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$setGuildDmsDisabled` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setGuildDmsDisabled[123456789012345678]
```

**Full form (all arguments)**

```fs
$setGuildDmsDisabled[123456789012345678;10m]
```

## Reference implementation (source)

Taken from `src/native/guild/setGuildDmsDisabled.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success((await guild.setIncidentActions({
            dmsDisabledUntil: ms ? Date.now() + ms : null,
            invitesDisabledUntil: guild.incidentsData?.invitesDisabledUntil
        }).catch(() => false)) !== false)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$setServerDmsDisabled` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`duration`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Time arguments accept either a raw number (milliseconds) or a duration string like `10m`, `1h30m`, `2d`.
6. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
7. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createGuild`]($createGuild.md)
- [`$createGuildTemplate`]($createGuildTemplate.md)
- [`$deleteGuild`]($deleteGuild.md)
- [`$deleteGuildApplicationCommands`]($deleteGuildApplicationCommands.md)
- [`$deleteGuildTemplate`]($deleteGuildTemplate.md)
- [`$editGuildTemplate`]($editGuildTemplate.md)
- [`$getGuildInvite`]($getGuildInvite.md)
- [`$getGuildPreview`]($getGuildPreview.md)

**Source:** [`src/native/guild/setGuildDmsDisabled.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/setGuildDmsDisabled.ts)

# $guildChannelCount

> Returns the server channel count

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v1.0.0 | optional | yes | `Number` |

> aliases: $serverChannelCount

## Signature

```fs
$guildChannelCount[guild ID;categories]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to get channels from |
| 2 | `categories` | `Enum` | no | yes | The categories to filter by |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to get channels from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`categories`** (`Enum` , rest, optional): The categories to filter by. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$guildChannelCount` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `categories` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$guildChannelCount[123456789012345678]
```

**Full form (all arguments)**

```fs
$guildChannelCount[123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/native/guild/guildChannelCount.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        guild ??= ctx.guild!
        return this.success(
            (this.hasFields ? categories.length === 0 ? guild.channels.cache : guild.channels.cache.filter((x) => categories.includes(x.type)) : guild.channels.cache)
                .size
        )
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$serverChannelCount` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createGuild`]($createGuild.md)
- [`$createGuildTemplate`]($createGuildTemplate.md)
- [`$deleteGuild`]($deleteGuild.md)
- [`$deleteGuildApplicationCommands`]($deleteGuildApplicationCommands.md)
- [`$deleteGuildTemplate`]($deleteGuildTemplate.md)
- [`$editGuildTemplate`]($editGuildTemplate.md)
- [`$getGuildInvite`]($getGuildInvite.md)
- [`$getGuildPreview`]($getGuildPreview.md)

**Source:** [`src/native/guild/guildChannelCount.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/guildChannelCount.ts)

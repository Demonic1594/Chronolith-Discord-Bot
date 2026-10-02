# $guildDmSpamDetectedAt

> Returns when a direct message spam was detected on a guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v2.2.0 | optional | yes | `Number` |

> aliases: $serverDmSpamDetectedAt

## Signature

```fs
$guildDmSpamDetectedAt[guild ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to retrieve the data |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to retrieve the data. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$guildDmSpamDetectedAt` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$guildDmSpamDetectedAt[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/guild/guildDmSpamDetectedAt.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success((guild ?? ctx.guild)?.incidentsData?.dmSpamDetectedAt?.getTime() ?? 0)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$serverDmSpamDetectedAt` — function names are case-insensitive.
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

**Source:** [`src/native/guild/guildDmSpamDetectedAt.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/guildDmSpamDetectedAt.ts)

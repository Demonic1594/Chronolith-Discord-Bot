# $guildMemberCount

> Returns the user count of a guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v1.0.0 | optional | yes | `Number` |

> aliases: $serverMemberCount, $serverMembersCount

## Signature

```fs
$guildMemberCount[guild ID;presence;count bots]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to retrieve member count from |
| 2 | `presence` | `Enum` | no | no | The presence of the users to count |
| 3 | `count bots` | `Boolean` | no | no | Whether to count bots |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to retrieve member count from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`presence`** (`Enum`, optional): The presence of the users to count. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`count bots`** (`Boolean`, optional): Whether to count bots. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$guildMemberCount` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$guildMemberCount[123456789012345678]
```

**Full form (all arguments)**

```fs
$guildMemberCount[123456789012345678;value;true]
```

## Reference implementation (source)

Taken from `src/native/guild/guildMemberCount.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        guild ??= ctx.guild!
        bots ??= true

        if (presence) {
            return this.success(guild?.members.cache.filter(member => {
                const status = member.presence?.status
                return (presence === PresenceStatus.offline ? status === "offline" || !status : status === presence) && (bots || !member.user.bot)
            }).size)
        }

        return this.success(bots ? guild?.memberCount : guild?.members.cache.filter(member => !member.user.bot).size)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$serverMemberCount`, `$serverMembersCount` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`presence`, `count bots`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
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

**Source:** [`src/native/guild/guildMemberCount.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/guildMemberCount.ts)

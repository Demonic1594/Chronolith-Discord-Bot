# $guildRoleIDs

> Returns every role id of the guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v1.3.0 | optional | yes | `Role[]` |

> aliases: $serverRoleIDs, $roleIDs

## Signature

```fs
$guildRoleIDs[guild ID;separator;everyone]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to get role ids from |
| 2 | `separator` | `String` | no | no | The separator to use for every role |
| 3 | `everyone` | `Boolean` | no | no | Whether to include the @everyone role, defaults to true |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to get role ids from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`separator`** (`String`, optional): The separator to use for every role. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`everyone`** (`Boolean`, optional): Whether to include the @everyone role, defaults to true. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$guildRoleIDs` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$guildRoleIDs[123456789012345678]
```

**Full form (all arguments)**

```fs
$guildRoleIDs[123456789012345678;,;true]
```

## Reference implementation (source)

Taken from `src/native/guild/guildRoleIDs.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            (guild ?? ctx.guild)?.roles.cache
                .filter((x) => everyone !== false || x.guild.id !== x.id)
                .map((x) => x.id)
                .join(sep ?? ", ")
        )
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$serverRoleIDs`, `$roleIDs` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`separator`, `everyone`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/guild/guildRoleIDs.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/guildRoleIDs.ts)

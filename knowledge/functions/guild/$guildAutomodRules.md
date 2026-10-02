# $guildAutomodRules

> Returns all automod rules of a guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v1.5.0 | optional | yes | `Json`, `Unknown[]` |

> aliases: $getAutomodRules

## Signature

```fs
$guildAutomodRules[guild ID;property;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to get automod rules from |
| 2 | `property` | `Enum` | no | no | The property of each automod rule to return |
| 3 | `separator` | `String` | no | no | The separator to use for each property |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to get automod rules from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`property`** (`Enum`, optional): The property of each automod rule to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`separator`** (`String`, optional): The separator to use for each property. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$guildAutomodRules` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$guildAutomodRules[123456789012345678]
```

**Full form (all arguments)**

```fs
$guildAutomodRules[123456789012345678;value;,]
```

## Reference implementation (source)

Taken from `src/native/guild/guildAutomodRules.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const rules = await (guild ?? ctx.guild)?.autoModerationRules?.fetch().catch(ctx.noop)

        if (rules && prop) {
            const data = rules.map(rule => AutomodRuleProperties[prop](rule, sep))
            return this.successJSON(data.every(item => typeof item === "object" && item !== null) ? data : data.join(sep ?? ", "))
        }

        return this.successJSON(rules)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$getAutomodRules` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`property`, `separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/guild/guildAutomodRules.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/guildAutomodRules.ts)

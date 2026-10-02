# $guildScheduledEvents

> Returns all scheduled events of a guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v2.6.0 | optional | yes | `Json`, `Unknown[]` |

## Signature

```fs
$guildScheduledEvents[guild ID;property;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to get scheduled events from |
| 2 | `property` | `Enum` | no | no | The property of the scheduled events to return |
| 3 | `separator` | `String` | no | no | The separator to use for each property |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to get scheduled events from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`property`** (`Enum`, optional): The property of the scheduled events to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`separator`** (`String`, optional): The separator to use for each property. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$guildScheduledEvents` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$guildScheduledEvents[123456789012345678]
```

**Full form (all arguments)**

```fs
$guildScheduledEvents[123456789012345678;value;,]
```

## Reference implementation (source)

Taken from `src/native/guild/guildScheduledEvents.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const events = await (guild ?? ctx.guild)?.scheduledEvents?.fetch().catch(ctx.noop)

        if (prop) return this.success(events?.map((x) => ScheduledEventProperties[prop](x)).join(sep ?? ", "))
        return this.successJSON(events)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`property`, `separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/guild/guildScheduledEvents.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/guildScheduledEvents.ts)

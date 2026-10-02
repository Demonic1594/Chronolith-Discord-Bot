# $setGuildDefaultMessageNotifications

> Sets the default message notifications setting for a guild, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v2.1.0 | required | yes | `Boolean` |

> aliases: $setServerDefaultMessageNotifications

## Signature

```fs
$setGuildDefaultMessageNotifications[guild ID;setting;reason]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to set default message notifications for |
| 2 | `setting` | `Enum` | no | no | The new default message notifications setting |
| 3 | `reason` | `String` | no | no | The reason for this action |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to set default message notifications for. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`setting`** (`Enum`, optional): The new default message notifications setting. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`reason`** (`String`, optional): The reason for this action. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$setGuildDefaultMessageNotifications` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setGuildDefaultMessageNotifications[123456789012345678]
```

**Full form (all arguments)**

```fs
$setGuildDefaultMessageNotifications[123456789012345678;value;value]
```

## Reference implementation (source)

Taken from `src/native/guild/setGuildDefaultMessageNotifications.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success((await guild.setDefaultMessageNotifications(setting || null, reason || ctx.reason).catch(() => false)) !== false)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$setServerDefaultMessageNotifications` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`setting`, `reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/guild/setGuildDefaultMessageNotifications.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/setGuildDefaultMessageNotifications.ts)

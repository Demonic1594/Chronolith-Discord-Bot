# $getGuildInvite

> Returns information about a guild invite

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v2.2.0 | required | yes | `Json`, `Unknown` |

## Signature

```fs
$getGuildInvite[guild ID;code;property]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to fetch invite from |
| 2 | `code` | `String` | **yes** | no | The invite code |
| 3 | `property` | `Enum` | no | no | The property of the invite to return |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to fetch invite from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`code`** (`String`, required): The invite code. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`property`** (`Enum`, optional): The property of the invite to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$getGuildInvite` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getGuildInvite[123456789012345678;code]
```

**Full form (all arguments)**

```fs
$getGuildInvite[123456789012345678;code;value]
```

## Reference implementation (source)

Taken from `src/native/guild/getGuildInvite.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const invite = await guild.invites.fetch(code).catch(ctx.noop)
        if (prop && invite) return this.success(InviteProperties[prop](invite))
        return this.successJSON(invite)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`property`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createGuild`]($createGuild.md)
- [`$createGuildTemplate`]($createGuildTemplate.md)
- [`$deleteGuild`]($deleteGuild.md)
- [`$deleteGuildApplicationCommands`]($deleteGuildApplicationCommands.md)
- [`$deleteGuildTemplate`]($deleteGuildTemplate.md)
- [`$editGuildTemplate`]($editGuildTemplate.md)
- [`$getGuildPreview`]($getGuildPreview.md)
- [`$getGuildTemplate`]($getGuildTemplate.md)

**Source:** [`src/native/guild/getGuildInvite.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/getGuildInvite.ts)

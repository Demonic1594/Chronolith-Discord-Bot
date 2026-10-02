# $isBanned

> Returns whether this user is banned

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `member` | v1.0.0 | required | yes | `Boolean` |

> aliases: $memberIsBanned

## Signature

```fs
$isBanned[guild ID;user ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to check bans on |
| 2 | `user ID` | `User` | **yes** | no | The user to check ban status for |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to check bans on. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`user ID`** (`User`, required): The user to check ban status for. Expects a user ID. Must be a 16-23 digit snowflake; fetched via `client.users.fetch`.

## How it works

Member functions operate on guild members — roles, timeouts, moderation actions, voice state, properties.

`$isBanned` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$isBanned[123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/member/isBanned.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const isBanned = await guild.bans.fetch(user).catch(() => false)
        return this.success(!!isBanned)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$memberIsBanned` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$ban`]($ban.md)
- [`$fetchMembers`]($fetchMembers.md)
- [`$hasAnyPerms`]($hasAnyPerms.md)
- [`$hasAnyRole`]($hasAnyRole.md)
- [`$hasPerms`]($hasPerms.md)
- [`$hasRoles`]($hasRoles.md)
- [`$isBannable`]($isBannable.md)
- [`$isBoosting`]($isBoosting.md)

**Source:** [`src/native/member/isBanned.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/member/isBanned.ts)

# $unban

> Unbans a user from a guild, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `member` | v1.0.0 | required | yes | `Boolean` |

> aliases: $memberUnban, $unbanMember

## Signature

```fs
$unban[guild ID;user ID;reason]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to unban user from |
| 2 | `user ID` | `User` | **yes** | no | The user to unban |
| 3 | `reason` | `String` | no | no | The unban reason |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to unban user from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`user ID`** (`User`, required): The user to unban. Expects a user ID. Must be a 16-23 digit snowflake; fetched via `client.users.fetch`.
- **`reason`** (`String`, optional): The unban reason. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Member functions operate on guild members — roles, timeouts, moderation actions, voice state, properties.

`$unban` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$unban[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$unban[123456789012345678;123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/native/member/unban.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const unbanned = await guild.bans.remove(user, reason || ctx.reason).catch(ctx.noop)
        return this.success(!!unbanned)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$memberUnban`, `$unbanMember` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$ban`]($ban.md)
- [`$fetchMembers`]($fetchMembers.md)
- [`$hasAnyPerms`]($hasAnyPerms.md)
- [`$hasAnyRole`]($hasAnyRole.md)
- [`$hasPerms`]($hasPerms.md)
- [`$hasRoles`]($hasRoles.md)
- [`$isBannable`]($isBannable.md)
- [`$isBanned`]($isBanned.md)

**Source:** [`src/native/member/unban.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/member/unban.ts)

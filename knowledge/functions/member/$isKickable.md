# $isKickable

> Returns whether a member is kickable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `member` | v2.7.0 | optional | yes | `Boolean` |

> aliases: $memberIsKickable

## Signature

```fs
$isKickable[guild ID;user ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to pull the member from |
| 2 | `user ID` | `Member` | **yes** | no | The member to check for |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to pull the member from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`user ID`** (`Member`, required): The member to check for. Expects a member ID. Fetched from the guild resolved by the `pointer` argument (usually a leading guild/channel arg) or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Member functions operate on guild members — roles, timeouts, moderation actions, voice state, properties.

`$isKickable` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$isKickable[123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/member/isKickable.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        member ??= ctx.member!
        return this.success(member?.kickable ?? false)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$memberIsKickable` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
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
- [`$isBanned`]($isBanned.md)

**Source:** [`src/native/member/isKickable.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/member/isKickable.ts)

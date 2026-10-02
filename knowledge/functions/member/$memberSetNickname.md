# $memberSetNickname

> Edits a member's nickname, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `member` | v1.0.7 | required | yes | `Boolean` |

## Signature

```fs
$memberSetNickname[guild ID;user ID;nickname]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to pull member from |
| 2 | `user ID` | `Member` | **yes** | no | The member to edit its nickname |
| 3 | `nickname` | `String` | no | no | The new nickname, leave empty to reset |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to pull member from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`user ID`** (`Member`, required): The member to edit its nickname. Expects a member ID. Fetched from the guild resolved by the `pointer` argument (usually a leading guild/channel arg) or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`nickname`** (`String`, optional): The new nickname, leave empty to reset. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Member functions operate on guild members — roles, timeouts, moderation actions, voice state, properties.

`$memberSetNickname` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$memberSetNickname[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$memberSetNickname[123456789012345678;123456789012345678;name]
```

## Reference implementation (source)

Taken from `src/native/member/memberSetNickname.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const edit = m.id === ctx.client.user.id
            ? g.members.editMe({ nick, reason: ctx.reason })
            : m.setNickname(nick, ctx.reason)

        return this.success(!!(await edit.catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`nickname`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/member/memberSetNickname.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/member/memberSetNickname.ts)

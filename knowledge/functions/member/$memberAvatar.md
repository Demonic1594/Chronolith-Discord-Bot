# $memberAvatar

> Returns the member avatar

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `member` | v1.0.0 | optional | yes | `URL` |

## Signature

```fs
$memberAvatar[guild ID;user ID;size;extension]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to pull member from |
| 2 | `user ID` | `Member` | **yes** | no | The user to retrieve the avatar |
| 3 | `size` | `Number` | no | no | The size to use for the image |
| 4 | `extension` | `String` | no | no | The extension to use for the image |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to pull member from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`user ID`** (`Member`, required): The user to retrieve the avatar. Expects a member ID. Fetched from the guild resolved by the `pointer` argument (usually a leading guild/channel arg) or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`size`** (`Number`, optional): The size to use for the image. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`extension`** (`String`, optional): The extension to use for the image. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Member functions operate on guild members — roles, timeouts, moderation actions, voice state, properties.

`$memberAvatar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$memberAvatar[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$memberAvatar[123456789012345678;123456789012345678;5;value]
```

## Reference implementation (source)

Taken from `src/native/member/memberAvatar.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const member = user ?? ctx.member ?? ctx.interaction?.member

        if (member.avatar) {
            return this.success(new CDN().guildMemberAvatar(guild?.id ?? ctx.guild?.id ?? ctx.interaction?.guildId, member.user.id, member.avatar, {
                extension: (ext as ImageExtension) || undefined,
                size: (size as ImageSize) || 2048,
            }))
        }

        return this.success(member.user.avatar
            ? new CDN().avatar(member.user.id, member.user.avatar, {
                extension: (ext as ImageExtension) || undefined,
                size: (size as ImageSize) || 2048,
            })
            : (member instanceof GuildMember ? member.user.defaultAvatarURL : null)
        )
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`size`, `extension`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/member/memberAvatar.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/member/memberAvatar.ts)

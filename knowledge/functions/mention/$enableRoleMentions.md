# $enableRoleMentions

> Only parses these roles for mentions

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `mention` | v1.3.0 | optional | yes | — |

## Signature

```fs
$enableRoleMentions[guild ID;roles]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to retrieve roles from |
| 2 | `roles` | `Role` | **yes** | yes | The roles to parse mentions for |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to retrieve roles from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`roles`** (`Role` , rest, required): The roles to parse mentions for. Expects a role ID. Looked up in the guild resolved by the `pointer` argument or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Mention functions build mention strings (users, roles, channels, timestamps `<t:...>`).

`$enableRoleMentions` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `roles` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$enableRoleMentions[123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/mention/enableRoleMentions.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (this.hasFields) ctx.container.allowedMentions.roles = roles.map(x => x.id)
        else ctx.container.parseMentions("roles")
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$disableAllMentions`]($disableAllMentions.md)
- [`$disableEveryoneMention`]($disableEveryoneMention.md)
- [`$disableRoleMentions`]($disableRoleMentions.md)
- [`$disableUserMentions`]($disableUserMentions.md)
- [`$enableAllMentions`]($enableAllMentions.md)
- [`$enableUserMentions`]($enableUserMentions.md)
- [`$isChannelMentioned`]($isChannelMentioned.md)
- [`$isRoleMentioned`]($isRoleMentioned.md)

**Source:** [`src/native/mention/enableRoleMentions.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/mention/enableRoleMentions.ts)

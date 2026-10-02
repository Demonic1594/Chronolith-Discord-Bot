# $enableUserMentions

> Only parses these users for mentions

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `mention` | v1.3.0 | optional | yes | — |

## Signature

```fs
$enableUserMentions[users]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `users` | `User` | **yes** | yes | The users to parse mentions for |

### Per-parameter notes

- **`users`** (`User` , rest, required): The users to parse mentions for. Expects a user ID. Must be a 16-23 digit snowflake; fetched via `client.users.fetch`.

## How it works

Mention functions build mention strings (users, roles, channels, timestamps `<t:...>`).

`$enableUserMentions` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `users` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$enableUserMentions[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/mention/enableUserMentions.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (this.hasFields) ctx.container.allowedMentions.users = users.map(x => x.id)
        else ctx.container.parseMentions("users")
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
- [`$enableRoleMentions`]($enableRoleMentions.md)
- [`$isChannelMentioned`]($isChannelMentioned.md)
- [`$isRoleMentioned`]($isRoleMentioned.md)

**Source:** [`src/native/mention/enableUserMentions.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/mention/enableUserMentions.ts)

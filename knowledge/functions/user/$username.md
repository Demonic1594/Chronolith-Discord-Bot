# $username

> Returns the username of a user

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `user` | v1.0.0 | optional | yes | `String` |

## Signature

```fs
$username[id]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `id` | `User` | no | no | The user id to get the username of |

### Per-parameter notes

- **`id`** (`User`, optional): The user id to get the username of. Expects a user ID. Must be a 16-23 digit snowflake; fetched via `client.users.fetch`.

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$username` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**By ID**

```fs
$username[123456789012345678]
```

**Current author**

```fs
$username[$authorID]
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`id`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$authorID`]($authorID.md)
- [`$deleteDM`]($deleteDM.md)
- [`$discriminator`]($discriminator.md)
- [`$isBot`]($isBot.md)
- [`$isBotVerified`]($isBotVerified.md)
- [`$isUserDMEnabled`]($isUserDMEnabled.md)
- [`$randomUserID`]($randomUserID.md)
- [`$sendDM`]($sendDM.md)

## Community guides covering this function

- [$username guide](../../guides/guide-165.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-165)

**Source:** [`src/native/user/username.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/user/username.ts)

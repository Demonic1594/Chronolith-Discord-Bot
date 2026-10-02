# $userBadges

> Returns the public badges of a user

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `user` | v1.0.0 | optional | yes | `UserFlags[]` |

> aliases: $userFlags

## Signature

```fs
$userBadges[user ID;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `user ID` | `User` | **yes** | no | The user to return its badges |
| 2 | `separator` | `String` | no | no | The separator to use for every badge |

### Per-parameter notes

- **`user ID`** (`User`, required): The user to return its badges. Expects a user ID. Must be a 16-23 digit snowflake; fetched via `client.users.fetch`.
- **`separator`** (`String`, optional): The separator to use for every badge. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$userBadges` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$userBadges[123456789012345678]
```

**Full form (all arguments)**

```fs
$userBadges[123456789012345678;,]
```

## Reference implementation (source)

Taken from `src/native/user/userBadges.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success((user ?? ctx.user)?.flags?.toArray().join(sep ?? ", "))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$userFlags` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$authorID`]($authorID.md)
- [`$deleteDM`]($deleteDM.md)
- [`$discriminator`]($discriminator.md)
- [`$isBot`]($isBot.md)
- [`$isBotVerified`]($isBotVerified.md)
- [`$isUserDMEnabled`]($isUserDMEnabled.md)
- [`$randomUserID`]($randomUserID.md)
- [`$sendDM`]($sendDM.md)

**Source:** [`src/native/user/userBadges.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/user/userBadges.ts)

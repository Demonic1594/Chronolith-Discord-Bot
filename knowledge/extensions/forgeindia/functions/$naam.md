# $naam

> Retrieves a user's username

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `user` | v1.0.0 | optional | yes | `String` |

> aliases: $naamOfUser, $uname, $usernaam

## Signature

```fs
$naam[id]
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

`$naam` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$naam[123456789012345678]
```

## Quirks & gotchas

1. Callable by its aliases too: `$naamOfUser`, `$uname`, `$usernaam` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`id`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$kyaBotHai`]($kyaBotHai.md)
- [`$koiBhiID`]($koiBhiID.md)
- [`$dmBhej`]($dmBhej.md)
- [`$userKiPhoto`]($userKiPhoto.md)
- [`$userKaBanner`]($userKaBanner.md)
- [`$userKitneHain`]($userKitneHain.md)
- [`$userKabBana`]($userKabBana.md)
- [`$userHaiKya`]($userHaiKya.md)

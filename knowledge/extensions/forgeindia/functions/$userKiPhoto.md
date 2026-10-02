# $userKiPhoto

> Returns the user avatar

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `user` | v1.0.0 | optional | yes | `URL` |

> aliases: $userKaChehra, $userKiShakal

## Signature

```fs
$userKiPhoto[user ID;size;extension]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `user ID` | `User` | **yes** | no | The user to retrieve the avatar |
| 2 | `size` | `Number` | no | no | The size to use for the image |
| 3 | `extension` | `String` | no | no | The extension to use for the image |

### Per-parameter notes

- **`user ID`** (`User`, required): The user to retrieve the avatar. Expects a user ID. Must be a 16-23 digit snowflake; fetched via `client.users.fetch`.
- **`size`** (`Number`, optional): The size to use for the image. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`extension`** (`String`, optional): The extension to use for the image. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$userKiPhoto` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$userKiPhoto[123456789012345678]
```

**Full form (all arguments)**

```fs
$userKiPhoto[123456789012345678;5;value]
```

## Quirks & gotchas

1. Callable by its aliases too: `$userKaChehra`, `$userKiShakal` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`size`, `extension`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$kyaBotHai`]($kyaBotHai.md)
- [`$koiBhiID`]($koiBhiID.md)
- [`$dmBhej`]($dmBhej.md)
- [`$userKaBanner`]($userKaBanner.md)
- [`$userKitneHain`]($userKitneHain.md)
- [`$userKabBana`]($userKabBana.md)
- [`$userHaiKya`]($userHaiKya.md)
- [`$sabkeSamneNaam`]($sabkeSamneNaam.md)

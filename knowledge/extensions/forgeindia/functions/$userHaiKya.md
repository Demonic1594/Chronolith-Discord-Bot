# $userHaiKya

> Returns whether a user id exists

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `user` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$userHaiKya[user ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `user ID` | `String` | **yes** | no | The user to check |

### Per-parameter notes

- **`user ID`** (`String`, required): The user to check. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$userHaiKya` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$userHaiKya[123456789012345678]
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$kyaBotHai`]($kyaBotHai.md)
- [`$koiBhiID`]($koiBhiID.md)
- [`$dmBhej`]($dmBhej.md)
- [`$userKiPhoto`]($userKiPhoto.md)
- [`$userKaBanner`]($userKaBanner.md)
- [`$userKitneHain`]($userKitneHain.md)
- [`$userKabBana`]($userKabBana.md)
- [`$sabkeSamneNaam`]($sabkeSamneNaam.md)

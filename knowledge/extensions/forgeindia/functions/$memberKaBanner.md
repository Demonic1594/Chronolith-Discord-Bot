# $memberKaBanner

> Returns the member banner

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `member` | v2.1.0 | optional | yes | `URL` |

## Signature

```fs
$memberKaBanner[guild ID;user ID;size;extension]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to pull member from |
| 2 | `user ID` | `Member` | **yes** | no | The user to retrieve the banner |
| 3 | `size` | `Number` | no | no | The size to use for the image |
| 4 | `extension` | `String` | no | no | The extension to use for the image |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to pull member from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`user ID`** (`Member`, required): The user to retrieve the banner. Expects a member ID. Fetched from the guild resolved by the `pointer` argument (usually a leading guild/channel arg) or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`size`** (`Number`, optional): The size to use for the image. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`extension`** (`String`, optional): The extension to use for the image. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Member functions operate on guild members — roles, timeouts, moderation actions, voice state, properties.

`$memberKaBanner` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$memberKaBanner[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$memberKaBanner[123456789012345678;123456789012345678;5;value]
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`size`, `extension`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$nikalBahar`]($nikalBahar.md)
- [`$iskePaasKuchPermsHai`]($iskePaasKuchPermsHai.md)
- [`$iskePaasPermsHai`]($iskePaasPermsHai.md)
- [`$bannedHaiKya`]($bannedHaiKya.md)
- [`$laatMar`]($laatMar.md)
- [`$memberKiPhoto`]($memberKiPhoto.md)
- [`$memberKaRangDikhao`]($memberKaRangDikhao.md)
- [`$memberKaNaamDikhao`]($memberKaNaamDikhao.md)

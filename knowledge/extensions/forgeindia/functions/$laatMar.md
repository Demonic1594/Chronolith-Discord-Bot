# $laatMar

> Kicks a member from the guild, returns true or false depending on whether the action was successfully performed

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `member` | v1.0.0 | required | yes | `Boolean` |

> aliases: $kickKaro, $memberKickKaro

## Signature

```fs
$laatMar[guild ID;user ID;reason]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to kick a member from |
| 2 | `user ID` | `Member` | **yes** | no | The user to kick |
| 3 | `reason` | `String` | no | no | The reason to kick for |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to kick a member from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`user ID`** (`Member`, required): The user to kick. Expects a member ID. Fetched from the guild resolved by the `pointer` argument (usually a leading guild/channel arg) or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`reason`** (`String`, optional): The reason to kick for. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Member functions operate on guild members — roles, timeouts, moderation actions, voice state, properties.

`$laatMar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$laatMar[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$laatMar[123456789012345678;123456789012345678;value]
```

## Quirks & gotchas

1. Callable by its aliases too: `$kickKaro`, `$memberKickKaro` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$nikalBahar`]($nikalBahar.md)
- [`$iskePaasKuchPermsHai`]($iskePaasKuchPermsHai.md)
- [`$iskePaasPermsHai`]($iskePaasPermsHai.md)
- [`$bannedHaiKya`]($bannedHaiKya.md)
- [`$memberKiPhoto`]($memberKiPhoto.md)
- [`$memberKaBanner`]($memberKaBanner.md)
- [`$memberKaRangDikhao`]($memberKaRangDikhao.md)
- [`$memberKaNaamDikhao`]($memberKaNaamDikhao.md)

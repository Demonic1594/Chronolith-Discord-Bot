# $botKeBaapKaID

> Returns the bot's owner id or team members

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `bot` | v1.0.0 | optional | yes | `User[]` |

> aliases: $botKaMaalik

## Signature

```fs
$botKeBaapKaID[return members;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `return members` | `Boolean` | no | no | Whether to return all members |
| 2 | `separator` | `String` | no | no | The separator to use for every id |

### Per-parameter notes

- **`return members`** (`Boolean`, optional): Whether to return all members. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`separator`** (`String`, optional): The separator to use for every id. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Bot functions expose the client itself — its user, settings, uptime, presence and similar self-inspection utilities.

`$botKeBaapKaID` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$botKeBaapKaID[true]
```

**Full form (all arguments)**

```fs
$botKeBaapKaID[true;,]
```

## Quirks & gotchas

1. Callable by its aliases too: `$botKaMaalik` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`return members`, `separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$botKitneHain`]($botKitneHain.md)
- [`$botKaDesc`]($botKaDesc.md)
- [`$botUdaao`]($botUdaao.md)
- [`$botKaID`]($botKaID.md)
- [`$botBulawo`]($botBulawo.md)
- [`$latencyCheckKaro`]($latencyCheckKaro.md)
- [`$botKiPhotoLgao`]($botKiPhotoLgao.md)
- [`$botBannerSetKaro`]($botBannerSetKaro.md)

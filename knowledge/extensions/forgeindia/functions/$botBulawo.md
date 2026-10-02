# $botBulawo

> Returns a bot's invite link

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `bot` | v1.0.0 | optional | yes | `URL` |

> aliases: $botKaInvite, $botKoBulawo

## Signature

```fs
$botBulawo[perms]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `perms` | `String` | **yes** | yes | The perms for the invite link |

### Per-parameter notes

- **`perms`** (`String` , rest, required): The perms for the invite link. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Bot functions expose the client itself — its user, settings, uptime, presence and similar self-inspection utilities.

`$botBulawo` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `perms` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$botBulawo[value]
```

## Quirks & gotchas

1. Callable by its aliases too: `$botKaInvite`, `$botKoBulawo` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$botKitneHain`]($botKitneHain.md)
- [`$botKaDesc`]($botKaDesc.md)
- [`$botUdaao`]($botUdaao.md)
- [`$botKaID`]($botKaID.md)
- [`$botKeBaapKaID`]($botKeBaapKaID.md)
- [`$latencyCheckKaro`]($latencyCheckKaro.md)
- [`$botKiPhotoLgao`]($botKiPhotoLgao.md)
- [`$botBannerSetKaro`]($botBannerSetKaro.md)

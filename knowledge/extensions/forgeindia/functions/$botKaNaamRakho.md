# $botKaNaamRakho

> Sets the bot name

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `bot` | v1.0.0 | required | yes | `Boolean` |

> aliases: $botKoNaamDo, $naamSetKaro

## Signature

```fs
$botKaNaamRakho[name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The new name |

### Per-parameter notes

- **`name`** (`String`, required): The new name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Bot functions expose the client itself — its user, settings, uptime, presence and similar self-inspection utilities.

`$botKaNaamRakho` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$botKaNaamRakho[name]
```

## Quirks & gotchas

1. Callable by its aliases too: `$botKoNaamDo`, `$naamSetKaro` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$botKitneHain`]($botKitneHain.md)
- [`$botKaDesc`]($botKaDesc.md)
- [`$botUdaao`]($botUdaao.md)
- [`$botKaID`]($botKaID.md)
- [`$botBulawo`]($botBulawo.md)
- [`$botKeBaapKaID`]($botKeBaapKaID.md)
- [`$latencyCheckKaro`]($latencyCheckKaro.md)
- [`$botKiPhotoLgao`]($botKiPhotoLgao.md)

# $badaText

> Makes a string uppercase

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `string` | v1.0.0 | required | yes | `String` |

> aliases: $textBadaKaro, $uppercaseKaro

## Signature

```fs
$badaText[string]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `string` | `String` | **yes** | yes | The string to turn uppercase |

### Per-parameter notes

- **`string`** (`String` , rest, required): The string to turn uppercase. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

String functions transform and inspect text (slicing, casing, search, split/join).

`$badaText` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `string` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$badaText[value]
```

## Quirks & gotchas

1. Callable by its aliases too: `$textBadaKaro`, `$uppercaseKaro` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$haiKya`]($haiKya.md)
- [`$kuchBhi`]($kuchBhi.md)
- [`$textUlatDo`]($textUlatDo.md)
- [`$chhotaText`]($chhotaText.md)
- [`$naamJaisaText`]($naamJaisaText.md)

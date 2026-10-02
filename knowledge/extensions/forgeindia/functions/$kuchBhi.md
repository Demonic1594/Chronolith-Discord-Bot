# $kuchBhi

> Returns a random text (no cache)

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `string` | v1.0.0 | required | yes | `String` |

> aliases: $faltuText, $kuchBhiText, $randomBol, $randomLikhai, $rigged

## Signature

```fs
$kuchBhi[texts]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `texts` | `String` | **yes** | yes | The texts to use |

### Per-parameter notes

- **`texts`** (`String` , rest, required): The texts to use. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

String functions transform and inspect text (slicing, casing, search, split/join).

`$kuchBhi` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `texts` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$kuchBhi[Hello!]
```

## Quirks & gotchas

1. Callable by its aliases too: `$faltuText`, `$kuchBhiText`, `$randomBol`, `$randomLikhai`, `$rigged` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$haiKya`]($haiKya.md)
- [`$textUlatDo`]($textUlatDo.md)
- [`$chhotaText`]($chhotaText.md)
- [`$naamJaisaText`]($naamJaisaText.md)
- [`$badaText`]($badaText.md)

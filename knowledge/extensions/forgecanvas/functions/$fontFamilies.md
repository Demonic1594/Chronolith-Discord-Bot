# $fontFamilies

> Returns a list of the available fonts

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `text` | v1.0.0 | optional | yes | — |

> aliases: $fontFam, $fonts, $fontNames

## Signature

```fs
$fontFamilies[separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `separator` | `String` | no | no | The font separator |

### Per-parameter notes

- **`separator`** (`String`, optional): The font separator. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$fontFamilies` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$fontFamilies[,]
```

## Reference implementation (source)

Taken from `src/functions/text/fontFamilies.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(GlobalFonts.families
            .map(x => x?.family)
            .join(sep ?? ', '));
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$fontFam`, `$fonts`, `$fontNames` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$fontVariantCaps`]($fontVariantCaps.md)
- [`$letterSpacing`]($letterSpacing.md)
- [`$measureText`]($measureText.md)
- [`$registerFont`]($registerFont.md)
- [`$textAlign`]($textAlign.md)
- [`$textBaseline`]($textBaseline.md)
- [`$wordSpacing`]($wordSpacing.md)

**Source:** [`src/functions/text/fontFamilies.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/text/fontFamilies.ts)

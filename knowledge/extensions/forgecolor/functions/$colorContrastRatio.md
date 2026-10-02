# $colorContrastRatio

> Calculates the WCAG contrast ratio between two colors (1.0–21.0). Higher = more contrast.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `utility` | v1.0.2 | required | yes | `Number` |

> aliases: $contrastRatio

## Signature

```fs
$colorContrastRatio[color1;color2]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color1` | `String` | **yes** | no | First color. |
| 2 | `color2` | `String` | **yes** | no | Second color. |

### Per-parameter notes

- **`color1`** (`String`, required): First color.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`color2`** (`String`, required): Second color.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$colorContrastRatio` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$colorContrastRatio[#5865F2;#5865F2]
```

## Reference implementation (source)

Taken from `src/functions/utility/colorContrastRatio.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      const rgb1 = parseColor(
        ColorConverter.convert(clr1, ColorFormat.rgb) ?? "",
        ColorFormat.rgb,
      );
      if (!rgb1) {
        return this.customError(
          `Could not convert "${clr1}" to RGB — make sure it is a valid color.`,
        );
      }

      const rgb2 = parseColor(
        ColorConverter.convert(clr2, ColorFormat.rgb) ?? "",
        ColorFormat.rgb,
      );
      if (!rgb2) {
        return this.customError(
          `Could not convert "${clr2}" to RGB — make sure it is a valid color.`,
        );
      }
      const ratio = contrastRatio(rgb1, rgb2);
      return this.success(ratio);
    } catch (err) {
      return this.customError(
        `An error occurred while calculating contrast ratio: ${(err as Error).message}`,
      );
    }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$contrastRatio` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorDistance`]($colorDistance.md)
- [`$colorFormatType`]($colorFormatType.md)
- [`$colorTemperature`]($colorTemperature.md)
- [`$findClosestColorName`]($findClosestColorName.md)
- [`$getColorChannel`]($getColorChannel.md)
- [`$getColorFromName`]($getColorFromName.md)
- [`$isDarkColor`]($isDarkColor.md)
- [`$isLightColor`]($isLightColor.md)

**Source:** [`src/functions/utility/colorContrastRatio.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/utility/colorContrastRatio.ts)

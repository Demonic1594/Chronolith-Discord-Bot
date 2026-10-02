# $prettifyColor

> Returns a cleaner, standardized version of the given color string.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `utility` | v1.0.0 | required | yes | `String` |

> aliases: $formatColor, $normalizeColor

## Signature

```fs
$prettifyColor[color]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color` | `String` | **yes** | no | The color string to prettify. |

### Per-parameter notes

- **`color`** (`String`, required): The color string to prettify.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$prettifyColor` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$prettifyColor[#5865F2]
```

## Reference implementation (source)

Taken from `src/functions/utility/prettifyColor.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      const format = detectColorFormat(color);

      if (!format) {
        return this.customError(
          `Could not detect color format for "${color}". Make sure it is a valid hex, rgb, rgba, hsl, or cmyk code.`,
        );
      }

      const result = ColorConverter.convert(color, format);

      if (!result) {
        return this.customError(
          `Could not prettify the color. Conversion to "${format}" failed.`,
        );
      }

      return this.success(result);
    } catch (err) {
      return this.customError(
        `An error occurred while prettifying the color: ${(err as Error).message}`,
      );
    }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$formatColor`, `$normalizeColor` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorContrastRatio`]($colorContrastRatio.md)
- [`$colorDistance`]($colorDistance.md)
- [`$colorFormatType`]($colorFormatType.md)
- [`$colorTemperature`]($colorTemperature.md)
- [`$findClosestColorName`]($findClosestColorName.md)
- [`$getColorChannel`]($getColorChannel.md)
- [`$getColorFromName`]($getColorFromName.md)
- [`$isDarkColor`]($isDarkColor.md)

**Source:** [`src/functions/utility/prettifyColor.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/utility/prettifyColor.ts)

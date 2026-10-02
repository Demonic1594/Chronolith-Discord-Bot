# $invertColor

> Inverts a color's RGB channels and returns an new inverted color.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `manipulation` | v1.0.0 | required | yes | `String` |

> aliases: $colorInvert, $inverseColor

## Signature

```fs
$invertColor[color]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color` | `String` | **yes** | no | The color to invert. |

### Per-parameter notes

- **`color`** (`String`, required): The color to invert.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$invertColor` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$invertColor[#5865F2]
```

## Reference implementation (source)

Taken from `src/functions/manipulation/invertColor.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      const originalFormat = detectColorFormat(color);
      if (!originalFormat) {
        return this.customError(
          `Could not detect color format for "${color}".`,
        );
      }

      const rgbConverted = ColorConverter.convert(color, ColorFormat.rgb);
      if (!rgbConverted) {
        return this.customError(`Failed to convert color to RGB.`);
      }

      const parsed = parseColor(rgbConverted, ColorFormat.rgb);
      if (!parsed || parsed.format !== ColorFormat.rgb) {
        return this.customError(`Failed to parse color as RGB.`);
      }

      // RGB channel-wise inversion
      let invertedRGB = `rgb(${255 - parsed.r}, ${255 - parsed.g}, ${255 - parsed.b})`;
      const finalColor = ColorConverter.convert(invertedRGB, originalFormat);
      if (!finalColor) {
        return this.customError(
          `Failed to convert inverted color back to "${originalFormat}".`,
        );
      }

      return this.success(finalColor);
    } catch (err) {
      return this.customError(
        `Error while inverting color: ${(err as Error).message}`,
      );
    }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$colorInvert`, `$inverseColor` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$shade`]($shade.md)
- [`$tint`]($tint.md)

**Source:** [`src/functions/manipulation/invertColor.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/manipulation/invertColor.ts)

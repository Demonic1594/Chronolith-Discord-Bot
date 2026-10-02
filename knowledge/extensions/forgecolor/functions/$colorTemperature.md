# $colorTemperature

> Estimates the color temperature (Kelvin) from a given color.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `utility` | v1.0.2 | required | yes | `String` |

> aliases: $temperatureFromColor, $colorToTemperature, $colorTemp

## Signature

```fs
$colorTemperature[color;returnKelvin]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color` | `String` | **yes** | no | The input color. |
| 2 | `returnKelvin` | `Boolean` | no | no | If true, return the approximate Kelvin instead of warm/cool/neutral classification. |

### Per-parameter notes

- **`color`** (`String`, required): The input color.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`returnKelvin`** (`Boolean`, optional): If true, return the approximate Kelvin instead of warm/cool/neutral classification.. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

See the function list below for exact signatures.

`$colorTemperature` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$colorTemperature[#5865F2]
```

**Full form (all arguments)**

```fs
$colorTemperature[#5865F2;true]
```

## Reference implementation (source)

Taken from `src/functions/utility/colorTemperature.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      // Convert to RGB string
      const rgbStr = ColorConverter.convert(color, ColorFormat.rgb);
      if (!rgbStr) {
        return this.customError(`Could not convert "${color}" to RGB.`);
      }

      // Parse into RGB values
      const parsed = parseColor(rgbStr, ColorFormat.rgb);
      if (!parsed || parsed.format !== ColorFormat.rgb) {
        return this.customError(`Failed to parse "${color}" as RGB.`);
      }

      // Compute temperature
      const { category, kelvin } = rgbTemperature({
        r: parsed.r,
        g: parsed.g,
        b: parsed.b,
      });

      // Return based on flag
      if (returnKelvin) {
        if (!kelvin) {
          return this.customError(`Could not estimate Kelvin for "${color}".`);
        }
        return this.success(kelvin);
      } else {
        return this.success(category);
      }
    } catch (err) {
      return this.customError(
        `An error occurred while estimating color temperature: ${(err as Error).message}`,
      );
    }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$temperatureFromColor`, `$colorToTemperature`, `$colorTemp` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`returnKelvin`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorContrastRatio`]($colorContrastRatio.md)
- [`$colorDistance`]($colorDistance.md)
- [`$colorFormatType`]($colorFormatType.md)
- [`$findClosestColorName`]($findClosestColorName.md)
- [`$getColorChannel`]($getColorChannel.md)
- [`$getColorFromName`]($getColorFromName.md)
- [`$isDarkColor`]($isDarkColor.md)
- [`$isLightColor`]($isLightColor.md)

**Source:** [`src/functions/utility/colorTemperature.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/utility/colorTemperature.ts)

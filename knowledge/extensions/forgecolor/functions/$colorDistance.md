# $colorDistance

> Calculates the distance between two colors using a specified formula. Defaults to cie76.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `utility` | v1.0.2 | required | yes | `Number` |

> aliases: $colorDifference, $colorDiff, $colorSimilarity

## Signature

```fs
$colorDistance[color 1;color 2;mode]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color 1` | `String` | **yes** | no | The first color. |
| 2 | `color 2` | `String` | **yes** | no | The second color. |
| 3 | `mode` | `Enum` | no | no | Distance mode: rgb, weighted, cie76, or luminance. |

### Per-parameter notes

- **`color 1`** (`String`, required): The first color.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`color 2`** (`String`, required): The second color.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`mode`** (`Enum`, optional): Distance mode: rgb, weighted, cie76, or luminance.. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$colorDistance` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$colorDistance[#5865F2;#5865F2]
```

**Full form (all arguments)**

```fs
$colorDistance[#5865F2;#5865F2;value]
```

## Reference implementation (source)

Taken from `src/functions/utility/colorDistance.ts` in the `ForgeColor` repository — this is exactly what runs:

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

      const distance = colorDistance(
        rgb1,
        rgb2,
        mode ?? ColorDistanceMode.CIE76,
      );

      return this.success(distance);
    } catch (err) {
      return this.customError(
        `An error occurred while calculating color distance: ${(err as Error).message}`,
      );
    }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$colorDifference`, `$colorDiff`, `$colorSimilarity` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`mode`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorContrastRatio`]($colorContrastRatio.md)
- [`$colorFormatType`]($colorFormatType.md)
- [`$colorTemperature`]($colorTemperature.md)
- [`$findClosestColorName`]($findClosestColorName.md)
- [`$getColorChannel`]($getColorChannel.md)
- [`$getColorFromName`]($getColorFromName.md)
- [`$isDarkColor`]($isDarkColor.md)
- [`$isLightColor`]($isLightColor.md)

**Source:** [`src/functions/utility/colorDistance.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/utility/colorDistance.ts)

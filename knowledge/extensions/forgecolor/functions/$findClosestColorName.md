# $findClosestColorName

> Finds the closest named color(s) to a given color code, optionally returning multiple results.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `utility` | v1.1.0 | required | yes | `String` |

> aliases: $closestColorName, $nearestColor

## Signature

```fs
$findClosestColorName[color;results;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color` | `String` | **yes** | no | The color to compare. |
| 2 | `results` | `Number` | no | no | Number of closest matches to return (default: 1). |
| 3 | `separator` | `String` | no | no | Separator to join multiple results (default: ', '). |

### Per-parameter notes

- **`color`** (`String`, required): The color to compare.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`results`** (`Number`, optional): Number of closest matches to return (default: 1).. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`separator`** (`String`, optional): Separator to join multiple results (default: ', ').. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$findClosestColorName` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$findClosestColorName[#5865F2]
```

**Full form (all arguments)**

```fs
$findClosestColorName[#5865F2;5;,]
```

## Reference implementation (source)

Taken from `src/functions/utility/getClosestColorName.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      // Convert and validate color
      const rgbStr = ColorConverter.convert(color, ColorFormat.rgb);
      if (!rgbStr) {
        return this.customError(`Could not convert "${color}" to RGB.`);
      }

      const parsed = parseColor(rgbStr, ColorFormat.rgb);
      if (!parsed) {
        return this.customError(`Could not parse "${color}" as RGB.`);
      }

      // Clamp n between 1 and total available colors
      const totalColors = ForgeColor.Colors.length;
      const limit = Math.trunc(
        Math.max(1, Math.min(Number(n) || 1, totalColors)),
      );

      // Get closest colors
      const results = ForgeColor.FindClosestName(parsed, limit);

      if (!results.length) {
        return this.customError(`No close color matches found for "${color}".`);
      }

      const output = results.map((c) => c.name).join(separator ?? ", ");

      return this.success(output);
    } catch (err) {
      return this.customError(
        `An error occurred while finding closest color: ${(err as Error).message}`,
      );
    }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$closestColorName`, `$nearestColor` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`results`, `separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorContrastRatio`]($colorContrastRatio.md)
- [`$colorDistance`]($colorDistance.md)
- [`$colorFormatType`]($colorFormatType.md)
- [`$colorTemperature`]($colorTemperature.md)
- [`$getColorChannel`]($getColorChannel.md)
- [`$getColorFromName`]($getColorFromName.md)
- [`$isDarkColor`]($isDarkColor.md)
- [`$isLightColor`]($isLightColor.md)

**Source:** [`src/functions/utility/getClosestColorName.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/utility/getClosestColorName.ts)

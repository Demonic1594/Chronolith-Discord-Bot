# $isDarkColor

> Checks if a color is dark based on luminance (returns true/false).

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `utility` | v1.0.1 | required | yes | `Boolean` |

> aliases: $isDark, $isColorDark

## Signature

```fs
$isDarkColor[color;threshold]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color` | `String` | **yes** | no | The color code to check. |
| 2 | `threshold` | `Number` | no | no | Override default luminance cutoff (0–1, default 0.5). |

### Per-parameter notes

- **`color`** (`String`, required): The color code to check.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`threshold`** (`Number`, optional): Override default luminance cutoff (0–1, default 0.5).. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$isDarkColor` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$isDarkColor[#5865F2]
```

**Full form (all arguments)**

```fs
$isDarkColor[#5865F2;5]
```

## Reference implementation (source)

Taken from `src/functions/utility/isDarkColor.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      // Convert input to RGB
      const rgbStr = ColorConverter.convert(color, ColorFormat.rgb);
      if (!rgbStr) {
        return this.customError(`Could not convert "${color}" to RGB.`);
      }

      const parsed = parseColor(rgbStr, ColorFormat.rgb);
      if (!parsed) {
        return this.customError(`Could not parse "${color}" as RGB.`);
      }

      const result = isDarkColor(
        [parsed.r, parsed.g, parsed.b],
        threshold ?? 0.5,
      );
      return this.success(result);
    } catch (err) {
      return this.customError(
        `An error occurred while checking color brightness: ${(err as Error).message}`,
      );
    }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$isDark`, `$isColorDark` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`threshold`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorContrastRatio`]($colorContrastRatio.md)
- [`$colorDistance`]($colorDistance.md)
- [`$colorFormatType`]($colorFormatType.md)
- [`$colorTemperature`]($colorTemperature.md)
- [`$findClosestColorName`]($findClosestColorName.md)
- [`$getColorChannel`]($getColorChannel.md)
- [`$getColorFromName`]($getColorFromName.md)
- [`$isLightColor`]($isLightColor.md)

**Source:** [`src/functions/utility/isDarkColor.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/utility/isDarkColor.ts)

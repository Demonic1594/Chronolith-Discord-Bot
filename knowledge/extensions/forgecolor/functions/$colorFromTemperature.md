# $colorFromTemperature

> Generates a color from a given color temperature (Kelvin).

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `generation` | v1.0.2 | required | yes | `String` |

> aliases: $colorFromTemp, $kelvinToColor, $colorTemperatureToColor

## Signature

```fs
$colorFromTemperature[kelvin;output format]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `kelvin` | `Number` | **yes** | no | Color temperature in Kelvin (e.g. 2000–40000). |
| 2 | `output format` | `Enum` | no | no | The desired output format: hex, rgb, rgba, hsl, int, or cmyk. |

### Per-parameter notes

- **`kelvin`** (`Number`, required): Color temperature in Kelvin (e.g. 2000–40000).. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`output format`** (`Enum`, optional): The desired output format: hex, rgb, rgba, hsl, int, or cmyk.. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$colorFromTemperature` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$colorFromTemperature[5]
```

**Full form (all arguments)**

```fs
$colorFromTemperature[5;value]
```

## Reference implementation (source)

Taken from `src/functions/generation/colorFromTemperature.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      if (kelvin < 1000 || kelvin > 40000) {
        return this.customError(`Kelvin value must be between 1000 and 40000.`);
      }

      // Generate RGB from kelvin
      const { r, g, b } = rgbFromKelvin(kelvin);

      // Convert to requested format (default hex)
      const format = outputFormat ?? ColorFormat.hex;
      const rgbStr = `rgb(${r}, ${g}, ${b})`;

      const converted = ColorConverter.convert(rgbStr, format);
      if (!converted) {
        return this.customError(
          `Could not convert generated RGB to ${format}.`,
        );
      }

      return this.success(converted);
    } catch (err) {
      return this.customError(
        `An error occurred while generating color from temperature: ${(err as Error).message}`,
      );
    }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$colorFromTemp`, `$kelvinToColor`, `$colorTemperatureToColor` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`output format`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$averageColor`]($averageColor.md)
- [`$blendColors`]($blendColors.md)
- [`$generateGradient`]($generateGradient.md)
- [`$randomColor`]($randomColor.md)

**Source:** [`src/functions/generation/colorFromTemperature.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/generation/colorFromTemperature.ts)

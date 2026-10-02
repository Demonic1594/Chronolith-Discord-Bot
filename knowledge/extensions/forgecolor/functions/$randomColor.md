# $randomColor

> Generates a random color in the specified format (hex by default).

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `generation` | v1.0.0 | optional | yes | `String` |

## Signature

```fs
$randomColor[output format]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `output format` | `Enum` | no | no | The desired output format: hex, rgb, rgba, hsl, int, or cmyk. |

### Per-parameter notes

- **`output format`** (`Enum`, optional): The desired output format: hex, rgb, rgba, hsl, int, or cmyk.. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$randomColor` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$randomColor[value]
```

## Reference implementation (source)

Taken from `src/functions/generation/randomColor.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      // Default to hex format if none is provided
      out ??= ColorFormat.hex;
      let randomColor: string;
      switch (out) {
        case ColorFormat.rgb:
          randomColor = rgbToString({
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255,
          });
          break;
        case ColorFormat.rgba:
          randomColor = rgbaToString({
            r: Math.random() * 255,
            g: Math.random() * 255,
            b: Math.random() * 255,
            a: Math.random(),
          });
          break;
        case ColorFormat.hex:
          randomColor = hexToString(
            Math.floor(Math.random() * 0x1000000)
              .toString(16)
              .padStart(6, "0"),
          );
          break;
        case ColorFormat.hsl:
          randomColor = hslToString({
            h: Math.random() * 360,
            s: Math.random(),
            l: Math.random(),
          });
          break;
        case ColorFormat.int:
          randomColor = Math.floor(Math.random() * 0x1000000).toString();
          break;
        case ColorFormat.cmyk:
          randomColor = cmykToString({
            c: Math.random(),
            m: Math.random(),
            y: Math.random(),
            k: Math.random(),
          });
          break;
      }
      if (!randomColor) {
        return this.customError(
          `Failed to generate color for format "${out}".`,
        );
      }

      return this.success(randomColor);
    } catch (err) {
      return this.customError(
        `An error occurred while generating a color: ${(err as Error).message}`,
      );
    }
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`output format`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$averageColor`]($averageColor.md)
- [`$blendColors`]($blendColors.md)
- [`$colorFromTemperature`]($colorFromTemperature.md)
- [`$generateGradient`]($generateGradient.md)

## Community guides covering this function

- [$randomColor guide](../../../guides/guide-227.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-227)

**Source:** [`src/functions/generation/randomColor.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/generation/randomColor.ts)

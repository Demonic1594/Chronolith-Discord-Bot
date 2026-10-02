# $blendColors

> Blends two colors using a blend mode like average, multiply, or gamma.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `generation` | v1.0.0 | required | yes | `String` |

> aliases: $mixColors, $blend

## Signature

```fs
$blendColors[color 1;color 2;mode;t]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color 1` | `String` | **yes** | no | The first color. |
| 2 | `color 2` | `String` | **yes** | no | The second color. |
| 3 | `mode` | `Enum` | **yes** | no | The blend mode to use (average, additive, screen, multiply, gamma). |
| 4 | `t` | `Number` | no | no | Blend factor between 0 and 1. Used only for "average" and "gamma" modes. Defaults to 0.5. |

### Per-parameter notes

- **`color 1`** (`String`, required): The first color.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`color 2`** (`String`, required): The second color.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`mode`** (`Enum`, required): The blend mode to use (average, additive, screen, multiply, gamma).. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`t`** (`Number`, optional): Blend factor between 0 and 1. Used only for "average" and "gamma" modes. Defaults to 0.5.. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$blendColors` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$blendColors[#5865F2;#5865F2;value]
```

**Full form (all arguments)**

```fs
$blendColors[#5865F2;#5865F2;value;5]
```

## Reference implementation (source)

Taken from `src/functions/generation/blendColors.ts` in the `ForgeColor` repository — this is exactly what runs:

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

      if (
        (mode === BlendMode.average || mode === BlendMode.gamma) &&
        t != null &&
        (t < 0 || t > 1)
      ) {
        return this.customError(`Blend factor \`t\` must be between 0 and 1.`);
      }

      const blended = blendRGB(
        [rgb1.r, rgb1.g, rgb1.b],
        [rgb2.r, rgb2.g, rgb2.b],
        mode,
        t ?? 0.5,
      );

      return this.success(
        rgbToString({ r: blended[0], g: blended[1], b: blended[2] }),
      );
    } catch (err) {
      return this.customError(
        `An error occurred while blending colors: ${(err as Error).message}`,
      );
    }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$mixColors`, `$blend` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`t`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$averageColor`]($averageColor.md)
- [`$colorFromTemperature`]($colorFromTemperature.md)
- [`$generateGradient`]($generateGradient.md)
- [`$randomColor`]($randomColor.md)

**Source:** [`src/functions/generation/blendColors.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/generation/blendColors.ts)

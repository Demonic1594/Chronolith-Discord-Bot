# $generateGradient

> Generates a gradient of color codes between two or more colors.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `generation` | v1.0.1 | required | yes | `Json` |

## Signature

```fs
$generateGradient[steps;output format;includeStops;mode;colors]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `steps` | `Number` | **yes** | no | Total steps in the gradient |
| 2 | `output format` | `Enum` | **yes** | no | Format to return each color in: hex, rgb, rgba, hsl, or cmyk |
| 3 | `includeStops` | `Boolean` | no | no | Include original stops in output (default: false) |
| 4 | `mode` | `Enum` | no | no | How to interpolate between colors (default: average) |
| 5 | `colors` | `String` | no | yes | At least two color codes to interpolate between |

### Per-parameter notes

- **`steps`** (`Number`, required): Total steps in the gradient. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`output format`** (`Enum`, required): Format to return each color in: hex, rgb, rgba, hsl, or cmyk. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`includeStops`** (`Boolean`, optional): Include original stops in output (default: false). Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`mode`** (`Enum`, optional): How to interpolate between colors (default: average). Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`colors`** (`String` , rest, optional): At least two color codes to interpolate between. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$generateGradient` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `colors` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$generateGradient[5;value]
```

**Full form (all arguments)**

```fs
$generateGradient[5;value;true;value;#5865F2]
```

## Reference implementation (source)

Taken from `src/functions/generation/generateGradient.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    if (colors.length < 2) {
      return this.customError("At least two colors must be provided.");
    }

    const parsed: RGB[] = [];

    for (const raw of colors) {
      const converted = ColorConverter.convert(raw, ColorFormat.rgb);
      const color = parseColor(converted ?? "", ColorFormat.rgb);

      if (!color) {
        return this.customError(`Could not parse "${raw}" to RGB.`);
      }

      parsed.push({ r: color.r, g: color.g, b: color.b });
    }

    try {
      const gradient = generateGradient(
        parsed,
        steps,
        includeStops == true,
        mode || BlendMode.average,
      );

      const converted = gradient.map((rgb) => {
        const rgbString = rgbToString(rgb);
        const final = ColorConverter.convert(rgbString, format);
        return final ?? rgbString;
      });

      return this.successJSON(converted);
    } catch (err) {
      return this.customError(
        `An error occurred while generating the gradient: ${(err as Error).message}`,
      );
    }
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`includeStops`, `mode`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$averageColor`]($averageColor.md)
- [`$blendColors`]($blendColors.md)
- [`$colorFromTemperature`]($colorFromTemperature.md)
- [`$randomColor`]($randomColor.md)

**Source:** [`src/functions/generation/generateGradient.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/generation/generateGradient.ts)

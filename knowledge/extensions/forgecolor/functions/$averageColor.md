# $averageColor

> Calculates the average (mean) color from two or more input colors and returns it in the specified format.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `generation` | v1.0.2 | required | yes | `String` |

> aliases: $meanColor

## Signature

```fs
$averageColor[format;colors]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `format` | `Enum` | **yes** | no | The desired output format (hex, rgb, hsl, etc.). |
| 2 | `colors` | `String` | **yes** | yes | Two or more colors to average. |

### Per-parameter notes

- **`format`** (`Enum`, required): The desired output format (hex, rgb, hsl, etc.).. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`colors`** (`String` , rest, required): Two or more colors to average.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$averageColor` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `colors` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$averageColor[value;#5865F2]
```

## Reference implementation (source)

Taken from `src/functions/generation/averageColor.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    if (!colors || colors.length < 2) {
      return this.customError(
        "You must provide at least two colors to average.",
      );
    }

    let avg = [0, 0, 0];

    for (const color of colors) {
      const rgb = ColorConverter.convert(color, ColorFormat.rgb);
      if (!rgb) return this.customError(`Could not convert "${color}" to RGB.`);

      const parsed = parseColor(rgb, ColorFormat.rgb);
      if (!parsed)
        return this.customError(`Failed to parse "${color}" as RGB.`);

      avg[0] += parsed.r;
      avg[1] += parsed.g;
      avg[2] += parsed.b;
    }

    avg = avg.map((v) => Math.round(v / colors.length));

    const rgbStr = rgbToString({ r: avg[0], g: avg[1], b: avg[2] });
    const output = ColorConverter.convert(rgbStr, format);

    if (!output)
      return this.customError(
        `Could not convert averaged color to "${format}".`,
      );

    return this.success(output);
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$meanColor` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$blendColors`]($blendColors.md)
- [`$colorFromTemperature`]($colorFromTemperature.md)
- [`$generateGradient`]($generateGradient.md)
- [`$randomColor`]($randomColor.md)

**Source:** [`src/functions/generation/averageColor.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/generation/averageColor.ts)

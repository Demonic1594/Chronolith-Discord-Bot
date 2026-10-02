# $tint

> Lightens a color by blending it with white.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `manipulation` | v1.0.2 | required | yes | `String` |

> aliases: $tintColor

## Signature

```fs
$tint[color;amount]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color` | `String` | **yes** | no | The color to tint. |
| 2 | `amount` | `Number` | **yes** | no | Amount to lighten (0–1). |

### Per-parameter notes

- **`color`** (`String`, required): The color to tint.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`amount`** (`Number`, required): Amount to lighten (0–1).. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$tint` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$tint[#5865F2;5]
```

## Reference implementation (source)

Taken from `src/functions/manipulation/tint.ts` in the `ForgeColor` repository — this is exactly what runs:

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
        return this.customError(`Could not convert "${color}" to RGB.`);
      }

      const parsed = parseColor(rgbConverted, ColorFormat.rgb);
      if (!parsed || parsed.format !== ColorFormat.rgb) {
        return this.customError(`Could not parse "${color}" as RGB.`);
      }

      if (amount < 0 || amount > 1) {
        return this.customError(`Amount must be between 0 and 1.`);
      }

      const { r, g, b } = tint(parsed, amount);
      const tintedRGB = `rgb(${r}, ${g}, ${b})`;

      const finalColor = ColorConverter.convert(tintedRGB, originalFormat);
      if (!finalColor) {
        return this.customError(
          `Could not convert tinted color back to "${originalFormat}".`,
        );
      }

      return this.success(finalColor);
    } catch (err) {
      return this.customError(
        `An error occurred while tinting color: ${(err as Error).message}`,
      );
    }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$tintColor` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$invertColor`]($invertColor.md)
- [`$shade`]($shade.md)

**Source:** [`src/functions/manipulation/tint.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/manipulation/tint.ts)

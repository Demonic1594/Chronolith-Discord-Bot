# $colorToRGB

> Converts a color code from any supported format (hex, rgb, hsl, etc.) to a rgb/rgba format.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `conversion` | v1.0.1 | required | yes | `String` |

> aliases: $colorToRGBA

## Signature

```fs
$colorToRGB[color;alpha]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color` | `String` | **yes** | no | The color string to convert. |
| 2 | `alpha` | `Boolean` | no | no | Whether to return as RGBA |

### Per-parameter notes

- **`color`** (`String`, required): The color string to convert.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`alpha`** (`Boolean`, optional): Whether to return as RGBA. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

See the function list below for exact signatures.

`$colorToRGB` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$colorToRGB[#5865F2]
```

**Full form (all arguments)**

```fs
$colorToRGB[#5865F2;true]
```

## Reference implementation (source)

Taken from `src/functions/conversion/colorToRGB.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      const result = ColorConverter.convert(
        color,
        alpha == true ? ColorFormat.rgba : ColorFormat.rgb,
      );

      if (!result) {
        return this.customError(
          `Could not convert "${color}" to ${alpha ? "RGBA" : "RGB"} — make sure it is a valid color format.`,
        );
      }

      return this.success(result);
    } catch (err) {
      return this.customError(
        `An error occurred while converting color: ${(err as Error).message}`,
      );
    }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$colorToRGBA` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`alpha`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorToCMYK`]($colorToCMYK.md)
- [`$colorToHex`]($colorToHex.md)
- [`$colorToHSL`]($colorToHSL.md)
- [`$colorToInt`]($colorToInt.md)
- [`$convertColor`]($convertColor.md)
- [`$parseColor`]($parseColor.md)

**Source:** [`src/functions/conversion/colorToRGB.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/conversion/colorToRGB.ts)

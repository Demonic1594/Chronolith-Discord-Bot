# $colorToHex

> Converts a color code from any supported format (hex, rgb, hsl, etc.) to a hex format.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `conversion` | v1.0.1 | required | yes | `String` |

## Signature

```fs
$colorToHex[color]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color` | `String` | **yes** | no | The color string to convert. |

### Per-parameter notes

- **`color`** (`String`, required): The color string to convert.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$colorToHex` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$colorToHex[#5865F2]
```

## Reference implementation (source)

Taken from `src/functions/conversion/colorToHex.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      const result = ColorConverter.convert(color, ColorFormat.hex);

      if (!result) {
        return this.customError(
          `Could not convert "${color}" to HEX — make sure it is a valid color format.`,
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

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorToCMYK`]($colorToCMYK.md)
- [`$colorToHSL`]($colorToHSL.md)
- [`$colorToInt`]($colorToInt.md)
- [`$colorToRGB`]($colorToRGB.md)
- [`$convertColor`]($convertColor.md)
- [`$parseColor`]($parseColor.md)

**Source:** [`src/functions/conversion/colorToHex.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/conversion/colorToHex.ts)

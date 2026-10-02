# $convertColor

> Converts a color code from any supported format (hex, rgb, hsl, etc.) to a target format.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `conversion` | v1.0.0 | required | yes | `String` |

> aliases: $colorConvert, $transformColor

## Signature

```fs
$convertColor[color;to]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color` | `String` | **yes** | no | The color string to convert. |
| 2 | `to` | `Enum` | **yes** | no | The format to convert the color to. |

### Per-parameter notes

- **`color`** (`String`, required): The color string to convert.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`to`** (`Enum`, required): The format to convert the color to.. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$convertColor` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$convertColor[#5865F2;value]
```

## Reference implementation (source)

Taken from `src/functions/conversion/convertColor.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      const result = ColorConverter.convert(color, to);

      if (!result) {
        return this.customError(
          `Could not convert "${color}" to ${to.toUpperCase()} — make sure it is a valid color format.`,
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

1. Callable by its aliases too: `$colorConvert`, `$transformColor` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorToCMYK`]($colorToCMYK.md)
- [`$colorToHex`]($colorToHex.md)
- [`$colorToHSL`]($colorToHSL.md)
- [`$colorToInt`]($colorToInt.md)
- [`$colorToRGB`]($colorToRGB.md)
- [`$parseColor`]($parseColor.md)

## Community guides covering this function

- [$convertColor guide](../../../guides/guide-230.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-230)

**Source:** [`src/functions/conversion/convertColor.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/conversion/convertColor.ts)

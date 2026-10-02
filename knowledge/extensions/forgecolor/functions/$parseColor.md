# $parseColor

> Parses and normalizes a color string to a structured object.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `conversion` | v1.0.0 | required | yes | `Json` |

> aliases: $colorObject

## Signature

```fs
$parseColor[color]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color` | `String` | **yes** | no | The color string to parse |

### Per-parameter notes

- **`color`** (`String`, required): The color string to parse. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$parseColor` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$parseColor[#5865F2]
```

## Reference implementation (source)

Taken from `src/functions/conversion/parseColor.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      const result = parseColor(color);
      return this.successJSON(result);
    } catch (err) {
      return this.customError(
        `Failed to parse color: ${(err as Error).message}`,
      );
    }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$colorObject` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorToCMYK`]($colorToCMYK.md)
- [`$colorToHex`]($colorToHex.md)
- [`$colorToHSL`]($colorToHSL.md)
- [`$colorToInt`]($colorToInt.md)
- [`$colorToRGB`]($colorToRGB.md)
- [`$convertColor`]($convertColor.md)

**Source:** [`src/functions/conversion/parseColor.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/conversion/parseColor.ts)

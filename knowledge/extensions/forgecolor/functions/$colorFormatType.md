# $colorFormatType

> Returns the format of a given color code (hex, rgb, rgba, hsl, etc).

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `utility` | v1.0.0 | required | yes | `String` |

> aliases: $getColorFormat, $detectColorFormat

## Signature

```fs
$colorFormatType[color]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color` | `String` | **yes** | no | The color code to get the format of |

### Per-parameter notes

- **`color`** (`String`, required): The color code to get the format of. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$colorFormatType` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$colorFormatType[#5865F2]
```

## Reference implementation (source)

Taken from `src/functions/utility/colorFormatType.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    const format = detectColorFormat(color);
    return this.success(format ?? "unknown");
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$getColorFormat`, `$detectColorFormat` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorContrastRatio`]($colorContrastRatio.md)
- [`$colorDistance`]($colorDistance.md)
- [`$colorTemperature`]($colorTemperature.md)
- [`$findClosestColorName`]($findClosestColorName.md)
- [`$getColorChannel`]($getColorChannel.md)
- [`$getColorFromName`]($getColorFromName.md)
- [`$isDarkColor`]($isDarkColor.md)
- [`$isLightColor`]($isLightColor.md)

## Community guides covering this function

- [$colorFormatType guide](../../../guides/guide-229.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-229)

**Source:** [`src/functions/utility/colorFormatType.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/utility/colorFormatType.ts)

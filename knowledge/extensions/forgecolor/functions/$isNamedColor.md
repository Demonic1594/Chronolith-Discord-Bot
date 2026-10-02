# $isNamedColor

> Checks whether a given color name exists in the named color list.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `utility` | v1.1.0 | required | yes | `Boolean` |

> aliases: $isColorName

## Signature

```fs
$isNamedColor[name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The color name to check. |

### Per-parameter notes

- **`name`** (`String`, required): The color name to check.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$isNamedColor` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$isNamedColor[name]
```

## Reference implementation (source)

Taken from `src/functions/utility/isNamedColor.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    const exists = isNamedColor(name);
    return this.success(exists);
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$isColorName` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorContrastRatio`]($colorContrastRatio.md)
- [`$colorDistance`]($colorDistance.md)
- [`$colorFormatType`]($colorFormatType.md)
- [`$colorTemperature`]($colorTemperature.md)
- [`$findClosestColorName`]($findClosestColorName.md)
- [`$getColorChannel`]($getColorChannel.md)
- [`$getColorFromName`]($getColorFromName.md)
- [`$isDarkColor`]($isDarkColor.md)

**Source:** [`src/functions/utility/isNamedColor.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/utility/isNamedColor.ts)

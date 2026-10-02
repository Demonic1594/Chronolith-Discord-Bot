# $getColorFromName

> Gets a color's code from named colors (case-insensitive).

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `utility` | v1.1.0 | required | yes | `String` |

> aliases: $namedColor, $colorName, $colorFromName

## Signature

```fs
$getColorFromName[name;format]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The color name (see available colors in colors.json). |
| 2 | `format` | `Enum` | no | no | The desired output format (hex, rgb, hsl, etc.). |

### Per-parameter notes

- **`name`** (`String`, required): The color name (see available colors in colors.json).. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`format`** (`Enum`, optional): The desired output format (hex, rgb, hsl, etc.).. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$getColorFromName` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getColorFromName[name]
```

**Full form (all arguments)**

```fs
$getColorFromName[name;value]
```

## Reference implementation (source)

Taken from `src/functions/utility/getColorFromName.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      const value = ForgeColor.GetColorFromName(name as NamedColor);

      if (value === null) {
        return this.success();
      }

      const output = ColorConverter.convert(
        "#" + value.toString(16).padStart(6, "0"), // im cool asf
        format ?? ColorFormat.hex,
      );

      if (!output)
        return this.customError(
          `Could not convert output color to "${format ?? ColorFormat.hex}".`,
        );

      return this.success(output);
    } catch (err) {
      return this.customError(
        `An error occurred while resolving color name: ${(err as Error).message}`,
      );
    }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$namedColor`, `$colorName`, `$colorFromName` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`format`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorContrastRatio`]($colorContrastRatio.md)
- [`$colorDistance`]($colorDistance.md)
- [`$colorFormatType`]($colorFormatType.md)
- [`$colorTemperature`]($colorTemperature.md)
- [`$findClosestColorName`]($findClosestColorName.md)
- [`$getColorChannel`]($getColorChannel.md)
- [`$isDarkColor`]($isDarkColor.md)
- [`$isLightColor`]($isLightColor.md)

**Source:** [`src/functions/utility/getColorFromName.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/utility/getColorFromName.ts)

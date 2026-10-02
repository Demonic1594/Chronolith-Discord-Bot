# $getColorChannel

> Extracts a specific channel (e.g. red, hue, saturation) from a color code.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `utility` | v1.0.0 | required | yes | `Number` |

> aliases: $colorChannel, $extractColorChannel

## Signature

```fs
$getColorChannel[color;channel]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color` | `String` | **yes** | no | The color string to extract from. |
| 2 | `channel` | `Enum` | **yes** | no | The channel to extract (e.g. red, hue, cyan). |

### Per-parameter notes

- **`color`** (`String`, required): The color string to extract from.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`channel`** (`Enum`, required): The channel to extract (e.g. red, hue, cyan).. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$getColorChannel` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getColorChannel[#5865F2;value]
```

## Reference implementation (source)

Taken from `src/functions/utility/getColorChannel.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      const format = detectColorFormat(color);

      if (!format) {
        return this.customError(
          ` Could not detect color format for "${color}". Make sure it's a valid hex, rgb, rgba, hsl, or cmyk code.`,
        );
      }

      let toFormat!: ColorFormat;

      switch (channel) {
        case ColorChannels.red:
        case ColorChannels.green:
        case ColorChannels.blue:
        case ColorChannels.alpha:
          toFormat = ColorFormat.rgba;
          break;

        case ColorChannels.hue:
        case ColorChannels.saturation:
        case ColorChannels.lightness:
          toFormat = ColorFormat.hsl;
          break;

        case ColorChannels.cyan:
        case ColorChannels.magenta:
        case ColorChannels.yellow:
        case ColorChannels.key:
          toFormat = ColorFormat.cmyk;
          break;
      }

      const converted = ColorConverter.convert(color, toFormat);

      if (!converted) {
        return this.customError(`Could not convert color to ${toFormat}.`);
      }
      const parsed = parseColor(converted);
      if (!parsed || parsed.format !== toFormat) {
        return this.customError(`Could not parse color as "${toFormat}".`);
      }

      const round = (v: number) => Math.round(v * 1000) / 1000;

      let value: number | undefined;

      switch (parsed.format) {
        case ColorFormat.rgba:
          if (channel === ColorChannels.red) value = parsed.r;
          else if (channel === ColorChannels.green) value = parsed.g;
          else if (channel === ColorChannels.blue) value = parsed.b;
          else if (channel === ColorChannels.alpha)
            value = round(parsed.a ?? 1);
          break;

        case ColorFormat.hsl:
          if (channel === ColorChannels.hue) value = round(parsed.h);
          else if (channel === ColorChannels.saturation)
            value = round(parsed.s);
          else if (channel === ColorChannels.lightness) value = round(parsed.l);
          break;

        case ColorFormat.cmyk:
          if (channel === ColorChannels.cyan) value = round(parsed.c);
          else if (channel === ColorChannels.magenta) value = round(parsed.m);
          else if (channel === ColorChannels.yellow) value = round(parsed.y);
          else if (channel === ColorChannels.key) value = round(parsed.k);
          break;
      }

      if (typeof value !== "number") {
        return this.customError(
          `Could not extract channel "${channel}" from color.`,
        );
      }

      return this.success(value);
    } catch (err) {
      return this.customError(
        `An error occurred while extracting channel: ${(err as Error).message}`,
      );
    }
  },
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$colorChannel`, `$extractColorChannel` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorContrastRatio`]($colorContrastRatio.md)
- [`$colorDistance`]($colorDistance.md)
- [`$colorFormatType`]($colorFormatType.md)
- [`$colorTemperature`]($colorTemperature.md)
- [`$findClosestColorName`]($findClosestColorName.md)
- [`$getColorFromName`]($getColorFromName.md)
- [`$isDarkColor`]($isDarkColor.md)
- [`$isLightColor`]($isLightColor.md)

**Source:** [`src/functions/utility/getColorChannel.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/utility/getColorChannel.ts)

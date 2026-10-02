# $measureText

> Returns text metrics that contain information about the measured text (such as its width, for example)

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `text` | v1.0.0 | optional | yes | — |

## Signature

```fs
$measureText[canvas;text;font;property]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `text` | `String` | **yes** | no | The text to measure |
| 3 | `font` | `String` | **yes** | no | The font |
| 4 | `property` | `Enum` | no | no | The measured text's TextMetrics property to return |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`text`** (`String`, required): The text to measure. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`font`** (`String`, required): The font. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`property`** (`Enum`, optional): The measured text's TextMetrics property to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$measureText` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$measureText[value;Hello!]
```

**Full form (all arguments)**

```fs
$measureText[value;Hello!;value;value]
```

## Reference implementation (source)

Taken from `src/functions/text/measureText.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name)?.ctx;
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        const valid = validateFont(font);
        if (!valid || typeof valid === 'string') return this.customError(valid);

        canvas.font = font;
        const res = canvas.measureText(text) as Record<string, any>;
        return this.success(property !== null
            ? res[MeasureTextProperty[
                (typeof property === 'string' ? MeasureTextProperty[property] : property) as any
            ]]
            : JSON.stringify(res)
        );
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`canvas`, `property`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$fontFamilies`]($fontFamilies.md)
- [`$fontVariantCaps`]($fontVariantCaps.md)
- [`$letterSpacing`]($letterSpacing.md)
- [`$registerFont`]($registerFont.md)
- [`$textAlign`]($textAlign.md)
- [`$textBaseline`]($textBaseline.md)
- [`$wordSpacing`]($wordSpacing.md)

**Source:** [`src/functions/text/measureText.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/text/measureText.ts)

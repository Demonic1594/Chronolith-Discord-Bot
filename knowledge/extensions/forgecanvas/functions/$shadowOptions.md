# $shadowOptions

> Sets or returns the shadow options in a canvas

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `util` | v1.1.0 | required | yes | — |

> aliases: $shadowConfig

## Signature

```fs
$shadowOptions[canvas;options]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `options` | `Json` | **yes** | no | The options (color, blur, offsetX, offsetY) |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`options`** (`Json`, required): The options (color, blur, offsetX, offsetY). Expects a JSON string. Parsed with ForgeScript's lenient `parseJSON`; invalid JSON is rejected.

## How it works

See the function list below for exact signatures.

`$shadowOptions` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$shadowOptions[value]
```

**Full form (all arguments)**

```fs
$shadowOptions[value;{"key":"value"}]
```

## Reference implementation (source)

Taken from `src/functions/util/shadowOptions.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name)?.ctx;

        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);
        if (typeof options === 'string') options = JSON.parse(options);

        const shadowOptions: Record<string, 'shadowColor' | 'shadowBlur' | 'shadowOffsetX' | 'shadowOffsetY'> = {
            color: 'shadowColor',
            blur: 'shadowBlur',
            offsetX: 'shadowOffsetX',
            offsetY: 'shadowOffsetY'
        };
        
        const res: any[] = [];
        if (!Array.isArray(options)) {
            for (const option in options) // @ts-ignore
                canvas[shadowOptions?.[option]] = options[option];
        } else for (const option in options)
            res.push(canvas[shadowOptions[option]]);

        return this.success(Array.isArray(options)
            ? JSON.stringify(res) : undefined
        );
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$shadowConfig` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`canvas`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$canvasVersion`]($canvasVersion.md)
- [`$clearCanvasCache`]($clearCanvasCache.md)
- [`$compositeOperation`]($compositeOperation.md)
- [`$filter`]($filter.md)
- [`$getPixels`]($getPixels.md)
- [`$hexToRgb`]($hexToRgb.md)
- [`$hexToRgba`]($hexToRgba.md)
- [`$indexedToHex`]($indexedToHex.md)

**Source:** [`src/functions/util/shadowOptions.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/util/shadowOptions.ts)

# $opacity

> Sets or returns the opacity in a canvas

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `util` | v1.0.0 | optional | yes | — |

> aliases: $globalAlpha, $alpha

## Signature

```fs
$opacity[canvas;opacity]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `opacity` | `Number` | no | no | The new opacity |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`opacity`** (`Number`, optional): The new opacity. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$opacity` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$opacity[value]
```

**Full form (all arguments)**

```fs
$opacity[value;5]
```

## Reference implementation (source)

Taken from `src/functions/util/opacity.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name)?.ctx;
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        return this.success(opacity !== null && opacity !== undefined
            ? (canvas.globalAlpha = opacity / 100, undefined)
            : canvas.globalAlpha
        );
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$globalAlpha`, `$alpha` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`canvas`, `opacity`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/functions/util/opacity.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/util/opacity.ts)

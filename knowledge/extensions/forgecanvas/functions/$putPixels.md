# $putPixels

> Places pixels in the canvas

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `drawing` | v1.0.0 | required | yes | — |

> aliases: $putImageData, $setPixels

## Signature

```fs
$putPixels[canvas;pixels;x;y;width;height;type]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `pixels` | `Json` | **yes** | no | The pixels to place |
| 3 | `x` | `Number` | **yes** | no | The X coordinate of the top-left corner of the rectangle from which the pixel colors will be extracted |
| 4 | `y` | `Number` | **yes** | no | The Y coordinate of the top-left corner of the rectangle from which the pixel colors will be extracted |
| 5 | `width` | `Number` | **yes** | no | The width of the rectangle from which the pixel colors will be extracted |
| 6 | `height` | `Number` | **yes** | no | The height of the rectangle from which the pixel colors will be extracted |
| 7 | `type` | `Enum` | no | no | The pixels (image data) content type |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`pixels`** (`Json`, required): The pixels to place. Expects a JSON string. Parsed with ForgeScript's lenient `parseJSON`; invalid JSON is rejected.
- **`x`** (`Number`, required): The X coordinate of the top-left corner of the rectangle from which the pixel colors will be extracted. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`y`** (`Number`, required): The Y coordinate of the top-left corner of the rectangle from which the pixel colors will be extracted. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`width`** (`Number`, required): The width of the rectangle from which the pixel colors will be extracted. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`height`** (`Number`, required): The height of the rectangle from which the pixel colors will be extracted. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`type`** (`Enum`, optional): The pixels (image data) content type. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$putPixels` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$putPixels[value;{"key":"value"};5;5;5]
```

**Full form (all arguments)**

```fs
$putPixels[value;{"key":"value"};5;5;5;5;value]
```

## Reference implementation (source)

Taken from `src/functions/drawing/putPixels.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name);
        
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);
        if (!Array.isArray(pixels)) return this.customError(ForgeCanvasError.ArrayExpected);

        canvas.setPixels(x, y, w, h, pixels, t);
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$putImageData`, `$setPixels` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`canvas`, `type`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$drawImage`]($drawImage.md)
- [`$drawImageArea`]($drawImageArea.md)
- [`$drawRect`]($drawRect.md)
- [`$drawText`]($drawText.md)

**Source:** [`src/functions/drawing/putPixels.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/drawing/putPixels.ts)

# $drawImage

> Draws an image on a canvas

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `drawing` | v1.0.0 | required | yes | — |

> aliases: $placeImage

## Signature

```fs
$drawImage[canvas;src;x;y;width;height;radius]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `src` | `String` | **yes** | no | The image source |
| 3 | `x` | `Number` | **yes** | no | The image start X coordinate |
| 4 | `y` | `Number` | **yes** | no | The image start Y coordinate |
| 5 | `width` | `Number` | no | no | The image width |
| 6 | `height` | `Number` | no | no | The image height |
| 7 | `radius` | `Number` | no | yes | The image radius |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`src`** (`String`, required): The image source. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`x`** (`Number`, required): The image start X coordinate. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`y`** (`Number`, required): The image start Y coordinate. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`width`** (`Number`, optional): The image width. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`height`** (`Number`, optional): The image height. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`radius`** (`Number` , rest, optional): The image radius. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$drawImage` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `radius` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$drawImage[value;value;5]
```

**Full form (all arguments)**

```fs
$drawImage[value;value;5;5;5;5;5]
```

## Reference implementation (source)

Taken from `src/functions/drawing/drawImage.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const manager = ctx.imageManager instanceof ImageManager ?
            ctx.imageManager : ctx.imageManager = new ImageManager();
        
        const canvas = ctx.canvasManager?.getOrCurrent(name);
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        width = num(width);
        height = num(height);

        const img = await resolveImage(this, ctx, src);
        if (img instanceof Return) {
            const style = await resolveStyle(this, ctx, canvas, src);
            if (style instanceof Return) return img;

            canvas.ctx.fillStyle = style;
            canvas.rect(
                FillOrStrokeOrClear.fill,
                x, y, width, height,
                radius.length === 1 ? radius[0] : radius
            );
            return this.success();
        };

        await canvas.drawImage(
            manager,
            img, x, y,
            width, height,
            radius.length === 1
                ? radius[0] : radius
        );
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$placeImage` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`canvas`, `width`, `height`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$drawImageArea`]($drawImageArea.md)
- [`$drawRect`]($drawRect.md)
- [`$drawText`]($drawText.md)
- [`$putPixels`]($putPixels.md)

**Source:** [`src/functions/drawing/drawImage.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/drawing/drawImage.ts)

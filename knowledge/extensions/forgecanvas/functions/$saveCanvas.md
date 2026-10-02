# $saveCanvas

> Saves a canvas to a file

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `canvas` | v1.1.0 | required | yes | — |

> aliases: $downloadCanvas, $canvasSave, $canvasDownload

## Signature

```fs
$saveCanvas[canvas;path;format]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `path` | `String` | **yes** | no | Path to a directory. (including the canvas file name and extension) |
| 3 | `format` | `Enum` | no | no | The image format |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`path`** (`String`, required): Path to a directory. (including the canvas file name and extension). Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`format`** (`Enum`, optional): The image format. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$saveCanvas` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$saveCanvas[value]
```

**Full form (all arguments)**

```fs
$saveCanvas[value;value;value]
```

## Reference implementation (source)

Taken from `src/functions/canvas/saveCanvas.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name);
        
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);
        if (!path) return this.customError(ForgeCanvasError.NoPath);

        const format: any = `image/${(typeof f === 'number' ? ImageFormat[f] : f) ?? 'png'}`;

        if (path.startsWith('images://')) {
            if (!ctx.imageManager) ctx.imageManager = new ImageManager();
            ctx.imageManager.set(
                path.slice(9),
                await loadImage(await canvas.encode(format))
            );
        } else writeFileSync(path, await canvas.encode(format));
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$downloadCanvas`, `$canvasSave`, `$canvasDownload` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`canvas`, `format`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$attachCanvas`]($attachCanvas.md)
- [`$canvasBuffer`]($canvasBuffer.md)
- [`$canvasDataUrl`]($canvasDataUrl.md)
- [`$canvasSize`]($canvasSize.md)
- [`$createCanvas`]($createCanvas.md)
- [`$deleteCanvas`]($deleteCanvas.md)
- [`$resizeCanvas`]($resizeCanvas.md)
- [`$cropCanvas`]($cropCanvas.md)

**Source:** [`src/functions/canvas/saveCanvas.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/canvas/saveCanvas.ts)

# $attachCanvas

> Creates a new canvas

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `canvas` | v1.3.0 | required | yes | — |

> aliases: $sendCanvas, $renderCanvas, $canvasRender

## Signature

```fs
$attachCanvas[canvas;filename;format]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | **yes** | no | Name of the canvas |
| 2 | `filename` | `String` | no | no | The name with the extension of the image to be attached as |
| 3 | `format` | `Enum` | no | no | The image format |

### Per-parameter notes

- **`canvas`** (`String`, required): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`filename`** (`String`, optional): The name with the extension of the image to be attached as. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`format`** (`Enum`, optional): The image format. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$attachCanvas` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$attachCanvas[value]
```

**Full form (all arguments)**

```fs
$attachCanvas[value;name;value]
```

## Reference implementation (source)

Taken from `src/functions/canvas/attachCanvas.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.get(name)?.inner;
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        ctx.container.files.push(new AttachmentBuilder( // @ts-ignore
            await canvas.encode((typeof format === 'number' ? ImageFormat[format] : format) ?? 'png'),
            { name: file ?? `${name}.png` }
        ));
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$sendCanvas`, `$renderCanvas`, `$canvasRender` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`filename`, `format`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$canvasBuffer`]($canvasBuffer.md)
- [`$canvasDataUrl`]($canvasDataUrl.md)
- [`$canvasSize`]($canvasSize.md)
- [`$createCanvas`]($createCanvas.md)
- [`$deleteCanvas`]($deleteCanvas.md)
- [`$resizeCanvas`]($resizeCanvas.md)
- [`$saveCanvas`]($saveCanvas.md)
- [`$cropCanvas`]($cropCanvas.md)

**Source:** [`src/functions/canvas/attachCanvas.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/canvas/attachCanvas.ts)

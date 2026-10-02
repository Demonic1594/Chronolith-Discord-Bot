# $cropCanvas

> Crops a canvas

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `canvas` | v1.0.0 | optional | yes | — |

> aliases: $canvasCrop, $canvasTrim, $trimCanvas

## Signature

```fs
$cropCanvas[canvas;top;left;right;bottom]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `top` | `Boolean` | no | no | Whether to trim the top (true by default) |
| 3 | `left` | `Boolean` | no | no | Whether to trim the left (true by default) |
| 4 | `right` | `Boolean` | no | no | Whether to trim the right (true by default) |
| 5 | `bottom` | `Boolean` | no | no | Whether to trim the bottom (true by default) |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`top`** (`Boolean`, optional): Whether to trim the top (true by default). Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`left`** (`Boolean`, optional): Whether to trim the left (true by default). Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`right`** (`Boolean`, optional): Whether to trim the right (true by default). Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`bottom`** (`Boolean`, optional): Whether to trim the bottom (true by default). Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

See the function list below for exact signatures.

`$cropCanvas` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$cropCanvas[value]
```

**Full form (all arguments)**

```fs
$cropCanvas[value;true;true;true;true]
```

## Reference implementation (source)

Taken from `src/functions/canvas/trimCanvas.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.get(name ?? '') ?? ctx.canvasManager?.current;
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        return this.success(canvas.trim(
            top !== false,
            left !== false,
            right !== false,
            bottom !== false
        ));
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$canvasCrop`, `$canvasTrim`, `$trimCanvas` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`canvas`, `top`, `left`, `right`, `bottom`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$attachCanvas`]($attachCanvas.md)
- [`$canvasBuffer`]($canvasBuffer.md)
- [`$canvasDataUrl`]($canvasDataUrl.md)
- [`$canvasSize`]($canvasSize.md)
- [`$createCanvas`]($createCanvas.md)
- [`$deleteCanvas`]($deleteCanvas.md)
- [`$resizeCanvas`]($resizeCanvas.md)
- [`$saveCanvas`]($saveCanvas.md)

**Source:** [`src/functions/canvas/trimCanvas.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/canvas/trimCanvas.ts)

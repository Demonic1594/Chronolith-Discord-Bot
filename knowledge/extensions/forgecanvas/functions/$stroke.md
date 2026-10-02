# $stroke

> Strokes (outlines) the current path

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `path` | v1.1.0 | required | yes | — |

> aliases: $strokePath, $pathStroke

## Signature

```fs
$stroke[canvas;style]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `style` | `String` | **yes** | no | The style (color/gradient/pattern) |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`style`** (`String`, required): The style (color/gradient/pattern). Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$stroke` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$stroke[value]
```

**Full form (all arguments)**

```fs
$stroke[value;value]
```

## Reference implementation (source)

Taken from `src/functions/path/stroke.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name);
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        const s = await resolveStyle(this, ctx, canvas, style);
        if (s instanceof Return) return s;

        canvas.ctx.strokeStyle = s;
        canvas.ctx.stroke();

        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$strokePath`, `$pathStroke` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`canvas`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$arc`]($arc.md)
- [`$arcTo`]($arcTo.md)
- [`$beginPath`]($beginPath.md)
- [`$clip`]($clip.md)
- [`$closePath`]($closePath.md)
- [`$ellipse`]($ellipse.md)
- [`$fill`]($fill.md)
- [`$moveTo`]($moveTo.md)

**Source:** [`src/functions/path/stroke.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/path/stroke.ts)

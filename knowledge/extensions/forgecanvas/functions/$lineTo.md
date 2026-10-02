# $lineTo

> Draws a straight line in the current path

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `line` | v1.0.0 | required | yes | — |

> aliases: $drawLine

## Signature

```fs
$lineTo[canvas;x;y]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `x` | `Number` | **yes** | no | The X coordinate of the line's end point |
| 3 | `y` | `Number` | **yes** | no | The Y coordinate of the line's end point |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`x`** (`Number`, required): The X coordinate of the line's end point. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`y`** (`Number`, required): The Y coordinate of the line's end point. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$lineTo` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$lineTo[value;5]
```

**Full form (all arguments)**

```fs
$lineTo[value;5;5]
```

## Reference implementation (source)

Taken from `src/functions/line/lineTo.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name);
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        canvas.ctx.lineTo(x, y);
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$drawLine` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`canvas`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$bezierCurveTo`]($bezierCurveTo.md)
- [`$lineDash`]($lineDash.md)
- [`$lineDashOffset`]($lineDashOffset.md)
- [`$lineJoin`]($lineJoin.md)
- [`$lineWidth`]($lineWidth.md)
- [`$quadraticCurveTo`]($quadraticCurveTo.md)

**Source:** [`src/functions/line/lineTo.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/line/lineTo.ts)

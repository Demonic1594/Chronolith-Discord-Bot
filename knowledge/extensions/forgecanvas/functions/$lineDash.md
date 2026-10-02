# $lineDash

> Sets or returns the line dash segments in a canvas

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `line` | v1.0.0 | optional | yes | — |

## Signature

```fs
$lineDash[canvas;segments]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `segments` | `Json` | no | no | The new line dash segments |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`segments`** (`Json`, optional): The new line dash segments. Expects a JSON string. Parsed with ForgeScript's lenient `parseJSON`; invalid JSON is rejected.

## How it works

See the function list below for exact signatures.

`$lineDash` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$lineDash[value]
```

**Full form (all arguments)**

```fs
$lineDash[value;{"key":"value"}]
```

## Reference implementation (source)

Taken from `src/functions/line/lineDash.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name)?.ctx;
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        if (segments && (!Array.isArray(segments) || !segments.every(x => typeof x === 'number')))
            return this.customError(ForgeCanvasError.InvalidLineDashSegments);

        return this.success(segments 
            ? (canvas.setLineDash(segments), undefined)
            : canvas.getLineDash()
        );
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`canvas`, `segments`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$bezierCurveTo`]($bezierCurveTo.md)
- [`$lineDashOffset`]($lineDashOffset.md)
- [`$lineJoin`]($lineJoin.md)
- [`$lineTo`]($lineTo.md)
- [`$lineWidth`]($lineWidth.md)
- [`$quadraticCurveTo`]($quadraticCurveTo.md)

**Source:** [`src/functions/line/lineDash.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/line/lineDash.ts)

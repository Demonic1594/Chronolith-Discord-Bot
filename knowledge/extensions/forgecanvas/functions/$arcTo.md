# $arcTo

> Adds a circular arc in the current path

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `path` | v1.0.0 | required | yes | — |

## Signature

```fs
$arcTo[canvas;x1;y1;x2;y2;radius]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `x1` | `Number` | **yes** | no | The X coordinate of the arc's start point |
| 3 | `y1` | `Number` | **yes** | no | The Y coordinate of the arc's start point |
| 4 | `x2` | `Number` | **yes** | no | The X coordinate of the arc's end point |
| 5 | `y2` | `Number` | **yes** | no | The Y coordinate of the arc's end point |
| 6 | `radius` | `Number` | **yes** | no | The arc's radius. Must be non-negative |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`x1`** (`Number`, required): The X coordinate of the arc's start point. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`y1`** (`Number`, required): The Y coordinate of the arc's start point. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`x2`** (`Number`, required): The X coordinate of the arc's end point. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`y2`** (`Number`, required): The Y coordinate of the arc's end point. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`radius`** (`Number`, required): The arc's radius. Must be non-negative. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$arcTo` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$arcTo[value;5;5;5;5]
```

**Full form (all arguments)**

```fs
$arcTo[value;5;5;5;5;5]
```

## Reference implementation (source)

Taken from `src/functions/path/arcTo.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name);
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        canvas.ctx.arcTo(...args);
        return this.success();
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`canvas`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$arc`]($arc.md)
- [`$beginPath`]($beginPath.md)
- [`$clip`]($clip.md)
- [`$closePath`]($closePath.md)
- [`$ellipse`]($ellipse.md)
- [`$fill`]($fill.md)
- [`$moveTo`]($moveTo.md)
- [`$stroke`]($stroke.md)

**Source:** [`src/functions/path/arcTo.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/path/arcTo.ts)

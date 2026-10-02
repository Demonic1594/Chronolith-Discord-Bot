# $ellipse

> Draws a eliiptical arc in the current path

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `path` | v1.0.0 | required | yes | — |

> aliases: $elArc

## Signature

```fs
$ellipse[canvas;x;y;radiusX;radiusY;rotation;startAngle;endAngle;counterclockwise]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `x` | `Number` | **yes** | no | The X coordinate of the ellipse's center |
| 3 | `y` | `Number` | **yes** | no | The Y coordinate of the ellipse's center |
| 4 | `radiusX` | `Number` | **yes** | no | The ellipse's major-axis radius. Must be positive |
| 5 | `radiusY` | `Number` | **yes** | no | The ellipse's minor-axis radius. Must be positive |
| 6 | `rotation` | `Number` | **yes** | no | The rotation of the ellipse, expressed in radians |
| 7 | `startAngle` | `Number` | **yes** | no | The eccentric angle at which the ellipse starts. |
| 8 | `endAngle` | `Number` | **yes** | no | The eccentric angle at which the ellipse ends |
| 9 | `counterclockwise` | `Boolean` | no | no | An optional boolean value. If true, draws the ellipse counter-clockwise between the start and end angles |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`x`** (`Number`, required): The X coordinate of the ellipse's center. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`y`** (`Number`, required): The Y coordinate of the ellipse's center. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`radiusX`** (`Number`, required): The ellipse's major-axis radius. Must be positive. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`radiusY`** (`Number`, required): The ellipse's minor-axis radius. Must be positive. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`rotation`** (`Number`, required): The rotation of the ellipse, expressed in radians. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`startAngle`** (`Number`, required): The eccentric angle at which the ellipse starts.. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`endAngle`** (`Number`, required): The eccentric angle at which the ellipse ends. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`counterclockwise`** (`Boolean`, optional): An optional boolean value. If true, draws the ellipse counter-clockwise between the start and end angles. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

See the function list below for exact signatures.

`$ellipse` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$ellipse[value;5;5;5;5;5;5]
```

**Full form (all arguments)**

```fs
$ellipse[value;5;5;5;5;5;5;5;true]
```

## Reference implementation (source)

Taken from `src/functions/path/ellipse.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name);
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        canvas.ctx.ellipse(x, y, rX, rY, rotation, sAngle, eAngle, ccw ?? false);
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$elArc` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`canvas`, `counterclockwise`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$arc`]($arc.md)
- [`$arcTo`]($arcTo.md)
- [`$beginPath`]($beginPath.md)
- [`$clip`]($clip.md)
- [`$closePath`]($closePath.md)
- [`$fill`]($fill.md)
- [`$moveTo`]($moveTo.md)
- [`$stroke`]($stroke.md)

**Source:** [`src/functions/path/ellipse.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/path/ellipse.ts)

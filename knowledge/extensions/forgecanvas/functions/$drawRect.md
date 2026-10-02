# $drawRect

> Draws a rectangle on a canvas

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `drawing` | v1.0.0 | required | yes | — |

> aliases: $placeRect, $rectangle, $rect

## Signature

```fs
$drawRect[canvas;type;style;x;y;width;height;radius]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `type` | `Enum` | **yes** | no | The rectangle type |
| 3 | `style` | `String` | no | no | The style. (color/gradient/pattern) |
| 4 | `x` | `Number` | **yes** | no | The rect start X coordinate |
| 5 | `y` | `Number` | **yes** | no | The rect start Y coordinate |
| 6 | `width` | `Number` | **yes** | no | The rect width |
| 7 | `height` | `Number` | **yes** | no | The rect height |
| 8 | `radius` | `Number` | no | yes | The rect radius |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`type`** (`Enum`, required): The rectangle type. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`style`** (`String`, optional): The style. (color/gradient/pattern). Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`x`** (`Number`, required): The rect start X coordinate. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`y`** (`Number`, required): The rect start Y coordinate. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`width`** (`Number`, required): The rect width. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`height`** (`Number`, required): The rect height. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`radius`** (`Number` , rest, optional): The rect radius. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$drawRect` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `radius` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$drawRect[value;value;value;5;5]
```

**Full form (all arguments)**

```fs
$drawRect[value;value;value;5;5;5;5;5]
```

## Reference implementation (source)

Taken from `src/functions/drawing/drawRect.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name);
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        if (!style?.length && (t === FillOrStrokeOrClear.fill || t === FillOrStrokeOrClear.stroke))
            return this.customError(ForgeCanvasError.NoStyle);

        const s = await resolveStyle(this, ctx, canvas, style);
        if (s instanceof Return) return s;

        canvas.ctx[t === FillOrStrokeOrClear.fill ? 'fillStyle' : 'strokeStyle'] = s;
        canvas.rect(
            t, x, y,
            width, height,
            radius.length === 1
                ? radius[0] : radius
        );

        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$placeRect`, `$rectangle`, `$rect` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`canvas`, `style`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$drawImage`]($drawImage.md)
- [`$drawImageArea`]($drawImageArea.md)
- [`$drawText`]($drawText.md)
- [`$putPixels`]($putPixels.md)

**Source:** [`src/functions/drawing/drawRect.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/drawing/drawRect.ts)

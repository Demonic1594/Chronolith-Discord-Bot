# $rotate

> Sets the rotation in the canvas

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `transform` | v1.0.0 | required | yes | — |

> aliases: $rotateCanvas, $rotation

## Signature

```fs
$rotate[canvas;angle]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `angle` | `Number` | **yes** | no | The rotation angle |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`angle`** (`Number`, required): The rotation angle. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$rotate` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$rotate[value]
```

**Full form (all arguments)**

```fs
$rotate[value;5]
```

## Reference implementation (source)

Taken from `src/functions/transform/rotate.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name);
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        canvas.rotate(angle);
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$rotateCanvas`, `$rotation` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`canvas`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$getTransform`]($getTransform.md)
- [`$resetTransform`]($resetTransform.md)
- [`$scale`]($scale.md)
- [`$setTransform`]($setTransform.md)
- [`$transform`]($transform.md)
- [`$translate`]($translate.md)

**Source:** [`src/functions/transform/rotate.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/transform/rotate.ts)

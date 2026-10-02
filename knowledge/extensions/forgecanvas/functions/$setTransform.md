# $setTransform

> Sets the current transformation

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `transform` | v1.0.0 | required | yes | — |

## Signature

```fs
$setTransform[canvas;a;b;c;d;e;f]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `a` | `Number` | **yes** | no | The cell in the first row and first column of the matrix |
| 3 | `b` | `Number` | **yes** | no | The cell in the second row and first column of the matrix |
| 4 | `c` | `Number` | **yes** | no | The cell in the first row and second column of the matrix |
| 5 | `d` | `Number` | **yes** | no | The cell in the second row and second column of the matrix |
| 6 | `e` | `Number` | **yes** | no | The cell in the first row and third column of the matrix |
| 7 | `f` | `Number` | **yes** | no | The cell in the second row and third column of the matrix |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`a`** (`Number`, required): The cell in the first row and first column of the matrix. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`b`** (`Number`, required): The cell in the second row and first column of the matrix. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`c`** (`Number`, required): The cell in the first row and second column of the matrix. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`d`** (`Number`, required): The cell in the second row and second column of the matrix. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`e`** (`Number`, required): The cell in the first row and third column of the matrix. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`f`** (`Number`, required): The cell in the second row and third column of the matrix. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$setTransform` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setTransform[value;5;5;5;5;5]
```

**Full form (all arguments)**

```fs
$setTransform[value;5;5;5;5;5;5]
```

## Reference implementation (source)

Taken from `src/functions/transform/setTransform.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name);
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        canvas.ctx.setTransform(...matrix);
        return this.success();
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`canvas`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$getTransform`]($getTransform.md)
- [`$resetTransform`]($resetTransform.md)
- [`$rotate`]($rotate.md)
- [`$scale`]($scale.md)
- [`$transform`]($transform.md)
- [`$translate`]($translate.md)

**Source:** [`src/functions/transform/setTransform.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/transform/setTransform.ts)

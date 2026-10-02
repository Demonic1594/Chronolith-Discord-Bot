# $renderCanvasComponent

> Renders a Canvas Component on the provided coordinates

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `helper` | v1.3.0 | required | yes | — |

> aliases: $renderComponent

## Signature

```fs
$renderCanvasComponent[canvas;component;x;y;options]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `component` | `String` | **yes** | no | Name of the component |
| 3 | `x` | `Number` | **yes** | no | The X coordinate |
| 4 | `y` | `Number` | **yes** | no | The Y coordinate |
| 5 | `options` | `String` | no | yes | The options of the component |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`component`** (`String`, required): Name of the component. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`x`** (`Number`, required): The X coordinate. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`y`** (`Number`, required): The Y coordinate. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`options`** (`String` , rest, optional): The options of the component. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$renderCanvasComponent` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `options` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$renderCanvasComponent[value;value;5]
```

**Full form (all arguments)**

```fs
$renderCanvasComponent[value;value;5;5;value]
```

## Reference implementation (source)

Taken from `src/functions/helper/renderCanvasComponent.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name);
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);
        const cctx = canvas.ctx;

        const component = ForgeCanvas.components.get(name);
        if (!component) return this.customError(ForgeCanvasError.NoComponent);

        let oldmatrix: DOMMatrix | undefined;
        if (x || y) {
            oldmatrix = cctx.getTransform();
            cctx.translate(x, y);
        }

        const canvasManager = ctx.canvasManager!;

        const previous = canvasManager.current;
        canvasManager.current = canvas;

        const context = ctx.clone({
            data: component.compiled ?? Compiler.compile(component.data.code, component.data.path),
            doNotSend: true,
            allowTopLevelReturn: true
        });

        context.canvasManager = canvasManager;
        context.imageManager = ctx.imageManager;
        context.gradientManager = ctx.gradientManager;
        context.gifManager = ctx.gifManager;
        context.lottieManager = ctx.lottieManager;
        context.neuquantManager = ctx.neuquantManager;

        const params = Array.isArray(component.data.params) ? component.data.params : [];
        const required = params.filter(param => typeof param === 'string' || param.required !== false);

        if (options.length < required.length)
            return this.customError(
                `Calling custom function ${this.data.name} requires ${required.length} argument${required.length > 1 ? 's' : ''}, received ${options.length}`
            );

        for (let i = 0, len = params.length; i < len; i++) {
            const param = params[i];
            const name = typeof param === 'string' ? param : param.name;
            context.setEnvironmentKey(name, options[i]);
        }

        const r = await Interpreter.run(context);

        canvasManager.current = previous;
        if (oldmatrix) cctx.setTransform(oldmatrix);

        return r === null ? this.stop() : this.success(r);
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$renderComponent` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`canvas`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$barData`]($barData.md)
- [`$barOptions`]($barOptions.md)
- [`$drawProgressBar`]($drawProgressBar.md)
- [`$rectAlign`]($rectAlign.md)
- [`$rectBaseline`]($rectBaseline.md)

**Source:** [`src/functions/helper/renderCanvasComponent.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/helper/renderCanvasComponent.ts)

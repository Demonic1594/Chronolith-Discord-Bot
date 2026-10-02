# $drawProgressBar

> Creates and draws progress bars on a canvas

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `helper` | v1.2.0 | required | yes | — |

## Signature

```fs
$drawProgressBar[canvas;x;y;width;height;config]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `x` | `Number` | **yes** | no | The X coordinate |
| 3 | `y` | `Number` | **yes** | no | The Y coordinate |
| 4 | `width` | `Number` | **yes** | no | The width |
| 5 | `height` | `Number` | **yes** | no | The height |
| 6 | `config` | `String` | **yes** | no | The progress bar configuration |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`x`** (`Number`, required): The X coordinate. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`y`** (`Number`, required): The Y coordinate. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`width`** (`Number`, required): The width. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`height`** (`Number`, required): The height. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`config`** (`String`, required): The progress bar configuration. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$drawProgressBar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$drawProgressBar[value;5;5;5;5]
```

**Full form (all arguments)**

```fs
$drawProgressBar[value;5;5;5;5;value]
```

## Reference implementation (source)

Taken from `src/functions/helper/drawProgressBar.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name);
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        const data: BarData[] = (ctx.getEnvironmentKey('progressBarData') ?? []) as BarData[];
        const options = (ctx.getEnvironmentKey('progressBarOptions') ?? {}) as BarOptions;
        const type = options.type ?? 'normal';

        const background = await resolveStyle(
            this, ctx, canvas,
            options['background-style'] ?? '#0'
        );
        if (background instanceof Return) return background;

        let res: any;
        if (type === 'normal') {
            const progress = data[0];
            if (!progress) return this.customError(ForgeCanvasError.NoBarData);

            const style = await resolveStyle(
                this, ctx, canvas,
                progress.style as string ?? '#0'
            );
            if (style instanceof Return) return style;

            res = canvas.drawProgressBar(
                x, y, width, height,
                progress.value,
                {
                    style: style,
                    background: {
                        enabled: Object.keys(options)
                            .find(x => x.startsWith('background')) !== undefined,
                        style: background,
                        radius: options['background-radius'],
                        padding: options['background-padding'],
                        type: options['background-type']
                    },
                    type: options['draw-type'],
                    radius: options.radius,
                    direction: options.direction,
                    clip: options['clip-radius'],
                    left: options.left,
                    leftType: options['left-type']
                }
            );
        } else {
            res = canvas.drawPieChart(
                x, y, width, height,
                data,
                {
                    type: options['draw-type'] === 'clear' ? 'fill' : options['draw-type'],
                    background: {
                        enabled: Object.keys(options)
                            .find(x => x.startsWith('background')) !== undefined,
                        style: background,
                        radius: options['background-radius'],
                        padding: options['background-padding'],
                        type: options['background-type']
                    },
                    radius: Array.isArray(options.radius)
                        ? options.radius[0] : options.radius ?? 0,
                    left: options.left
                }
            );
        };

        ctx.deleteEnvironmentKey('progressBarData');
        return this.success(res ? JSON.stringify(res) : undefined);
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`canvas`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$barData`]($barData.md)
- [`$barOptions`]($barOptions.md)
- [`$rectAlign`]($rectAlign.md)
- [`$rectBaseline`]($rectBaseline.md)
- [`$renderCanvasComponent`]($renderCanvasComponent.md)

**Source:** [`src/functions/helper/drawProgressBar.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/helper/drawProgressBar.ts)

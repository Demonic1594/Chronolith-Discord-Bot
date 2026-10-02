# $barOptions

> Sets options for progress bars

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `helper` | v1.2.0 | required | yes | — |

## Signature

```fs
$barOptions[options]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `options` | `String` | **yes** | yes | Options (type:normal/ratio/pie, draw-type:fill/stroke/clear/none, background-style:color/gradient/pattern, background-radius:number, background-padding:number, background-type:fill/stroke/clear/none, radius:number, direction:horizontal/vertical, clip-radius:number, left:number) |

### Per-parameter notes

- **`options`** (`String` , rest, required): Options (type:normal/ratio/pie, draw-type:fill/stroke/clear/none, background-style:color/gradient/pattern, background-radius:number, background-padding:number, background-type:fill/stroke/clear/none, radius:number, direction:horizontal/vertical, clip-radius:number, left:number). Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$barOptions` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `options` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$barOptions[value]
```

## Reference implementation (source)

Taken from `src/functions/helper/barOptions.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const opts = options.map(x => {
            const args = x.trim().split(':');
            return [args[0], args.slice(1)];
        }) as [string, string[]];
        const barOptions = (ctx.getEnvironmentKey('progressBarOptions') ?? {}) as BarOptions;

        for (const [option, val] of opts) {
            const value = val as unknown as string[];
            switch (option) {
                case 'type':
                    if (![ 'normal', 'pie', 'none' ].includes(value[0]))
                        return this.customError(ForgeCanvasError.InvalidBarType);

                    barOptions.type = value[0] !== 'none'
                        ? value[0] as any : undefined;
                    break;
                case 'draw-type':
                    if (!['fill', 'stroke', 'clear', 'none'].includes(value[0]))
                        return this.customError(ForgeCanvasError.InvalidRectType);

                    barOptions['draw-type'] = value[0] !== 'none'
                        ? value[0] as any : undefined;
                    break;
                case 'background-style':
                    barOptions['background-style'] = value[0] !== 'none'
                        ? value.join(':') : undefined;
                    break;
                case 'background-radius': {
                    const rad = value.map(x => Number.parseFloat(x));
                    barOptions[option] = value[0] !== 'none'
                        ? rad.length === 1 ? rad[0] : rad
                        : undefined;
                    break;
                }
                case 'background-padding':
                    barOptions['background-padding'] = value[0] !== 'none'
                        ? Number.parseFloat(value[0]) : undefined;
                    break;
                case 'background-type':
                    if (!['fill', 'stroke', 'clear', 'none'].includes(value[0]))
                        return this.customError(ForgeCanvasError.InvalidRectType);

                    barOptions['background-type'] = value[0] !== 'none'
                        ? value[0] as any : undefined;
                    break;
                case 'radius': {
                    const r = value.map(x => Number.parseFloat(x));
                    barOptions.radius = value[0] !== 'none'
                        ? r.length === 1 ? r[0] : r
                        : undefined;
                    break;
                }
                case 'direction':
                    if (!['horizontal', 'vertical', 'none'].includes(value[0]))
                        return this.customError(ForgeCanvasError.InvalidBarDirection);

                    barOptions.direction = value[0] !== 'none'
                        ? value[0] as any : undefined;
                    break;
                case 'clip-radius': {
                    const clip = value.map(x => Number.parseFloat(x));
                    barOptions['clip-radius'] = value[0] !== 'none'
                        ? clip.length === 1 ? clip[0] : clip
                        : undefined;
                    break;
                }
                case 'left':
                    barOptions.left = value[0] !== 'none'
                        ? value.join(':') : undefined;
                    break;
                case 'left-type':
                    if (!['fill', 'stroke', 'clear', 'none'].includes(value[0]))
                        return this.customError(ForgeCanvasError.InvalidRectType);

                    barOptions['left-type'] = value[0] !== 'none'
                        ? value[0] as any : undefined;
                    break;
                default: return this.customError(`Unknown bar option: ${option}`);
            };
        };

        ctx.setEnvironmentKey('progressBarOptions', barOptions);
        return this.success();
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$barData`]($barData.md)
- [`$drawProgressBar`]($drawProgressBar.md)
- [`$rectAlign`]($rectAlign.md)
- [`$rectBaseline`]($rectBaseline.md)
- [`$renderCanvasComponent`]($renderCanvasComponent.md)

**Source:** [`src/functions/helper/barOptions.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/helper/barOptions.ts)

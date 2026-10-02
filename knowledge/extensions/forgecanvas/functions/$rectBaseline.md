# $rectBaseline

> Sets or returns the rect/image baseline

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `helper` | v1.0.0 | optional | yes | — |

> aliases: $imageBaseline

## Signature

```fs
$rectBaseline[canvas;baseline]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `baseline` | `Enum` | no | no | The new baseline |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`baseline`** (`Enum`, optional): The new baseline. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$rectBaseline` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$rectBaseline[value]
```

**Full form (all arguments)**

```fs
$rectBaseline[value;value]
```

## Reference implementation (source)

Taken from `src/functions/helper/rectBaseline.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name);
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        return this.success(baseline !== null
            ? (
                canvas.customProperties.rectBaseline = (
                    typeof baseline === 'number' ? RectBaseline[baseline] : baseline
                ) as unknown as RectBaseline, undefined
            ) : typeof canvas.customProperties?.rectBaseline === 'number'
                ? RectBaseline[canvas.customProperties.rectBaseline]
                : canvas.customProperties.rectBaseline
        );
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$imageBaseline` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`canvas`, `baseline`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$barData`]($barData.md)
- [`$barOptions`]($barOptions.md)
- [`$drawProgressBar`]($drawProgressBar.md)
- [`$rectAlign`]($rectAlign.md)
- [`$renderCanvasComponent`]($renderCanvasComponent.md)

**Source:** [`src/functions/helper/rectBaseline.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/helper/rectBaseline.ts)

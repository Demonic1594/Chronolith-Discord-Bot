# $imageSmoothing

> Sets or returns the image smoothing in a canvas

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `image` | v1.0.0 | optional | yes | — |

> aliases: $imageSmooth

## Signature

```fs
$imageSmoothing[canvas;enabled]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `enabled` | `Boolean` | no | no | Determines whether scaled images are smoothed or not |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`enabled`** (`Boolean`, optional): Determines whether scaled images are smoothed or not. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

See the function list below for exact signatures.

`$imageSmoothing` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$imageSmoothing[value]
```

**Full form (all arguments)**

```fs
$imageSmoothing[value;true]
```

## Reference implementation (source)

Taken from `src/functions/image/imageSmoothing.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name)?.ctx;
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        return this.success(enabled !== null && enabled !== undefined
            ? (canvas.imageSmoothingEnabled = enabled, undefined)
            : canvas.imageSmoothingEnabled
        );
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$imageSmooth` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`canvas`, `enabled`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$attachImage`]($attachImage.md)
- [`$deleteImage`]($deleteImage.md)
- [`$imageBuffer`]($imageBuffer.md)
- [`$imageSize`]($imageSize.md)
- [`$loadImage`]($loadImage.md)
- [`$loadImageOptions`]($loadImageOptions.md)
- [`$preloadImage`]($preloadImage.md)

**Source:** [`src/functions/image/imageSmoothing.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/image/imageSmoothing.ts)

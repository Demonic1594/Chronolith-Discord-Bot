# $deleteCanvas

> Deletes the canvas

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `canvas` | v1.0.0 | required | yes | — |

> aliases: $removeCanvas

## Signature

```fs
$deleteCanvas[name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | Name of the canvas |

### Per-parameter notes

- **`name`** (`String`, required): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$deleteCanvas` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteCanvas[name]
```

## Reference implementation (source)

Taken from `src/functions/canvas/deleteCanvas.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.canvasManager?.remove(name);
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$removeCanvas` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$attachCanvas`]($attachCanvas.md)
- [`$canvasBuffer`]($canvasBuffer.md)
- [`$canvasDataUrl`]($canvasDataUrl.md)
- [`$canvasSize`]($canvasSize.md)
- [`$createCanvas`]($createCanvas.md)
- [`$resizeCanvas`]($resizeCanvas.md)
- [`$saveCanvas`]($saveCanvas.md)
- [`$cropCanvas`]($cropCanvas.md)

**Source:** [`src/functions/canvas/deleteCanvas.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/canvas/deleteCanvas.ts)

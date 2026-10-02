# $fontVariantCaps

> Sets or returns the capitalization of the text

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `text` | v1.1.0 | optional | yes | — |

> aliases: $fontCaps

## Signature

```fs
$fontVariantCaps[canvas;type]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `type` | `Enum` | no | no | The new alternative capitalization |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`type`** (`Enum`, optional): The new alternative capitalization. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$fontVariantCaps` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$fontVariantCaps[value]
```

**Full form (all arguments)**

```fs
$fontVariantCaps[value;value]
```

## Reference implementation (source)

Taken from `src/functions/text/fontVariantCaps.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name)?.ctx;
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        return this.success(t !== null && t !== undefined
            ? (canvas.fontVariantCaps = (typeof t === 'number'
                ? FontVariantCaps[t]
                : t
            ) as CanvasFontVariantCaps, undefined) : canvas.fontVariantCaps
        );
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$fontCaps` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`canvas`, `type`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$fontFamilies`]($fontFamilies.md)
- [`$letterSpacing`]($letterSpacing.md)
- [`$measureText`]($measureText.md)
- [`$registerFont`]($registerFont.md)
- [`$textAlign`]($textAlign.md)
- [`$textBaseline`]($textBaseline.md)
- [`$wordSpacing`]($wordSpacing.md)

**Source:** [`src/functions/text/fontVariantCaps.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/text/fontVariantCaps.ts)

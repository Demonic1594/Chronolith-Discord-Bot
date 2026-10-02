# $NQindexOf

> Finds the best-matching index in the color map

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `neuquant` | v1.2.1 | required | yes | — |

## Signature

```fs
$NQindexOf[name;r;g;b;a]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | Name of the NeuQuant instance |
| 2 | `r` | `Number` | **yes** | no | The red value |
| 3 | `g` | `Number` | **yes** | no | The green value |
| 4 | `b` | `Number` | **yes** | no | The blue value |
| 5 | `a` | `Number` | **yes** | no | The alpha value |

### Per-parameter notes

- **`name`** (`String`, required): Name of the NeuQuant instance. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`r`** (`Number`, required): The red value. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`g`** (`Number`, required): The green value. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`b`** (`Number`, required): The blue value. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`a`** (`Number`, required): The alpha value. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$NQindexOf` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$NQindexOf[name;5;5;5;5]
```

## Reference implementation (source)

Taken from `src/functions/neuquant/NQindexOf.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const nq = ctx.neuquantManager?.get(name);
        if (!nq) return this.customError(ForgeCanvasError.NoNeuQuant);

        return this.success(nq.indexOf(Uint8Array.from([r, g, b, a])));
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorMapRgb`]($colorMapRgb.md)
- [`$colorMapRgba`]($colorMapRgba.md)
- [`$newNeuQuant`]($newNeuQuant.md)
- [`$NQlookup`]($NQlookup.md)
- [`$NQmapPixel`]($NQmapPixel.md)

**Source:** [`src/functions/neuquant/NQindexOf.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/neuquant/NQindexOf.ts)

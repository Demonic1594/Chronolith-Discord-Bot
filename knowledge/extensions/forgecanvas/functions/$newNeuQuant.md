# $newNeuQuant

> Creates a new NeuQuant instance

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `neuquant` | v1.2.1 | required | yes | — |

> aliases: $createNeuQuant, $NeuQuant

## Signature

```fs
$newNeuQuant[name;sample;maxColors;pixels]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | Name of the new NeuQuant instance |
| 2 | `sample` | `Number` | **yes** | no | Sample factor |
| 3 | `maxColors` | `Number` | **yes** | no | Maximum number of colors |
| 4 | `pixels` | `Json` | **yes** | no | The pixels |

### Per-parameter notes

- **`name`** (`String`, required): Name of the new NeuQuant instance. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`sample`** (`Number`, required): Sample factor. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`maxColors`** (`Number`, required): Maximum number of colors. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`pixels`** (`Json`, required): The pixels. Expects a JSON string. Parsed with ForgeScript's lenient `parseJSON`; invalid JSON is rejected.

## How it works

See the function list below for exact signatures.

`$newNeuQuant` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$newNeuQuant[name;5;5;{"key":"value"}]
```

## Reference implementation (source)

Taken from `src/functions/neuquant/newNeuQuant.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        if (!ctx.neuquantManager || !(ctx.neuquantManager instanceof NeuQuantManager))
            ctx.neuquantManager = new NeuQuantManager();

        ctx.neuquantManager.set(
            name,
            new NeuQuant(
                sample, maxColors,
                Uint8Array.from(pixels as unknown as number[])
            )
        );
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$createNeuQuant`, `$NeuQuant` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorMapRgb`]($colorMapRgb.md)
- [`$colorMapRgba`]($colorMapRgba.md)
- [`$NQindexOf`]($NQindexOf.md)
- [`$NQlookup`]($NQlookup.md)
- [`$NQmapPixel`]($NQmapPixel.md)

**Source:** [`src/functions/neuquant/newNeuQuant.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/neuquant/newNeuQuant.ts)

# $indexedToRgba

> Converts indexed pixels to RGBA

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `util` | v1.2.1 | required | yes | — |

## Signature

```fs
$indexedToRgba[palette;transparent;pixels]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `palette` | `Json` | **yes** | no | The palette to use for the conversion |
| 2 | `transparent` | `Number` | no | no | The index of the transparent color in the palette |
| 3 | `pixels` | `Number` | **yes** | yes | The pixels to convert into RGBA |

### Per-parameter notes

- **`palette`** (`Json`, required): The palette to use for the conversion. Expects a JSON string. Parsed with ForgeScript's lenient `parseJSON`; invalid JSON is rejected.
- **`transparent`** (`Number`, optional): The index of the transparent color in the palette. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`pixels`** (`Number` , rest, required): The pixels to convert into RGBA. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$indexedToRgba` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `pixels` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$indexedToRgba[{"key":"value"};5]
```

**Full form (all arguments)**

```fs
$indexedToRgba[{"key":"value"};5;5]
```

## Reference implementation (source)

Taken from `src/functions/util/indexedToRgba.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        try {
            const res = indexedToRgba(
                Uint8Array.from(pixels),
                Uint8Array.from(palette as unknown as number[]),
                transparent
            );
            return this.success(`[${res.join(', ')}]`);
        } catch(e) {
            return this.customError((e as any).toString());
        }
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`transparent`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$canvasVersion`]($canvasVersion.md)
- [`$clearCanvasCache`]($clearCanvasCache.md)
- [`$compositeOperation`]($compositeOperation.md)
- [`$filter`]($filter.md)
- [`$getPixels`]($getPixels.md)
- [`$hexToRgb`]($hexToRgb.md)
- [`$hexToRgba`]($hexToRgba.md)
- [`$indexedToHex`]($indexedToHex.md)

**Source:** [`src/functions/util/indexedToRgba.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/util/indexedToRgba.ts)

# $hexToRgb

> Converts HEX into RGB

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `util` | v1.2.1 | required | yes | — |

## Signature

```fs
$hexToRgb[hex]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `hex` | `String` | **yes** | yes | The hex to convert into RGB |

### Per-parameter notes

- **`hex`** (`String` , rest, required): The hex to convert into RGB. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$hexToRgb` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `hex` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$hexToRgb[value]
```

## Reference implementation (source)

Taken from `src/functions/util/hexToRgb.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        try {
            const res = hexToRgb(hex);
            return this.success(`[${res.join(', ')}]`);
        } catch(e) {
            return this.customError((e as any).toString());
        }
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$canvasVersion`]($canvasVersion.md)
- [`$clearCanvasCache`]($clearCanvasCache.md)
- [`$compositeOperation`]($compositeOperation.md)
- [`$filter`]($filter.md)
- [`$getPixels`]($getPixels.md)
- [`$hexToRgba`]($hexToRgba.md)
- [`$indexedToHex`]($indexedToHex.md)
- [`$indexedToRgba`]($indexedToRgba.md)

**Source:** [`src/functions/util/hexToRgb.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/util/hexToRgb.ts)

# $clearCanvasCache

> Clears all canvas caches

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `util` | v1.3.0 | optional | no | — |

## Signature

```fs
$clearCanvasCache
```

## How it works

See the function list below for exact signatures.

`$clearCanvasCache` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (optional).

## Examples

```fs
$clearCanvasCache
```

## Reference implementation (source)

Taken from `src/functions/util/clearCanvasCache.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const preloaded = ctx.client.preloadImages;
        preloaded.map.forEach((x, k) => {
            if (cacheRegex.test(k)) { // @ts-ignore
                x = undefined;
                return preloaded.map.delete(k);
            }
        });

        charWidthCache.clear();
        wordWidthCache.clear();
        clearAllCache();
        return this.success();
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$canvasVersion`]($canvasVersion.md)
- [`$compositeOperation`]($compositeOperation.md)
- [`$filter`]($filter.md)
- [`$getPixels`]($getPixels.md)
- [`$hexToRgb`]($hexToRgb.md)
- [`$hexToRgba`]($hexToRgba.md)
- [`$indexedToHex`]($indexedToHex.md)
- [`$indexedToRgba`]($indexedToRgba.md)

**Source:** [`src/functions/util/clearCanvasCache.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/util/clearCanvasCache.ts)

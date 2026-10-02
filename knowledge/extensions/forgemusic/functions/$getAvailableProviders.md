# $getAvailableProviders

> Get the available audio providers.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMusic | `other` | v1.0.0 | none | no | `String` |

## Signature

```fs
$getAvailableProviders
```

## How it works

Uncategorized utilities.

`$getAvailableProviders` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$getAvailableProviders
```

## Reference implementation (source)

Taken from `src/natives/getAvailableProviders.ts` in the `ForgeMusic` repository — this is exactly what runs:

```ts
execute(...) {
        const names = [...useMainPlayer().extractors.store.values()]
        .map((x) => x.constructor.name.replace("Extractor", "").replace(/[^a-zA-Z+]/g, ""))

        return this.success(names.join(","))
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$clearQueue`]($clearQueue.md)
- [`$clearQueueHistory`]($clearQueueHistory.md)
- [`$currentTrackTotalDuration`]($currentTrackTotalDuration.md)
- [`$deleteQueue`]($deleteQueue.md)
- [`$disableAllFilters`]($disableAllFilters.md)
- [`$enableAllFilters`]($enableAllFilters.md)
- [`$getDisabledFilters`]($getDisabledFilters.md)
- [`$getEnabledFilters`]($getEnabledFilters.md)

**Source:** [`src/natives/getAvailableProviders.ts`](https://github.com/tryforge/ForgeMusic/blob/main/src/natives/getAvailableProviders.ts)

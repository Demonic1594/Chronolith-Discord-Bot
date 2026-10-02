# $playerElapsedTime

> Returns the elapsed time of the current song in milliseconds.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMusic | `other` | v1.0.0 | none | no | `Number` |

## Signature

```fs
$playerElapsedTime
```

## How it works

Uncategorized utilities.

`$playerElapsedTime` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$playerElapsedTime
```

## Reference implementation (source)

Taken from `src/natives/playerElapsedTime.ts` in the `ForgeMusic` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(getNode(ctx)?.getTimestamp().progress * 1000)
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
- [`$getAvailableProviders`]($getAvailableProviders.md)
- [`$getDisabledFilters`]($getDisabledFilters.md)

**Source:** [`src/natives/playerElapsedTime.ts`](https://github.com/tryforge/ForgeMusic/blob/main/src/natives/playerElapsedTime.ts)

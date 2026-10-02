# $toggleFilters

> Toggle the provided FFMPEG filters.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMusic | `other` | v1.0.0 | required | yes | — |

## Signature

```fs
$toggleFilters[Filters]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `Filters` | `Enum` | no | yes | Filter names to be toggled. |

### Per-parameter notes

- **`Filters`** (`Enum` , rest, optional): Filter names to be toggled.. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Uncategorized utilities.

`$toggleFilters` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `Filters` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$toggleFilters[value]
```

## Reference implementation (source)

Taken from `src/natives/toggleFilters.ts` in the `ForgeMusic` repository — this is exactly what runs:

```ts
execute(...) {
        const queue = useQueue(ctx.guild)
        if (!queue) {
            return this.customError("No queue found.")
        }
        
        const allFilters = queue.filters.ffmpeg.getFiltersEnabled().concat(queue.filters.ffmpeg.getFiltersDisabled())

        for (const filter of filters) {
            const foundFilter = allFilters.find((fil) => fil.toLowerCase() === filter.toLowerCase())
            await queue.filters.ffmpeg.toggle(foundFilter);
        }

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$clearQueue`]($clearQueue.md)
- [`$clearQueueHistory`]($clearQueueHistory.md)
- [`$currentTrackTotalDuration`]($currentTrackTotalDuration.md)
- [`$deleteQueue`]($deleteQueue.md)
- [`$disableAllFilters`]($disableAllFilters.md)
- [`$enableAllFilters`]($enableAllFilters.md)
- [`$getAvailableProviders`]($getAvailableProviders.md)
- [`$getDisabledFilters`]($getDisabledFilters.md)

**Source:** [`src/natives/toggleFilters.ts`](https://github.com/tryforge/ForgeMusic/blob/main/src/natives/toggleFilters.ts)

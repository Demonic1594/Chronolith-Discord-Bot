# $skipTo

> Skip the current track to the given position.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMusic | `other` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$skipTo[Position]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `Position` | `Number` | **yes** | no | The track position to be played. |

### Per-parameter notes

- **`Position`** (`Number`, required): The track position to be played.. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Uncategorized utilities.

`$skipTo` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$skipTo[5]
```

## Reference implementation (source)

Taken from `src/natives/skipTo.ts` in the `ForgeMusic` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(getNode(ctx)?.skipTo(position))
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

**Source:** [`src/natives/skipTo.ts`](https://github.com/tryforge/ForgeMusic/blob/main/src/natives/skipTo.ts)

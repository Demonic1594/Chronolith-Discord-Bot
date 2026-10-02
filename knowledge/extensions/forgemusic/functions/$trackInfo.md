# $trackInfo

> Returns information of the current track.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMusic | `other` | v1.0.0 | required | yes | `String` |

## Signature

```fs
$trackInfo[Properties]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `Properties` | `String` | no | yes | The track properties to be accesed. |

### Per-parameter notes

- **`Properties`** (`String` , rest, optional): The track properties to be accesed.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Uncategorized utilities.

`$trackInfo` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `Properties` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$trackInfo[value]
```

## Reference implementation (source)

Taken from `src/natives/trackInfo.ts` in the `ForgeMusic` repository — this is exactly what runs:

```ts
execute(...) {
        const queue = useQueue(ctx.guild)
        if (!queue) {
            return this.customError("No queue found.")
        }

        const track = queue.currentTrack
        ctx.setEnvironmentKey("myTrack", track)
        
        const got = ctx.getEnvironmentKey(...["myTrack", ...properties])
        ctx.deleteEnvironmentKey("myTrack")

        return this.success(got)
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

**Source:** [`src/natives/trackInfo.ts`](https://github.com/tryforge/ForgeMusic/blob/main/src/natives/trackInfo.ts)

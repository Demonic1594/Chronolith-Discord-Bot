# $queue

> Returns queue songs resolving the given text placeholders.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMusic | `other` | v1.0.0 | optional | yes | `String` |

## Signature

```fs
$queue[Start Index;Limit;Text;Separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `Start Index` | `Number` | no | no | The queue song start index. |
| 2 | `Limit` | `Number` | no | no | The amount of queue songs to be retrieved. |
| 3 | `Text` | `String` | no | no | The text to be resolved. |
| 4 | `Separator` | `String` | no | no | The separator for each result. |

### Per-parameter notes

- **`Start Index`** (`Number`, optional): The queue song start index.. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`Limit`** (`Number`, optional): The amount of queue songs to be retrieved.. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`Text`** (`String`, optional): The text to be resolved.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`Separator`** (`String`, optional): The separator for each result.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Uncategorized utilities.

`$queue` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$queue[5]
```

**Full form (all arguments)**

```fs
$queue[5;5;Hello!;,]
```

## Reference implementation (source)

Taken from `src/natives/queue.ts` in the `ForgeMusic` repository — this is exactly what runs:

```ts
execute(...) {
        const queue = useQueue(ctx.guild)
        if (!queue) {
            return this.customError("No queue found.")
        }
        
        const tracks = queue.tracks.data

        text ||= "{position} {track.title} | <@{track.requestedBy.username}>"

        const results = tracks.slice(index ?? 0, limit ?? undefined)
        .map((_, i) => text.replace(/\{position\}/g, String(i + 1)))
        .map((song, i) => {
            const matches = song.match(PLACEHOLDER_PATTERN) ?? []
            const context = createContext({ track: tracks[i] })

            for (const match of matches) {
                const placeholderValue = match.slice(1, -1)
                const result = runInContext(placeholderValue, context)
                song = song.replace(new RegExp(match, "g"), result)
            }

            return song
        })
        
        return this.success(results.join(separator || ","))
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`Start Index`, `Limit`, `Text`, `Separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/natives/queue.ts`](https://github.com/tryforge/ForgeMusic/blob/main/src/natives/queue.ts)

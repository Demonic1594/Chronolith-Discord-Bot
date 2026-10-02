# $searchTrack

> Search for a track using the given query.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMusic | `other` | v1.0.0 | required | yes | — |

## Signature

```fs
$searchTrack[Query;Text Result;Separator;Engine;Fallback Engine;Limit;Add To Player;Block Extractors]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `Query` | `String` | **yes** | no | The query to search for. |
| 2 | `Text Result` | `String` | **yes** | no | The formatted text result to return. |
| 3 | `Separator` | `String` | no | no | The result separator. |
| 4 | `Engine` | `String` | no | no | The query search engine, can be extractor name to target an specific one. (custom) |
| 5 | `Fallback Engine` | `Enum` | no | no | Fallback search engine to use. |
| 6 | `Limit` | `Number` | no | no | The maximum number of results to return. |
| 7 | `Add To Player` | `Boolean` | no | no | Whether add the results to the music player. |
| 8 | `Block Extractors` | `String` | no | yes | List of extractors to block. |

### Per-parameter notes

- **`Query`** (`String`, required): The query to search for.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`Text Result`** (`String`, required): The formatted text result to return.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`Separator`** (`String`, optional): The result separator.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`Engine`** (`String`, optional): The query search engine, can be extractor name to target an specific one. (custom). Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`Fallback Engine`** (`Enum`, optional): Fallback search engine to use.. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`Limit`** (`Number`, optional): The maximum number of results to return.. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`Add To Player`** (`Boolean`, optional): Whether add the results to the music player.. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`Block Extractors`** (`String` , rest, optional): List of extractors to block.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Uncategorized utilities.

`$searchTrack` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `Block Extractors` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$searchTrack[query;Hello!]
```

**Full form (all arguments)**

```fs
$searchTrack[query;Hello!;,;value;value;5;true;value]
```

## Reference implementation (source)

Taken from `src/natives/searchTrack.ts` in the `ForgeMusic` repository — this is exactly what runs:

```ts
execute(...) {
        const searchResult = await ctx.client.getExtension(ForgeMusic).player.search(query, {
            searchEngine: engine as SearchQueryType | `ext:${string}`,
            fallbackSearchEngine: fallbackEngine,
            blockExtractors: blockedExtractors,
            requestedBy: ctx.user
        })

        const connectOptions = ctx.getExtension(ForgeMusic).connectOptions ?? {}
        const connectionOptionsUnion = {
            metadata: { text: ctx.channel },
            ...connectOptions
        }

        let tracks = searchResult.tracks
        if (limit && tracks.length > limit) tracks = tracks.slice(0, limit);

        const formattedTracks = tracks.map((_, i) => text.replace(/\{position\}/g, String(i + 1)))
        .map((trackText, i) => {
            const track = tracks[i]
            const matches = trackText.match(PLACEHOLDER_PATTERN) ?? []
            const context = createContext({ track })

            for (const match of matches) {
                const placeholderValue = match.slice(1, -1)
                const result = runInContext(placeholderValue, context)

                trackText = trackText.replace(new RegExp(match, "g"), result)
            }

            return trackText
        })

        if (addToPlayer && hasQueue(ctx)) useQueue(ctx.guild).addTrack(tracks);
        else if (addToPlayer && !hasQueue(ctx)) {
            const queue = await ctx.client.getExtension(ForgeMusic).player.queues.create(ctx.guild, connectionOptionsUnion)
            queue.addTrack(tracks)
        }

        return this.success(searchResult.tracks.length > 0 ? formattedTracks.join(separator ?? ",") : "")
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`Separator`, `Engine`, `Fallback Engine`, `Limit`, `Add To Player`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$clearQueue`]($clearQueue.md)
- [`$clearQueueHistory`]($clearQueueHistory.md)
- [`$currentTrackTotalDuration`]($currentTrackTotalDuration.md)
- [`$deleteQueue`]($deleteQueue.md)
- [`$disableAllFilters`]($disableAllFilters.md)
- [`$enableAllFilters`]($enableAllFilters.md)
- [`$getAvailableProviders`]($getAvailableProviders.md)
- [`$getDisabledFilters`]($getDisabledFilters.md)

**Source:** [`src/natives/searchTrack.ts`](https://github.com/tryforge/ForgeMusic/blob/main/src/natives/searchTrack.ts)

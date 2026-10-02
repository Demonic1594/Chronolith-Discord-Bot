# $playTrack

> Play a track by query.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMusic | `other` | v1.0.0 | required | yes | — |

## Signature

```fs
$playTrack[Channel ID;Query;Engine;Fallback Engine;Block Extractors]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `Channel ID` | `Channel` | **yes** | no | Voice channel ID to play the track on. |
| 2 | `Query` | `String` | **yes** | no | Track name to be searched. |
| 3 | `Engine` | `String` | no | no | The query search engine, can be extractor name to target an specific one. (custom) |
| 4 | `Fallback Engine` | `Enum` | no | no | Fallback search engine to use. |
| 5 | `Block Extractors` | `String` | no | yes | List of extractors to block. |

### Per-parameter notes

- **`Channel ID`** (`Channel`, required): Voice channel ID to play the track on.. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`Query`** (`String`, required): Track name to be searched.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`Engine`** (`String`, optional): The query search engine, can be extractor name to target an specific one. (custom). Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`Fallback Engine`** (`Enum`, optional): Fallback search engine to use.. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`Block Extractors`** (`String` , rest, optional): List of extractors to block.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Uncategorized utilities.

`$playTrack` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `Block Extractors` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$playTrack[123456789012345678;query]
```

**Full form (all arguments)**

```fs
$playTrack[123456789012345678;query;value;value;value]
```

## Reference implementation (source)

Taken from `src/natives/playTrack.ts` in the `ForgeMusic` repository — this is exactly what runs:

```ts
execute(...) {
        const player = useMainPlayer()
        const connectOptions = ctx.getExtension(ForgeMusic).connectOptions ?? {}
        const connectionOptionsUnion = {
            metadata: { text: ctx.channel },
            ...connectOptions
        }

        let executed = true
        const result = await player.play(<VoiceBasedChannel>voiceChannel, query, {
            nodeOptions: connectionOptionsUnion,
            searchEngine: searchEngine as (SearchQueryType | `ext:${string}`) | undefined,
            fallbackSearchEngine,
            blockExtractors,
            requestedBy: ctx.user
        }).catch((e) => {
            executed = false
            return e
        })

        return executed ? this.success() : this.error(result)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`Engine`, `Fallback Engine`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
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

**Source:** [`src/natives/playTrack.ts`](https://github.com/tryforge/ForgeMusic/blob/main/src/natives/playTrack.ts)

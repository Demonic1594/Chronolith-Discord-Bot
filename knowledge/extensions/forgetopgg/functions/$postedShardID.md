# $postedShardID

> The main shard id that was posted

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeTopGG | `other` | v1.0.0 | none | no | `Number` |

## Signature

```fs
$postedShardID
```

## How it works

Uncategorized utilities.

`$postedShardID` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$postedShardID
```

## Reference implementation (source)

Taken from `src/functions/postedShardID.ts` in the `ForgeTopGG` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success((ctx.runtime.extras as BotStats)?.shardId)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$hasVoted`]($hasVoted.md)
- [`$monthlyVotes`]($monthlyVotes.md)
- [`$postStatsError`]($postStatsError.md)
- [`$postedServerCount`]($postedServerCount.md)
- [`$postedShardCount`]($postedShardCount.md)
- [`$totalVotes`]($totalVotes.md)
- [`$voteBotID`]($voteBotID.md)
- [`$voteGuildID`]($voteGuildID.md)

**Source:** [`src/functions/postedShardID.ts`](https://github.com/tryforge/ForgeTopGG/blob/main/src/functions/postedShardID.ts)

# $voteType

> Returns the type of the vote (upvoted | test)

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeTopGG | `other` | v1.0.0 | none | no | `String` |

## Signature

```fs
$voteType
```

## How it works

Uncategorized utilities.

`$voteType` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$voteType
```

## Reference implementation (source)

Taken from `src/functions/voteType.ts` in the `ForgeTopGG` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success((ctx.runtime.extras as WebhookPayload)?.type)
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
- [`$postedShardID`]($postedShardID.md)
- [`$totalVotes`]($totalVotes.md)
- [`$voteBotID`]($voteBotID.md)

**Source:** [`src/functions/voteType.ts`](https://github.com/tryforge/ForgeTopGG/blob/main/src/functions/voteType.ts)

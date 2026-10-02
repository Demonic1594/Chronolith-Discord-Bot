# $monthlyVotes

> Gets total votes of the bot this month

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeTopGG | `other` | v1.0.0 | none | no | `Number` |

## Signature

```fs
$monthlyVotes
```

## How it works

Uncategorized utilities.

`$monthlyVotes` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$monthlyVotes
```

## Reference implementation (source)

Taken from `src/functions/monthlyVotes.ts` in the `ForgeTopGG` repository — this is exactly what runs:

```ts
execute(...) {
        const api = new Api(ctx.getExtension(ForgeTopGG, true)["options"].token)
        return this.success((await api.getBot(ctx.client.user.id).catch(ctx.noop))?.monthlyPoints)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$hasVoted`]($hasVoted.md)
- [`$postStatsError`]($postStatsError.md)
- [`$postedServerCount`]($postedServerCount.md)
- [`$postedShardCount`]($postedShardCount.md)
- [`$postedShardID`]($postedShardID.md)
- [`$totalVotes`]($totalVotes.md)
- [`$voteBotID`]($voteBotID.md)
- [`$voteGuildID`]($voteGuildID.md)

**Source:** [`src/functions/monthlyVotes.ts`](https://github.com/tryforge/ForgeTopGG/blob/main/src/functions/monthlyVotes.ts)

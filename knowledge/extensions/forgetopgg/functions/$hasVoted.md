# $hasVoted

> Checks whether a user has voted a bot

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeTopGG | `other` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$hasVoted[user ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `user ID` | `User` | **yes** | no | The user to check for vote |

### Per-parameter notes

- **`user ID`** (`User`, required): The user to check for vote. Expects a user ID. Must be a 16-23 digit snowflake; fetched via `client.users.fetch`.

## How it works

Uncategorized utilities.

`$hasVoted` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$hasVoted[123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/hasVoted.ts` in the `ForgeTopGG` repository — this is exactly what runs:

```ts
execute(...) {
        const api = new Api(ctx.getExtension(ForgeTopGG, true)["options"].token)
        return this.success(await api.hasVoted(user.id).catch(ctx.noop))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$monthlyVotes`]($monthlyVotes.md)
- [`$postStatsError`]($postStatsError.md)
- [`$postedServerCount`]($postedServerCount.md)
- [`$postedShardCount`]($postedShardCount.md)
- [`$postedShardID`]($postedShardID.md)
- [`$totalVotes`]($totalVotes.md)
- [`$voteBotID`]($voteBotID.md)
- [`$voteGuildID`]($voteGuildID.md)

**Source:** [`src/functions/hasVoted.ts`](https://github.com/tryforge/ForgeTopGG/blob/main/src/functions/hasVoted.ts)

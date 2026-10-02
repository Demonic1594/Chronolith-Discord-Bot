# $pollEnd

> Ends a poll

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `poll` | v1.5.0 | optional | yes | — |

> aliases: $endPoll

## Signature

```fs
$pollEnd[channel ID;message ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `TextChannel` | **yes** | no | The channel to get the message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to get the poll |

### Per-parameter notes

- **`channel ID`** (`TextChannel`, required): The channel to get the message from. Expects a textable channel ID. Same snowflake rules as Channel, but the channel must support messages (`.messages` present), otherwise rejected.
- **`message ID`** (`Message`, required): The message to get the poll. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Poll functions build and inspect Discord polls and their answers.

`$pollEnd` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$pollEnd[123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/poll/pollEnd.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(!!(await (msg ?? ctx.message)?.poll?.end().catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$endPoll` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$poll`]($poll.md)
- [`$pollAnswer`]($pollAnswer.md)
- [`$pollAnswerEmoji`]($pollAnswerEmoji.md)
- [`$pollAnswerID`]($pollAnswerID.md)
- [`$pollAnswerMessageID`]($pollAnswerMessageID.md)
- [`$pollAnswerText`]($pollAnswerText.md)
- [`$pollAnswerVoteCount`]($pollAnswerVoteCount.md)
- [`$pollAnswerVoterIDs`]($pollAnswerVoterIDs.md)

**Source:** [`src/native/poll/pollEnd.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/poll/pollEnd.ts)

# $pollAnswerVoteCount

> Can only be used in poll events, returns the vote count of this poll answer

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `poll` | v1.5.0 | none | no | `Number` |

## Signature

```fs
$pollAnswerVoteCount
```

## How it works

Poll functions build and inspect Discord polls and their answers.

`$pollAnswerVoteCount` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$pollAnswerVoteCount
```

## Reference implementation (source)

Taken from `src/native/poll/pollAnswerVoteCount.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.states?.poll?.new?.voteCount)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$poll`]($poll.md)
- [`$pollAnswer`]($pollAnswer.md)
- [`$pollAnswerEmoji`]($pollAnswerEmoji.md)
- [`$pollAnswerID`]($pollAnswerID.md)
- [`$pollAnswerMessageID`]($pollAnswerMessageID.md)
- [`$pollAnswerText`]($pollAnswerText.md)
- [`$pollAnswerVoterIDs`]($pollAnswerVoterIDs.md)
- [`$pollAnswers`]($pollAnswers.md)

**Source:** [`src/native/poll/pollAnswerVoteCount.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/poll/pollAnswerVoteCount.ts)

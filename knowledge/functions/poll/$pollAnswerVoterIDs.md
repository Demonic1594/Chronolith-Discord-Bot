# $pollAnswerVoterIDs

> Can only be used in poll events, returns the vote user ids of this poll answer

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `poll` | v1.5.0 | optional | yes | `User[]` |

## Signature

```fs
$pollAnswerVoterIDs[separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `separator` | `String` | no | no | The separator to use for every id |

### Per-parameter notes

- **`separator`** (`String`, optional): The separator to use for every id. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Poll functions build and inspect Discord polls and their answers.

`$pollAnswerVoterIDs` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$pollAnswerVoterIDs[,]
```

## Reference implementation (source)

Taken from `src/native/poll/pollAnswerVoterIDs.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.states?.poll?.new?.fetchVoters().then(x => x.map(x => x.id).join(sep ?? ", ")))
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$poll`]($poll.md)
- [`$pollAnswer`]($pollAnswer.md)
- [`$pollAnswerEmoji`]($pollAnswerEmoji.md)
- [`$pollAnswerID`]($pollAnswerID.md)
- [`$pollAnswerMessageID`]($pollAnswerMessageID.md)
- [`$pollAnswerText`]($pollAnswerText.md)
- [`$pollAnswerVoteCount`]($pollAnswerVoteCount.md)
- [`$pollAnswers`]($pollAnswers.md)

**Source:** [`src/native/poll/pollAnswerVoterIDs.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/poll/pollAnswerVoterIDs.ts)

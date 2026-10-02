# $pollAnswer

> Add a poll answer

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `poll` | v1.5.0 | required | yes | — |

## Signature

```fs
$pollAnswer[text;emoji]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `text` | `String` | **yes** | no | The answer's text |
| 2 | `emoji` | `String` | no | no | The emoji to use |

### Per-parameter notes

- **`text`** (`String`, required): The answer's text. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`emoji`** (`String`, optional): The emoji to use. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Poll functions build and inspect Discord polls and their answers.

`$pollAnswer` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$pollAnswer[Hello!]
```

**Full form (all arguments)**

```fs
$pollAnswer[Hello!;:smile:]
```

## Reference implementation (source)

Taken from `src/native/poll/pollAnswer.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        (ctx.container.poll?.answers as Array<PollAnswerData>).push({
            text,
            emoji: emoji || undefined
        })

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`emoji`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$poll`]($poll.md)
- [`$pollAnswerEmoji`]($pollAnswerEmoji.md)
- [`$pollAnswerID`]($pollAnswerID.md)
- [`$pollAnswerMessageID`]($pollAnswerMessageID.md)
- [`$pollAnswerText`]($pollAnswerText.md)
- [`$pollAnswerVoteCount`]($pollAnswerVoteCount.md)
- [`$pollAnswerVoterIDs`]($pollAnswerVoterIDs.md)
- [`$pollAnswers`]($pollAnswers.md)

**Source:** [`src/native/poll/pollAnswer.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/poll/pollAnswer.ts)

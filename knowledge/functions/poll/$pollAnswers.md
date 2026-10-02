# $pollAnswers

> Adds multiple poll answers

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `poll` | v1.5.0 | required | yes | — |

## Signature

```fs
$pollAnswers[text;emoji]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `text;emoji` | `String` | **yes** | yes | The answer's text followed by emoji |

### Per-parameter notes

- **`text;emoji`** (`String` , rest, required): The answer's text followed by emoji. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Poll functions build and inspect Discord polls and their answers.

`$pollAnswers` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `text;emoji` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$pollAnswers[Hello!]
```

## Reference implementation (source)

Taken from `src/native/poll/pollAnswers.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const ref = (ctx.container.poll?.answers as Array<PollAnswerData>)
        
        for (let i = 0, len = texts.length;i < len;i += 2) {
            const [ text, em ] = texts.slice(i, i + 2)
            ref.push({ 
                text,
                emoji: em || undefined
            })
        }

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$poll`]($poll.md)
- [`$pollAnswer`]($pollAnswer.md)
- [`$pollAnswerEmoji`]($pollAnswerEmoji.md)
- [`$pollAnswerID`]($pollAnswerID.md)
- [`$pollAnswerMessageID`]($pollAnswerMessageID.md)
- [`$pollAnswerText`]($pollAnswerText.md)
- [`$pollAnswerVoteCount`]($pollAnswerVoteCount.md)
- [`$pollAnswerVoterIDs`]($pollAnswerVoterIDs.md)

**Source:** [`src/native/poll/pollAnswers.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/poll/pollAnswers.ts)

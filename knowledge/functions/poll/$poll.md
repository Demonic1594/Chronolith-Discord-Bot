# $poll

> Creates a poll

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `poll` | v1.5.0 | required | yes | — |

## Signature

```fs
$poll[question;duration;multiselect;layout]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `question` | `String` | **yes** | no | The poll question |
| 2 | `duration` | `Time` | **yes** | no | The poll's duration |
| 3 | `multiselect` | `Boolean` | no | no | Whether to allow multi select |
| 4 | `layout` | `Enum` | no | no | The layout for this poll |

### Per-parameter notes

- **`question`** (`String`, required): The poll question. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`duration`** (`Time`, required): The poll's duration. Expects a duration. A raw number is used as milliseconds directly; otherwise parsed by `TimeParser` (`10m`, `1h30m`, `2d`, `45s`, ...).
- **`multiselect`** (`Boolean`, optional): Whether to allow multi select. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`layout`** (`Enum`, optional): The layout for this poll. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Poll functions build and inspect Discord polls and their answers.

`$poll` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$poll[value;10m]
```

**Full form (all arguments)**

```fs
$poll[value;10m;true;value]
```

## Reference implementation (source)

Taken from `src/native/poll/poll.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.container.poll = {
            answers: [],
            allowMultiselect: multi || false,
            duration: dur / 1000 / 60 / 60,
            question: { text: q },
            layoutType: layout || undefined
        }

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`multiselect`, `layout`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Time arguments accept either a raw number (milliseconds) or a duration string like `10m`, `1h30m`, `2d`.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$pollAnswer`]($pollAnswer.md)
- [`$pollAnswerEmoji`]($pollAnswerEmoji.md)
- [`$pollAnswerID`]($pollAnswerID.md)
- [`$pollAnswerMessageID`]($pollAnswerMessageID.md)
- [`$pollAnswerText`]($pollAnswerText.md)
- [`$pollAnswerVoteCount`]($pollAnswerVoteCount.md)
- [`$pollAnswerVoterIDs`]($pollAnswerVoterIDs.md)
- [`$pollAnswers`]($pollAnswers.md)

**Source:** [`src/native/poll/poll.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/poll/poll.ts)

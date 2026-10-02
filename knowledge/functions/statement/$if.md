# $if

> Creates an if statement

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `statement` | v1.0.0 | required | no | `Unknown` |

## Signature

```fs
$if[condition;if true;if false]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `condition` | `String` | no | no | The condition to check against |
| 2 | `if true` | `String` | **yes** | no | The code to run if true |
| 3 | `if false` | `String` | no | no | The code to run if false |

### Per-parameter notes

- **`condition`** (`String`, optional): The condition to check against. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
  - Condition argument: supports the operators `==`, `!=`, `<`, `<=`, `>`, `>=`. Without an operator, the left side is checked for equality against the string `"true"`.
- **`if true`** (`String`, required): The code to run if true. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`if false`** (`String`, optional): The code to run if false. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Statement functions are control flow: `$if`/`$else`/`$elseIf`, `$ifx` blocks, `$while`, `$loop`, `$switch`/`$case`/`$default`, `$try`, `$scope`, `$async`. With `unwrap: false` their code arguments are passed as raw text and compiled/ran lazily — this is why you can put `;`-separated multi-statement code inside them.

`$if` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic true branch**

```fs
$if[$authorID==123456789012345678;Welcome back, owner!;You are not the owner.]
```

**With nested functions**

```fs
$if[$messageCount>=10;$channelSendMessage[$channelID;Thanks for being active!;false]]
```

**Comparison operators**

```fs
$if[$randomNumber[1;10]>=5;$log[high];$log[low]]
```

## Reference implementation (source)

Taken from `src/native/statement/if.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const condition = await this["resolveCondition"](
            ctx,
            this.data.fields![0] as IExtendedCompiledFunctionConditionField
        )
        if (!this["isValidReturnType"](condition)) return condition

        const fieldToRun = (condition.value ? this.data.fields![1] : this.data.fields![2]) as
            | IExtendedCompiledFunctionField
            | undefined
        if (!fieldToRun) return this.success()

        return this["resolveCode"](ctx, fieldToRun)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`condition`, `if false`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$async`]($async.md)
- [`$break`]($break.md)
- [`$case`]($case.md)
- [`$continue`]($continue.md)
- [`$default`]($default.md)
- [`$else`]($else.md)
- [`$elseIf`]($elseIf.md)
- [`$ifx`]($ifx.md)

## Community guides covering this function

- [$if guide](../../guides/guide-172.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-172)

**Source:** [`src/native/statement/if.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/statement/if.ts)

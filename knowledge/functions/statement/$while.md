# $while

> Executes code while a condition is true

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `statement` | v1.0.3 | required | no | — |

> ⚠️ **experimental**

## Signature

```fs
$while[condition;code]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `condition` | `String` | **yes** | no | The condition to validate |
| 2 | `code` | `String` | **yes** | no | The code to execute |

### Per-parameter notes

- **`condition`** (`String`, required): The condition to validate. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
  - Condition argument: supports the operators `==`, `!=`, `<`, `<=`, `>`, `>=`. Without an operator, the left side is checked for equality against the string `"true"`.
- **`code`** (`String`, required): The code to execute. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Statement functions are control flow: `$if`/`$else`/`$elseIf`, `$ifx` blocks, `$while`, `$loop`, `$switch`/`$case`/`$default`, `$try`, `$scope`, `$async`. With `unwrap: false` their code arguments are passed as raw text and compiled/ran lazily — this is why you can put `;`-separated multi-statement code inside them.

`$while` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Count to five**

```fs
$while[$get[i]<5;$let[i;$sum[$get[i];1]]]$get[i]
```

## Reference implementation (source)

Taken from `src/native/statement/while.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const condition = this.data.fields![0] as IExtendedCompiledFunctionConditionField
        const code = this.data.fields![1] as IExtendedCompiledFunctionField

        for (;;) {
            const cond = await this["resolveCondition"](ctx, condition)
            if (!this["isValidReturnType"](cond)) return cond
            else if (!cond.value) break

            const exec = await this["resolveCode"](ctx, code)
            if (exec.success || exec.continue) continue
            else if (exec.break) break
            else return exec
        }

        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Marked **experimental** in source — behavior may change without a major version bump.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$async`]($async.md)
- [`$break`]($break.md)
- [`$case`]($case.md)
- [`$continue`]($continue.md)
- [`$default`]($default.md)
- [`$else`]($else.md)
- [`$elseIf`]($elseIf.md)
- [`$if`]($if.md)

## Community guides covering this function

- [$while guide](../../guides/guide-202.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-202)

**Source:** [`src/native/statement/while.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/statement/while.ts)

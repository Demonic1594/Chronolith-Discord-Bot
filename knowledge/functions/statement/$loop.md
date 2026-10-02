# $loop

> Executes given code for N times

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `statement` | v1.4.0 | required | no | — |

> ⚠️ **experimental**

## Signature

```fs
$loop[times;code;variable;asc]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `times` | `Number` | **yes** | no | How many times to run the code |
| 2 | `code` | `String` | **yes** | no | The code to execute |
| 3 | `variable` | `String` | no | no | The variable to load the current iteration count for $env |
| 4 | `asc` | `Boolean` | no | no | Whether to use asc order for iteration count |

### Per-parameter notes

- **`times`** (`Number`, required): How many times to run the code. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`code`** (`String`, required): The code to execute. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`variable`** (`String`, optional): The variable to load the current iteration count for $env. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`asc`** (`Boolean`, optional): Whether to use asc order for iteration count. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Statement functions are control flow: `$if`/`$else`/`$elseIf`, `$ifx` blocks, `$while`, `$loop`, `$switch`/`$case`/`$default`, `$try`, `$scope`, `$async`. With `unwrap: false` their code arguments are passed as raw text and compiled/ran lazily — this is why you can put `;`-separated multi-statement code inside them.

`$loop` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Repeat code N times**

```fs
$loop[3;$username[$authorID]]
```

## Reference implementation (source)

Taken from `src/native/statement/loop.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const {
            args,
            return: rt
        } = await this["resolveMultipleArgs"](ctx, 0, 2, 3)
        if (!this["isValidReturnType"](rt)) return rt

        const [ times, varName, asc ] = args
        const code = this.data.fields![1] as IExtendedCompiledFunctionField

        let output = ""
        let condition = asc || times === -1

        for (let i = condition ? 1 : times;(asc ? i <= times : i > 0) || times === -1;condition ? i++ : i--) {
            if (varName)
                ctx.setEnvironmentKey(varName, i)
            
            const exec = await this["resolveCode"](ctx, code)
            if (exec.success || exec.continue) continue
            else if (exec.break) break
            else if (exec.return) output += exec.value
            else return exec
        }

        return this.success(output || null)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`variable`, `asc`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Marked **experimental** in source — behavior may change without a major version bump.
6. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
7. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.
8. VERIFIED (2.7.1): plain body output is DISCARDED — only `$return[...]` values accumulate into the loop result. A `$loop[-1;...]` spin-wait needs both `$break` and `$wait[n]` inside.

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

- [$loop guide](../../guides/guide-175.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-175)

**Source:** [`src/native/statement/loop.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/statement/loop.ts)

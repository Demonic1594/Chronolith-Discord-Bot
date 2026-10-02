# $try

> Handles a possible error from given code

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `statement` | v1.0.0 | required | no | — |

> ⚠️ **experimental**

## Signature

```fs
$try[code;catch code;variable]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `code` | `String` | **yes** | no | The code to safely execute |
| 2 | `catch code` | `String` | no | no | The code to run in case of an error |
| 3 | `variable` | `String` | no | no | Variable to load the error message to |

### Per-parameter notes

- **`code`** (`String`, required): The code to safely execute. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`catch code`** (`String`, optional): The code to run in case of an error. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`variable`** (`String`, optional): Variable to load the error message to. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Statement functions are control flow: `$if`/`$else`/`$elseIf`, `$ifx` blocks, `$while`, `$loop`, `$switch`/`$case`/`$default`, `$try`, `$scope`, `$async`. With `unwrap: false` their code arguments are passed as raw text and compiled/ran lazily — this is why you can put `;`-separated multi-statement code inside them.

`$try` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$try[code]
```

**Full form (all arguments)**

```fs
$try[code;code;value]
```

## Reference implementation (source)

Taken from `src/native/statement/try.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const [tryCode, catchCode, varName] = this.data.fields! as IExtendedCompiledFunctionField[]

        const tryExecution: Return = await this["resolveCode"](ctx, tryCode)

        if (!this["isValidReturnType"](tryExecution)) {
            if (tryExecution.error) {
                const value = tryExecution.value as ForgeError
                const name = await this["resolveCode"](ctx, varName)
                if (!this["isValidReturnType"](name)) return name
                if (name.value) ctx.setEnvironmentKey(name.value as string, value.message)
            }

            return this["resolveCode"](ctx, catchCode)
        }

        return this.success(this["isValidReturnType"](tryExecution) ? tryExecution.value : undefined)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`catch code`, `variable`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Marked **experimental** in source — behavior may change without a major version bump.
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
- [`$if`]($if.md)

## Community guides covering this function

- [$try guide](../../guides/guide-178.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-178)

**Source:** [`src/native/statement/try.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/statement/try.ts)

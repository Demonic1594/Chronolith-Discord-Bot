# $switch

> Switch-case statement for javascript

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `statement` | v1.0.3 | required | no | `Unknown` |

> ⚠️ **experimental**

## Signature

```fs
$switch[value;cases]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `value` | `String` | **yes** | no | The value to match with |
| 2 | `cases` | `String` | **yes** | no | The cases to use ($case), use $case[default;...] to add a default case |

### Per-parameter notes

- **`value`** (`String`, required): The value to match with. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`cases`** (`String`, required): The cases to use ($case), use $case[default;...] to add a default case. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Statement functions are control flow: `$if`/`$else`/`$elseIf`, `$ifx` blocks, `$while`, `$loop`, `$switch`/`$case`/`$default`, `$try`, `$scope`, `$async`. With `unwrap: false` their code arguments are passed as raw text and compiled/ran lazily — this is why you can put `;`-separated multi-statement code inside them.

`$switch` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$switch[value;value]
```

## Reference implementation (source)

Taken from `src/native/statement/switch.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const match = await this["resolveCode"](ctx, this.data.fields![0] as IExtendedCompiledFunctionField)
        if (!this["isValidReturnType"](match)) return match

        const value = match.value as string
        const switchCases: CompiledFunction[] = (
            this.data.fields![1] as IExtendedCompiledFunctionField
        ).functions.filter((x) => x.data.name === _case.name)
        const index = switchCases.findIndex(
            (x) => (x.data.fields![0] as IExtendedCompiledFunctionField).value === "default"
        )
        const defaultCase = index === -1 ? null : switchCases.splice(index, 1)[0]

        for (let i = 0, len = switchCases.length; i < len; i++) {
            const cas = switchCases[i]
            const caseValue: Return = await cas["resolveCode"](
                ctx,
                cas.data.fields![0] as IExtendedCompiledFunctionField
            )
            if (!this["isValidReturnType"](caseValue)) return caseValue

            if (caseValue.value === value) {
                return cas.execute(ctx)
            }
        }

        if (defaultCase) return defaultCase.execute(ctx)

        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Marked **experimental** in source — behavior may change without a major version bump.
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
- [`$if`]($if.md)

**Source:** [`src/native/statement/switch.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/statement/switch.ts)

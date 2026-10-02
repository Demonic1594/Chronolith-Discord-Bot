# $ifx

> WIP if statements

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `statement` | v1.2.0 | required | no | — |

> ⚠️ **experimental**

## Signature

```fs
$ifx[block]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `block` | `String` | **yes** | no | The if, elseif, else blocks |

### Per-parameter notes

- **`block`** (`String`, required): The if, elseif, else blocks. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Statement functions are control flow: `$if`/`$else`/`$elseIf`, `$ifx` blocks, `$while`, `$loop`, `$switch`/`$case`/`$default`, `$try`, `$scope`, `$async`. With `unwrap: false` their code arguments are passed as raw text and compiled/ran lazily — this is why you can put `;`-separated multi-statement code inside them.

`$ifx` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$ifx[value]
```

## Reference implementation (source)

Taken from `src/native/statement/ifx.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const ifStatement = this.getFunction(0, ifFunc)!
        const elseIfStatements = this.getFunctions(0, elseif)
        const elseStatement = this.getFunction(0, _else)

        const ifRun = await ifStatement.execute(ctx)
        if (!this["isValidReturnType"](ifRun) || ifRun.value !== null) return ifRun

        for (let i = 0, len = elseIfStatements.length;i < len;i++) {
            const statement = elseIfStatements[i]
            const statementRun = await statement.execute(ctx)
            if (!this["isValidReturnType"](statementRun) || statementRun.value !== null) return statementRun
        }

        return elseStatement?.execute(ctx) ?? this.success()
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

- [$ifx guide](../../guides/guide-174.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-174)

**Source:** [`src/native/statement/ifx.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/statement/ifx.ts)

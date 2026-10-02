# $onlyIf

> Stop execution if condition is not matched

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `limiter` | v1.0.0 | required | no | — |

## Signature

```fs
$onlyIf[condition;code]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `condition` | `String` | **yes** | no | The condition to use |
| 2 | `code` | `String` | no | no | The code to execute if error |

### Per-parameter notes

- **`condition`** (`String`, required): The condition to use. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
  - Condition argument: supports the operators `==`, `!=`, `<`, `<=`, `>`, `>=`. Without an operator, the left side is checked for equality against the string `"true"`.
- **`code`** (`String`, optional): The code to execute if error. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Limiter functions restrict execution (`$onlyIf`, `$onlyForUsers`, `$onlyForRoles`, ...) and early-exit a command via `$stop`.

`$onlyIf` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Simple gate**

```fs
$onlyIf[$authorID!=123456789012345678;You are banned from this command!]
```

**Numeric gate**

```fs
$onlyIf[$arrayLength[list]>0;Nothing to show.]
```

## Reference implementation (source)

Taken from `src/native/limiter/onlyIf.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const [condition, code] = this.data.fields! as [
            IExtendedCompiledFunctionConditionField,
            IExtendedCompiledFunctionField,
        ]
        const res = await this["resolveCondition"](ctx, condition)
        if (!this["isValidReturnType"](res) || res.value) return res.success ? this.success() : res

        if (code) {
            const resolved = await this["resolveCode"](ctx, code)
            if (!this["isValidReturnType"](resolved)) return resolved
            ctx.container.content = resolved.value as string
            await ctx.container.send(ctx.obj)
        }

        return this.stop()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`code`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$onlyForCategories`]($onlyForCategories.md)
- [`$onlyForChannels`]($onlyForChannels.md)
- [`$onlyForGuilds`]($onlyForGuilds.md)
- [`$onlyForRoles`]($onlyForRoles.md)
- [`$onlyForUsers`]($onlyForUsers.md)
- [`$stop`]($stop.md)

**Source:** [`src/native/limiter/onlyIf.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/limiter/onlyIf.ts)

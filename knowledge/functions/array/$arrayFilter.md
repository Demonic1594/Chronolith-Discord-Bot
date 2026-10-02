# $arrayFilter

> Filters through every element of the array and loads the results to another array

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `array` | v2.7.0 | required | no | `Json` |

> ⚠️ **experimental**

## Signature

```fs
$arrayFilter[name;variable;code;other variable]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The variable that holds the array |
| 2 | `variable` | `String` | **yes** | no | The variable to load the element value to |
| 3 | `code` | `String` | **yes** | no | The code to execute for every element |
| 4 | `other variable` | `String` | no | no | The other variable to load the result to, leave empty to return output |

### Per-parameter notes

- **`name`** (`String`, required): The variable that holds the array. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`variable`** (`String`, required): The variable to load the element value to. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`code`** (`String`, required): The code to execute for every element. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
  - Condition argument: supports the operators `==`, `!=`, `<`, `<=`, `>`, `>=`. Without an operator, the left side is checked for equality against the string `"true"`.
- **`other variable`** (`String`, optional): The other variable to load the result to, leave empty to return output. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Array functions operate on arrays stored in the interpreter environment. Arrays are usually created with `$let[name;a;b;c]` (env values) or by functions that return arrays; `rest` arguments and semicolon-separated lists are the natural way to build them. Output that is an array gets JSON-serialized when returned with `successJSON`.

`$arrayFilter` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$arrayFilter[name;value;code]
```

**Full form (all arguments)**

```fs
$arrayFilter[name;value;code;value]
```

## Reference implementation (source)

Taken from `src/native/array/arrayFilter.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const code = this.data.fields![2] as IExtendedCompiledFunctionConditionField

        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3)
        if (!this["isValidReturnType"](rt)) return rt
        const [name, varName, otherVarName] = args

        const arr = ctx.getEnvironmentKey(name)
        const newArr = new Array<unknown>()

        if (Array.isArray(arr)) {
            for (let i = 0, len = arr.length; i < len; i++) {
                const el = arr[i]
                ctx.setEnvironmentKey(varName, el)
                const rt = await this["resolveCondition"](ctx, code)

                if (rt.return || rt.success) {
                    if (!isTrue(rt)) continue
                    newArr.push(el)
                } else if (!this["isValidReturnType"](rt)) return rt
            }
        }

        return otherVarName ?
            this.success(void ctx.setEnvironmentKey(otherVarName, newArr)) :
            this.successJSON(newArr)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`other variable`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Marked **experimental** in source — behavior may change without a major version bump.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedTextSplit`]($advancedTextSplit.md)
- [`$arrayAdvancedSort`]($arrayAdvancedSort.md)
- [`$arrayAt`]($arrayAt.md)
- [`$arrayClear`]($arrayClear.md)
- [`$arrayConcat`]($arrayConcat.md)
- [`$arrayCreate`]($arrayCreate.md)
- [`$arrayEvery`]($arrayEvery.md)
- [`$arrayFill`]($arrayFill.md)

**Source:** [`src/native/array/arrayFilter.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/array/arrayFilter.ts)

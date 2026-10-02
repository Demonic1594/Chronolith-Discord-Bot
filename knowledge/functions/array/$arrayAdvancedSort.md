# $arrayAdvancedSort

> Advanced array sort

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `array` | v1.4.0 | required | no | `Json` |

## Signature

```fs
$arrayAdvancedSort[variable;var1;var2;code;other variable]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable` | `String` | **yes** | no | The variable the array is held on |
| 2 | `var1` | `String` | **yes** | no | The $env variable 1 to hold x value |
| 3 | `var2` | `String` | **yes** | no | The $env variable 2 to hold y value |
| 4 | `code` | `String` | **yes** | no | Optional code to use for sorting, previous 2 vars must have been given |
| 5 | `other variable` | `String` | no | no | The variable to load result to, leave empty to return output |

### Per-parameter notes

- **`variable`** (`String`, required): The variable the array is held on. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`var1`** (`String`, required): The $env variable 1 to hold x value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`var2`** (`String`, required): The $env variable 2 to hold y value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`code`** (`String`, required): Optional code to use for sorting, previous 2 vars must have been given. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`other variable`** (`String`, optional): The variable to load result to, leave empty to return output. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Array functions operate on arrays stored in the interpreter environment. Arrays are usually created with `$let[name;a;b;c]` (env values) or by functions that return arrays; `rest` arguments and semicolon-separated lists are the natural way to build them. Output that is an array gets JSON-serialized when returned with `successJSON`.

`$arrayAdvancedSort` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$arrayAdvancedSort[value;value;value;code]
```

**Full form (all arguments)**

```fs
$arrayAdvancedSort[value;value;value;code;value]
```

## Reference implementation (source)

Taken from `src/native/array/arrayAdvancedSort.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const { return: rt, args } = await this["resolveMultipleArgs"](ctx, 0, 1, 2, 4)

        if (!this["isValidReturnType"](rt)) return rt

        const [ mainVar, var1, var2, otherVar ] = args
        const arr = ctx.getEnvironmentInstance(Array, mainVar)

        if (arr != null) {
            const result = await asyncSort(arr, async (x, y) => {
                ctx.setEnvironmentKey(var1, x)
                ctx.setEnvironmentKey(var2, y)
                const exec = await this["resolveUnhandledArg"](ctx, 3)
                return Number(exec.value)
            })

            if (result === null) return this.stop()

            if (otherVar !== null) {
                ctx.setEnvironmentKey(otherVar, result)
            } else {
                return this.successJSON(result)
            }
        }

        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`other variable`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedTextSplit`]($advancedTextSplit.md)
- [`$arrayAt`]($arrayAt.md)
- [`$arrayClear`]($arrayClear.md)
- [`$arrayConcat`]($arrayConcat.md)
- [`$arrayCreate`]($arrayCreate.md)
- [`$arrayEvery`]($arrayEvery.md)
- [`$arrayFill`]($arrayFill.md)
- [`$arrayFilter`]($arrayFilter.md)

**Source:** [`src/native/array/arrayAdvancedSort.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/array/arrayAdvancedSort.ts)

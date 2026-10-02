# $arrayReduce

> Reduces an array of elements and returns the result

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `array` | v1.0.0 | required | no | `Number` |

> ⚠️ **experimental**

## Signature

```fs
$arrayReduce[name;variable;other variable;code;default value]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The variable that holds the array |
| 2 | `variable` | `String` | **yes** | no | The variable to load the element value to |
| 3 | `other variable` | `String` | **yes** | no | The other variable to load the second element to |
| 4 | `code` | `String` | **yes** | no | The code to execute for every element, must return a number |
| 5 | `default value` | `Number` | no | no | The default value, defaults to 0 |

### Per-parameter notes

- **`name`** (`String`, required): The variable that holds the array. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`variable`** (`String`, required): The variable to load the element value to. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`other variable`** (`String`, required): The other variable to load the second element to. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`code`** (`String`, required): The code to execute for every element, must return a number. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`default value`** (`Number`, optional): The default value, defaults to 0. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Array functions operate on arrays stored in the interpreter environment. Arrays are usually created with `$let[name;a;b;c]` (env values) or by functions that return arrays; `rest` arguments and semicolon-separated lists are the natural way to build them. Output that is an array gets JSON-serialized when returned with `successJSON`.

`$arrayReduce` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$arrayReduce[name;value;value;code]
```

**Full form (all arguments)**

```fs
$arrayReduce[name;value;value;code;5]
```

## Reference implementation (source)

Taken from `src/native/array/arrayReduce.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 2, 4)
        if (!this["isValidReturnType"](rt)) return rt

        const code = this.data.fields![3] as IExtendedCompiledFunctionField

        const [name, variable, otherVariable, defaultValue] = args

        const arr = ctx.getEnvironmentKey(name)

        ctx.setEnvironmentKey(variable, defaultValue)

        if (Array.isArray(arr)) {
            for (let i = 0, len = arr.length; i < len; i++) {
                const el = arr[i]

                ctx.setEnvironmentKey(otherVariable, el)

                const rt = (await this["resolveCode"](ctx, code)) as Return

                if (rt.return) {
                    ctx.setEnvironmentKey(variable, rt.value)
                } else if (!this["isValidReturnType"](rt)) return rt
            }
        }

        return this.success(ctx.getEnvironmentKey(variable))
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`default value`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/array/arrayReduce.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/array/arrayReduce.ts)

# $arrayConcat

> Concat arrays and load them into another variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `array` | v1.0.0 | required | yes | `Json` |

## Signature

```fs
$arrayConcat[variable;variables]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable` | `String` | no | no | The variable to load the result to, leave empty to return output |
| 2 | `variables` | `String` | **yes** | yes | The variable names to concat |

### Per-parameter notes

- **`variable`** (`String`, optional): The variable to load the result to, leave empty to return output. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`variables`** (`String` , rest, required): The variable names to concat. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Array functions operate on arrays stored in the interpreter environment. Arrays are usually created with `$let[name;a;b;c]` (env values) or by functions that return arrays; `rest` arguments and semicolon-separated lists are the natural way to build them. Output that is an array gets JSON-serialized when returned with `successJSON`.

`$arrayConcat` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `variables` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$arrayConcat[value]
```

**Full form (all arguments)**

```fs
$arrayConcat[value;value]
```

## Reference implementation (source)

Taken from `src/native/array/arrayConcat.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const arr = new Array<unknown>()

        for (let i = 0, len = variables.length; i < len; i++) {
            const v = variables[i]
            const load = ctx.getEnvironmentKey(v)
            if (Array.isArray(load)) arr.push(...load)
        }

        return name ?
            this.success(void ctx.setEnvironmentKey(name, arr)) :
            this.successJSON(arr)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`variable`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedTextSplit`]($advancedTextSplit.md)
- [`$arrayAdvancedSort`]($arrayAdvancedSort.md)
- [`$arrayAt`]($arrayAt.md)
- [`$arrayClear`]($arrayClear.md)
- [`$arrayCreate`]($arrayCreate.md)
- [`$arrayEvery`]($arrayEvery.md)
- [`$arrayFill`]($arrayFill.md)
- [`$arrayFilter`]($arrayFilter.md)

**Source:** [`src/native/array/arrayConcat.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/array/arrayConcat.ts)

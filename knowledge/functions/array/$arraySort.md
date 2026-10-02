# $arraySort

> Sorts given array

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `array` | v1.2.0 | required | yes | `Json` |

## Signature

```fs
$arraySort[variable;other variable;sort type]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable` | `String` | **yes** | no | The variable the array is held on |
| 2 | `other variable` | `String` | no | no | The variable to load result to, leave empty to return output |
| 3 | `sort type` | `Enum` | no | no | The sort type, omit to use default sort order |

### Per-parameter notes

- **`variable`** (`String`, required): The variable the array is held on. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`other variable`** (`String`, optional): The variable to load result to, leave empty to return output. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`sort type`** (`Enum`, optional): The sort type, omit to use default sort order. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Array functions operate on arrays stored in the interpreter environment. Arrays are usually created with `$let[name;a;b;c]` (env values) or by functions that return arrays; `rest` arguments and semicolon-separated lists are the natural way to build them. Output that is an array gets JSON-serialized when returned with `successJSON`.

`$arraySort` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$arraySort[value]
```

**Full form (all arguments)**

```fs
$arraySort[value;value;value]
```

## Reference implementation (source)

Taken from `src/native/array/arraySort.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const arr = ctx.getEnvironmentInstance(Array, variable)
        if (arr !== null) {
            const sorted = arr.sort(order !== null ? (a, b) => (order ? Number(a) - Number(b) : Number(b) - Number(a)) : undefined)

            if (other)
                ctx.setEnvironmentKey(other, sorted)
            else
                return this.successJSON(sorted)
        }
        
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`other variable`, `sort type`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedTextSplit`]($advancedTextSplit.md)
- [`$arrayAdvancedSort`]($arrayAdvancedSort.md)
- [`$arrayAt`]($arrayAt.md)
- [`$arrayClear`]($arrayClear.md)
- [`$arrayConcat`]($arrayConcat.md)
- [`$arrayCreate`]($arrayCreate.md)
- [`$arrayEvery`]($arrayEvery.md)
- [`$arrayFill`]($arrayFill.md)

**Source:** [`src/native/array/arraySort.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/array/arraySort.ts)

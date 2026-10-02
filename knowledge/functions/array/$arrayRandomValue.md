# $arrayRandomValue

> Returns a random element

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `array` | v1.4.0 | required | yes | `Unknown` |

## Signature

```fs
$arrayRandomValue[variable]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable` | `String` | **yes** | no | The variable the array is held on |

### Per-parameter notes

- **`variable`** (`String`, required): The variable the array is held on. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Array functions operate on arrays stored in the interpreter environment. Arrays are usually created with `$let[name;a;b;c]` (env values) or by functions that return arrays; `rest` arguments and semicolon-separated lists are the natural way to build them. Output that is an array gets JSON-serialized when returned with `successJSON`.

`$arrayRandomValue` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$arrayRandomValue[value]
```

## Reference implementation (source)

Taken from `src/native/array/arrayRandomValue.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const arr = ctx.getEnvironmentInstance(Array, variable)
        return this.successJSON(Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : undefined)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
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

**Source:** [`src/native/array/arrayRandomValue.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/array/arrayRandomValue.ts)

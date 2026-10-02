# $arrayCreate

> Initializes an array and loads it to a variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `array` | v1.4.0 | required | yes | — |

> aliases: $arrayNew, $arrayInit

## Signature

```fs
$arrayCreate[variable;length]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable` | `String` | **yes** | no | The variable to load it to, accessed with $env |
| 2 | `length` | `Number` | no | no | The default length of the array, defaults to 0 |

### Per-parameter notes

- **`variable`** (`String`, required): The variable to load it to, accessed with $env. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`length`** (`Number`, optional): The default length of the array, defaults to 0. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Array functions operate on arrays stored in the interpreter environment. Arrays are usually created with `$let[name;a;b;c]` (env values) or by functions that return arrays; `rest` arguments and semicolon-separated lists are the natural way to build them. Output that is an array gets JSON-serialized when returned with `successJSON`.

`$arrayCreate` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$arrayCreate[value]
```

**Full form (all arguments)**

```fs
$arrayCreate[value;5]
```

## Reference implementation (source)

Taken from `src/native/array/arrayCreate.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.setEnvironmentKey(v, new Array(n || 0))
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$arrayNew`, `$arrayInit` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`length`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedTextSplit`]($advancedTextSplit.md)
- [`$arrayAdvancedSort`]($arrayAdvancedSort.md)
- [`$arrayAt`]($arrayAt.md)
- [`$arrayClear`]($arrayClear.md)
- [`$arrayConcat`]($arrayConcat.md)
- [`$arrayEvery`]($arrayEvery.md)
- [`$arrayFill`]($arrayFill.md)
- [`$arrayFilter`]($arrayFilter.md)

**Source:** [`src/native/array/arrayCreate.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/array/arrayCreate.ts)

# $advancedTextSplit

> Split and get all at the same time multiple times

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `array` | v1.4.0 | required | yes | `String` |

## Signature

```fs
$advancedTextSplit[text;split;index]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `text` | `String` | **yes** | no | The text to use |
| 2 | `split;index` | `String` | **yes** | yes | The split followed by the index to get |

### Per-parameter notes

- **`text`** (`String`, required): The text to use. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`split;index`** (`String` , rest, required): The split followed by the index to get. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Array functions operate on arrays stored in the interpreter environment. Arrays are usually created with `$let[name;a;b;c]` (env values) or by functions that return arrays; `rest` arguments and semicolon-separated lists are the natural way to build them. Output that is an array gets JSON-serialized when returned with `successJSON`.

`$advancedTextSplit` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `split;index` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$advancedTextSplit[Hello!;,]
```

## Reference implementation (source)

Taken from `src/native/array/advancedTextSplit.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        for (let i = 0, len = splits.length;i < len;i += 2) {
            const split = splits[i]
            const index = Number(splits[i + 1])
            text = text.split(split)[index]
            if (text === undefined)
                return this.success()
        }
        return this.success(text)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$arrayAdvancedSort`]($arrayAdvancedSort.md)
- [`$arrayAt`]($arrayAt.md)
- [`$arrayClear`]($arrayClear.md)
- [`$arrayConcat`]($arrayConcat.md)
- [`$arrayCreate`]($arrayCreate.md)
- [`$arrayEvery`]($arrayEvery.md)
- [`$arrayFill`]($arrayFill.md)
- [`$arrayFilter`]($arrayFilter.md)

**Source:** [`src/native/array/advancedTextSplit.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/array/advancedTextSplit.ts)

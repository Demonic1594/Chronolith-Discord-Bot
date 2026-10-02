# $getSplitTextLength

> Gets count of elements from $textSplit

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `array` | v1.4.0 | none | no | `Number` |

> aliases: $getTextSplitLength

## Signature

```fs
$getSplitTextLength
```

## How it works

Array functions operate on arrays stored in the interpreter environment. Arrays are usually created with `$let[name;a;b;c]` (env values) or by functions that return arrays; `rest` arguments and semicolon-separated lists are the natural way to build them. Output that is an array gets JSON-serialized when returned with `successJSON`.

`$getSplitTextLength` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$getSplitTextLength
```

## Reference implementation (source)

Taken from `src/native/array/getSplitTextLength.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            ctx.getEnvironmentInstance(Array, SplitTextName)?.length
        )
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$getTextSplitLength` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. This function has no brackets — it is used bare.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedTextSplit`]($advancedTextSplit.md)
- [`$arrayAdvancedSort`]($arrayAdvancedSort.md)
- [`$arrayAt`]($arrayAt.md)
- [`$arrayClear`]($arrayClear.md)
- [`$arrayConcat`]($arrayConcat.md)
- [`$arrayCreate`]($arrayCreate.md)
- [`$arrayEvery`]($arrayEvery.md)
- [`$arrayFill`]($arrayFill.md)

**Source:** [`src/native/array/getSplitTextLength.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/array/getSplitTextLength.ts)

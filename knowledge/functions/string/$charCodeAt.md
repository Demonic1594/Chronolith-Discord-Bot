# $charCodeAt

> Returns the char code at given index

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `string` | v1.0.6 | required | yes | `Number` |

## Signature

```fs
$charCodeAt[message;index]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `message` | `String` | **yes** | no | The string to get char code of |
| 2 | `index` | `Number` | **yes** | no | The index to get its char code |

### Per-parameter notes

- **`message`** (`String`, required): The string to get char code of. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`index`** (`Number`, required): The index to get its char code. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

String functions transform and inspect text (slicing, casing, search, split/join).

`$charCodeAt` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$charCodeAt[Hello!;5]
```

## Reference implementation (source)

Taken from `src/native/string/charCodeAt.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(m.charCodeAt(index))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedReplace`]($advancedReplace.md)
- [`$argCount`]($argCount.md)
- [`$charCount`]($charCount.md)
- [`$checkContains`]($checkContains.md)
- [`$cropArgs`]($cropArgs.md)
- [`$cropText`]($cropText.md)
- [`$endsWith`]($endsWith.md)
- [`$fromCharCode`]($fromCharCode.md)

**Source:** [`src/native/string/charCodeAt.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/string/charCodeAt.ts)

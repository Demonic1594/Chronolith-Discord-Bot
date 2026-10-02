# $trim

> Trims a string

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `string` | v1.0.6 | required | yes | `String` |

> aliases: $trimSpace

## Signature

```fs
$trim[text]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `text` | `String` | **yes** | no | The text to trim |

### Per-parameter notes

- **`text`** (`String`, required): The text to trim. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

String functions transform and inspect text (slicing, casing, search, split/join).

`$trim` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$trim[Hello!]
```

## Reference implementation (source)

Taken from `src/native/string/trim.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(m.trim())
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$trimSpace` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedReplace`]($advancedReplace.md)
- [`$argCount`]($argCount.md)
- [`$charCodeAt`]($charCodeAt.md)
- [`$charCount`]($charCount.md)
- [`$checkContains`]($checkContains.md)
- [`$cropArgs`]($cropArgs.md)
- [`$cropText`]($cropText.md)
- [`$endsWith`]($endsWith.md)

**Source:** [`src/native/string/trim.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/string/trim.ts)

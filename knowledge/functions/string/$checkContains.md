# $checkContains

> Checks whether a string contains a set of other strings

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `string` | v1.0.0 | required | yes | `Boolean` |

> aliases: $includes

## Signature

```fs
$checkContains[text;matches]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `text` | `String` | **yes** | no | The text to check on |
| 2 | `matches` | `String` | **yes** | yes | The list of strings to try match |

### Per-parameter notes

- **`text`** (`String`, required): The text to check on. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`matches`** (`String` , rest, required): The list of strings to try match. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

String functions transform and inspect text (slicing, casing, search, split/join).

`$checkContains` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `matches` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$checkContains[Hello!;value]
```

## Reference implementation (source)

Taken from `src/native/string/checkContains.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(matches.some((x) => text.includes(x)))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$includes` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedReplace`]($advancedReplace.md)
- [`$argCount`]($argCount.md)
- [`$charCodeAt`]($charCodeAt.md)
- [`$charCount`]($charCount.md)
- [`$cropArgs`]($cropArgs.md)
- [`$cropText`]($cropText.md)
- [`$endsWith`]($endsWith.md)
- [`$fromCharCode`]($fromCharCode.md)

**Source:** [`src/native/string/checkContains.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/string/checkContains.ts)

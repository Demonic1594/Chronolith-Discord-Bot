# $toKebabCase

> Converts a string to kebab case

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `string` | v1.0.6 | required | yes | `String` |

## Signature

```fs
$toKebabCase[message]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `message` | `String` | **yes** | no | The string to turn kebab case |

### Per-parameter notes

- **`message`** (`String`, required): The string to turn kebab case. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

String functions transform and inspect text (slicing, casing, search, split/join).

`$toKebabCase` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$toKebabCase[Hello!]
```

## Reference implementation (source)

Taken from `src/native/string/toKebabCase.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(kebabCase(m))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedReplace`]($advancedReplace.md)
- [`$argCount`]($argCount.md)
- [`$charCodeAt`]($charCodeAt.md)
- [`$charCount`]($charCount.md)
- [`$checkContains`]($checkContains.md)
- [`$cropArgs`]($cropArgs.md)
- [`$cropText`]($cropText.md)
- [`$endsWith`]($endsWith.md)

## Community guides covering this function

- [$toKebabCase guide](../../guides/guide-141.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-141)

**Source:** [`src/native/string/toKebabCase.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/string/toKebabCase.ts)

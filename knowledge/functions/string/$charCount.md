# $charCount

> Gets the char count of a text

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `string` | v1.0.0 | required | yes | `Number` |

> aliases: $textLength

## Signature

```fs
$charCount[text;char]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `text` | `String` | **yes** | no | The text to get its length |
| 2 | `char` | `String` | no | no | The character to count in the text |

### Per-parameter notes

- **`text`** (`String`, required): The text to get its length. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`char`** (`String`, optional): The character to count in the text. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

String functions transform and inspect text (slicing, casing, search, split/join).

`$charCount` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$charCount[Hello!]
```

**Full form (all arguments)**

```fs
$charCount[Hello!;value]
```

## Reference implementation (source)

Taken from `src/native/string/charCount.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (char === null) {
            return this.success(str.length)
        } else {
            return this.success(str.split(char).length - 1)
        }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$textLength` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`char`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedReplace`]($advancedReplace.md)
- [`$argCount`]($argCount.md)
- [`$charCodeAt`]($charCodeAt.md)
- [`$checkContains`]($checkContains.md)
- [`$cropArgs`]($cropArgs.md)
- [`$cropText`]($cropText.md)
- [`$endsWith`]($endsWith.md)
- [`$fromCharCode`]($fromCharCode.md)

## Community guides covering this function

- [$charCount guide](../../guides/guide-152.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-152)

**Source:** [`src/native/string/charCount.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/string/charCount.ts)

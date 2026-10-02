# $advancedReplace

> Replaces text in a string multiple times

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `string` | v1.5.0 | required | yes | `String` |

> aliases: $advancedReplaceText

## Signature

```fs
$advancedReplace[text;match;replacement]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `text` | `String` | **yes** | no | The base text |
| 2 | `match;replacement` | `String` | **yes** | yes | The text to match and their replacement |

### Per-parameter notes

- **`text`** (`String`, required): The base text. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`match;replacement`** (`String` , rest, required): The text to match and their replacement. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

String functions transform and inspect text (slicing, casing, search, split/join).

`$advancedReplace` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `match;replacement` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$advancedReplace[Hello!;value]
```

## Reference implementation (source)

Taken from `src/native/string/advancedReplace.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        for (let i = 0; i < args.length; i += 2) {
            const [ match, replacement ] = args.slice(i, i + 2)
            text = text.replaceAll((match as string) ?? "", (replacement as string) ?? "")
        }

        return this.success(text)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$advancedReplaceText` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$argCount`]($argCount.md)
- [`$charCodeAt`]($charCodeAt.md)
- [`$charCount`]($charCount.md)
- [`$checkContains`]($checkContains.md)
- [`$cropArgs`]($cropArgs.md)
- [`$cropText`]($cropText.md)
- [`$endsWith`]($endsWith.md)
- [`$fromCharCode`]($fromCharCode.md)

**Source:** [`src/native/string/advancedReplace.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/string/advancedReplace.ts)

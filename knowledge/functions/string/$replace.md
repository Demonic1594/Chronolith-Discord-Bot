# $replace

> Replace text in a string

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `string` | v1.0.0 | required | yes | `String` |

> aliases: $replaceText

## Signature

```fs
$replace[text;match;new value;amount]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `text` | `String` | **yes** | no | The base text |
| 2 | `match` | `String` | **yes** | no | Text to match in base |
| 3 | `new value` | `String` | **yes** | no | The text to replace matches with |
| 4 | `amount` | `Number` | no | no | How many times to perform this replacement |

### Per-parameter notes

- **`text`** (`String`, required): The base text. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`match`** (`String`, required): Text to match in base. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`new value`** (`String`, required): The text to replace matches with. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`amount`** (`Number`, optional): How many times to perform this replacement. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

String functions transform and inspect text (slicing, casing, search, split/join).

`$replace` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$replace[Hello!;value;value]
```

**Full form (all arguments)**

```fs
$replace[Hello!;value;value;5]
```

## Reference implementation (source)

Taken from `src/native/string/replace.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        amount ??= -1
        if (amount === -1) {
            return this.success(text.replaceAll(match, replacement))
        }
        let i = 0
        return this.success(text.replaceAll(match, (m) => (++i <= amount! ? replacement : m)))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$replaceText` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`amount`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedReplace`]($advancedReplace.md)
- [`$argCount`]($argCount.md)
- [`$charCodeAt`]($charCodeAt.md)
- [`$charCount`]($charCount.md)
- [`$checkContains`]($checkContains.md)
- [`$cropArgs`]($cropArgs.md)
- [`$cropText`]($cropText.md)
- [`$endsWith`]($endsWith.md)

**Source:** [`src/native/string/replace.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/string/replace.ts)

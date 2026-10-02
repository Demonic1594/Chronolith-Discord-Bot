# $codeBlock

> Creates a code block with given text

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `formatting` | v1.3.0 | required | yes | `String` |

## Signature

```fs
$codeBlock[text;lang]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `text` | `String` | **yes** | no | The text to create block with, this will attempt to escape all ` |
| 2 | `lang` | `String` | no | no | The language to give to this code block |

### Per-parameter notes

- **`text`** (`String`, required): The text to create block with, this will attempt to escape all `. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`lang`** (`String`, optional): The language to give to this code block. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Formatting functions transform text output (casing, separators, padding, unicode helpers).

`$codeBlock` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$codeBlock[Hello!]
```

**Full form (all arguments)**

```fs
$codeBlock[Hello!;value]
```

## Reference implementation (source)

Taken from `src/native/formatting/codeBlock.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        str = str.replace(MarkdownEscapeRegex, "\\$1")
        return this.success(
            lang ? 
                codeBlock(lang, str) :
                codeBlock(str)
        )
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`lang`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$bold`]($bold.md)
- [`$hyperlink`]($hyperlink.md)
- [`$inlineCode`]($inlineCode.md)
- [`$italic`]($italic.md)
- [`$spoiler`]($spoiler.md)
- [`$strikethrough`]($strikethrough.md)
- [`$subtext`]($subtext.md)
- [`$underline`]($underline.md)

**Source:** [`src/native/formatting/codeBlock.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/formatting/codeBlock.ts)

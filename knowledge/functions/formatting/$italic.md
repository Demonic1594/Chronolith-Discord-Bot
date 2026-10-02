# $italic

> Makes given text italic

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `formatting` | v1.5.0 | required | yes | `String` |

## Signature

```fs
$italic[text]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `text` | `String` | **yes** | no | The text to make italic, this will attempt to escape all _ and * |

### Per-parameter notes

- **`text`** (`String`, required): The text to make italic, this will attempt to escape all _ and *. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Formatting functions transform text output (casing, separators, padding, unicode helpers).

`$italic` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$italic[Hello!]
```

## Reference implementation (source)

Taken from `src/native/formatting/italic.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(italic(str.replace(ItalicEscapeRegex, "\\$1")))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$bold`]($bold.md)
- [`$codeBlock`]($codeBlock.md)
- [`$hyperlink`]($hyperlink.md)
- [`$inlineCode`]($inlineCode.md)
- [`$spoiler`]($spoiler.md)
- [`$strikethrough`]($strikethrough.md)
- [`$subtext`]($subtext.md)
- [`$underline`]($underline.md)

**Source:** [`src/native/formatting/italic.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/formatting/italic.ts)

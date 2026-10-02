# $subtext

> Makes given text a subtext

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `formatting` | v2.2.0 | required | yes | `String` |

## Signature

```fs
$subtext[text]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `text` | `String` | **yes** | no | The text to make subtext |

### Per-parameter notes

- **`text`** (`String`, required): The text to make subtext. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Formatting functions transform text output (casing, separators, padding, unicode helpers).

`$subtext` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$subtext[Hello!]
```

## Reference implementation (source)

Taken from `src/native/formatting/subtext.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(subtext(str))
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
- [`$italic`]($italic.md)
- [`$spoiler`]($spoiler.md)
- [`$strikethrough`]($strikethrough.md)
- [`$underline`]($underline.md)

**Source:** [`src/native/formatting/subtext.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/formatting/subtext.ts)

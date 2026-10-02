# $title

> Adds an embed title

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `embed` | v1.0.0 | required | yes | — |

## Signature

```fs
$title[title;hyperlink;index]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `title` | `String` | **yes** | no | Adds a title to the embed |
| 2 | `hyperlink` | `String` | no | no | The hyperlink url |
| 3 | `index` | `Number` | no | no | The index to add this data to |

### Per-parameter notes

- **`title`** (`String`, required): Adds a title to the embed. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`hyperlink`** (`String`, optional): The hyperlink url. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`index`** (`Number`, optional): The index to add this data to. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Embed functions mutate the message's embed container in-place: `$title`, `$description`, `$addField`, `$color`, `$author`, `$footer`, `$image`, `$thumbnail`, `$timestamp`. They take an optional index to target a specific embed.

`$title` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$title[value]
```

**Full form (all arguments)**

```fs
$title[value;https://example.com;5]
```

## Reference implementation (source)

Taken from `src/native/embed/title.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const embed = ctx.container.embed(index ?? 0).setTitle(title || null)
        if (hyperlink) embed.setURL(hyperlink)
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`hyperlink`, `index`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addField`]($addField.md)
- [`$author`]($author.md)
- [`$color`]($color.md)
- [`$deleteField`]($deleteField.md)
- [`$description`]($description.md)
- [`$editField`]($editField.md)
- [`$footer`]($footer.md)
- [`$image`]($image.md)

**Source:** [`src/native/embed/title.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/embed/title.ts)

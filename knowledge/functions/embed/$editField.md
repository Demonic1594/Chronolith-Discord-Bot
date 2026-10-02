# $editField

> Edits an embed field

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `embed` | v1.4.0 | required | yes | — |

## Signature

```fs
$editField[field index;name;value;inline;index]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `field index` | `Number` | **yes** | no | The index field to edit |
| 2 | `name` | `String` | no | no | The name for the field |
| 3 | `value` | `String` | no | no | The value for the field |
| 4 | `inline` | `Boolean` | no | no | Whether this field will be inline |
| 5 | `index` | `Number` | no | no | The index to edit this data on |

### Per-parameter notes

- **`field index`** (`Number`, required): The index field to edit. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`name`** (`String`, optional): The name for the field. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`value`** (`String`, optional): The value for the field. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`inline`** (`Boolean`, optional): Whether this field will be inline. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`index`** (`Number`, optional): The index to edit this data on. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Embed functions mutate the message's embed container in-place: `$title`, `$description`, `$addField`, `$color`, `$author`, `$footer`, `$image`, `$thumbnail`, `$timestamp`. They take an optional index to target a specific embed.

`$editField` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$editField[5]
```

**Full form (all arguments)**

```fs
$editField[5;name;value;true;5]
```

## Reference implementation (source)

Taken from `src/native/embed/editField.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const field = ctx.container.embed(index ?? 0).data.fields?.[fieldIndex]
        if (!field)
            return this.success()
        
        if (name)
            field.name = name
        if (value)
            field.value = value
        if (inline !== null)
            field.inline = inline

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`name`, `value`, `inline`, `index`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addField`]($addField.md)
- [`$author`]($author.md)
- [`$color`]($color.md)
- [`$deleteField`]($deleteField.md)
- [`$description`]($description.md)
- [`$footer`]($footer.md)
- [`$image`]($image.md)
- [`$thumbnail`]($thumbnail.md)

**Source:** [`src/native/embed/editField.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/embed/editField.ts)

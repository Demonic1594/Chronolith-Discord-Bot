# $addFileUpload

> Adds a new file upload component to the newest modal label

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v2.6.0 | required | yes | — |

## Signature

```fs
$addFileUpload[custom ID;min values;max values;required]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `custom ID` | `String` | **yes** | no | The custom id for this field |
| 2 | `min values` | `Number` | no | no | The min values of file uploads |
| 3 | `max values` | `Number` | no | no | The max values of file uploads |
| 4 | `required` | `Boolean` | no | no | Whether this field is required |

### Per-parameter notes

- **`custom ID`** (`String`, required): The custom id for this field. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`min values`** (`Number`, optional): The min values of file uploads. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`max values`** (`Number`, optional): The max values of file uploads. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`required`** (`Boolean`, optional): Whether this field is required. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addFileUpload` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$addFileUpload[123456789012345678]
```

**Full form (all arguments)**

```fs
$addFileUpload[123456789012345678;5;5;true]
```

## Reference implementation (source)

Taken from `src/native/component/addFileUpload.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const field = new FileUploadBuilder()
            .setCustomId(id)
            .setRequired(required || false)

        if (min) field.setMinValues(min)
        if (max) field.setMaxValues(max)

        ctx.component.label?.setFileUploadComponent(field)

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`min values`, `max values`, `required`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addActionRow`]($addActionRow.md)
- [`$addActionRowTo`]($addActionRowTo.md)
- [`$addButton`]($addButton.md)
- [`$addButtonTo`]($addButtonTo.md)
- [`$addChannelSelectMenu`]($addChannelSelectMenu.md)
- [`$addChannelSelectMenuTo`]($addChannelSelectMenuTo.md)
- [`$addChannelType`]($addChannelType.md)
- [`$addCheckbox`]($addCheckbox.md)

**Source:** [`src/native/component/addFileUpload.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addFileUpload.ts)

# $addTextInput

> Adds a text input field to the modal

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v1.0.0 | required | yes | — |

## Signature

```fs
$addTextInput[custom ID;name;type;required;placeholder;default value;minimum length;maximum length]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `custom ID` | `String` | **yes** | no | The custom id for this field |
| 2 | `name` | `String` | **yes** | no | The field name, will be overwritten when used inside a label |
| 3 | `type` | `Enum` | no | no | Paragraph or short |
| 4 | `required` | `Boolean` | no | no | Whether this field is required |
| 5 | `placeholder` | `String` | no | no | The placeholder to use for the field |
| 6 | `default value` | `String` | no | no | The default value for the field |
| 7 | `minimum length` | `Number` | no | no | The minimum length needed |
| 8 | `maximum length` | `Number` | no | no | The max length needed |

### Per-parameter notes

- **`custom ID`** (`String`, required): The custom id for this field. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`name`** (`String`, required): The field name, will be overwritten when used inside a label. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`type`** (`Enum`, optional): Paragraph or short. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`required`** (`Boolean`, optional): Whether this field is required. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`placeholder`** (`String`, optional): The placeholder to use for the field. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`default value`** (`String`, optional): The default value for the field. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`minimum length`** (`Number`, optional): The minimum length needed. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`maximum length`** (`Number`, optional): The max length needed. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addTextInput` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$addTextInput[123456789012345678;name]
```

**Full form (all arguments)**

```fs
$addTextInput[123456789012345678;name;value;true;value;value;5;5]
```

## Reference implementation (source)

Taken from `src/native/component/addTextInput.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const field = new TextInputBuilder()
            .setCustomId(id)
            .setStyle(type || TextInputStyle.Paragraph)
            .setRequired(required || false)

        if (placeholder) field.setPlaceholder(placeholder)
        if (value) field.setValue(value)
        if (min) field.setMinLength(min)
        if (max) field.setMaxLength(max)

        if (ctx.container.isInside(ComponentType.Label)) ctx.component.label?.setTextInputComponent(field)
        else ctx.container.modal?.addLabelComponents(new LabelBuilder().setLabel(name).setTextInputComponent(field))

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`type`, `required`, `placeholder`, `default value`, `minimum length`, `maximum length`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/component/addTextInput.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addTextInput.ts)

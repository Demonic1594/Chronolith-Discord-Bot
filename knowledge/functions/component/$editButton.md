# $editButton

> Edits a button component

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v1.0.7 | required | yes | — |

## Signature

```fs
$editButton[custom ID;new custom ID;label;style;emoji;disabled]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `custom ID` | `String` | **yes** | no | The custom id to find the component |
| 2 | `new custom ID` | `String` | **yes** | no | The new custom id for this component |
| 3 | `label` | `String` | no | no | The new button label |
| 4 | `style` | `Enum` | no | no | The new style for this button |
| 5 | `emoji` | `String` | no | no | The new emoji for this button |
| 6 | `disabled` | `Boolean` | no | no | Whether to disable the button |

### Per-parameter notes

- **`custom ID`** (`String`, required): The custom id to find the component. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`new custom ID`** (`String`, required): The new custom id for this component. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`label`** (`String`, optional): The new button label. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`style`** (`Enum`, optional): The new style for this button. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`emoji`** (`String`, optional): The new emoji for this button. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`disabled`** (`Boolean`, optional): Whether to disable the button. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$editButton` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$editButton[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$editButton[123456789012345678;123456789012345678;value;value;:smile:;true]
```

## Reference implementation (source)

Taken from `src/native/component/editButton.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const rowIndex = ctx.container.components.findIndex((x) =>
            (x instanceof ActionRowBuilder || x instanceof ContainerBuilder)
                ? x.components.some((x) => "custom_id" in x.data && x.data.custom_id === oldId)
                : false
        )
        if (rowIndex === -1) return this.success()

        // @ts-ignore
        const btn = ctx.container.components[rowIndex].components.find(
            // @ts-ignore
            (x) => "custom_id" in x.data && x.data.custom_id === oldId
        ) as ButtonBuilder

        if (!btn) return this.success()
        style = (style ? resolveNumericEnum(ButtonStyle, style) : btn.data.style)

        if (label) btn.setLabel(label)
        if (style) btn.setStyle(style)
        if (emoji) btn.setEmoji(emoji)
        if (typeof disabled === "boolean") btn.setDisabled(disabled)

        if (style === ButtonStyle.Link) btn.setURL(id)
        else if (style === ButtonStyle.Premium) btn.setSKUId(id)
        else btn.setCustomId(id)

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`label`, `style`, `emoji`, `disabled`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/component/editButton.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/editButton.ts)

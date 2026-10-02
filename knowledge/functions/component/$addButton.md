# $addButton

> Adds a button component to the newest row

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v1.0.0 | required | yes | — |

## Signature

```fs
$addButton[custom ID;label;style;emoji;disabled]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `custom ID` | `String` | **yes** | no | The custom id for this component |
| 2 | `label` | `String` | **yes** | no | The button label |
| 3 | `style` | `Enum` | **yes** | no | The style for this button |
| 4 | `emoji` | `String` | no | no | The emoji for this button |
| 5 | `disabled` | `Boolean` | no | no | Whether to disable the button |

### Per-parameter notes

- **`custom ID`** (`String`, required): The custom id for this component. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`label`** (`String`, required): The button label. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`style`** (`Enum`, required): The style for this button. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`emoji`** (`String`, optional): The emoji for this button. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`disabled`** (`Boolean`, optional): Whether to disable the button. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addButton` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Primary button**

```fs
$addButton[my-custom-id;Click me;primary;false;]
```

**Danger button with emoji**

```fs
$addButton[ban-btn;Ban;danger;false;:warning:]
```

## Reference implementation (source)

Taken from `src/native/component/addButton.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        style = resolveNumericEnum(ButtonStyle, style)

        const btn = new ButtonBuilder()
            .setDisabled(disabled || false)
            .setStyle(style)

        if (style === ButtonStyle.Link) btn.setURL(id)
        else if (style === ButtonStyle.Premium) btn.setSKUId(id)
        else btn.setCustomId(id)

        if (style !== ButtonStyle.Premium) {
            btn.setLabel(label)
            if (emoji) btn.setEmoji(emoji)
        }

        if (ctx.container.isInside(ComponentType.Section)) ctx.component.section?.setButtonAccessory(btn)
        else ctx.container.actionRow?.addComponents(btn)

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`emoji`, `disabled`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addActionRow`]($addActionRow.md)
- [`$addActionRowTo`]($addActionRowTo.md)
- [`$addButtonTo`]($addButtonTo.md)
- [`$addChannelSelectMenu`]($addChannelSelectMenu.md)
- [`$addChannelSelectMenuTo`]($addChannelSelectMenuTo.md)
- [`$addChannelType`]($addChannelType.md)
- [`$addCheckbox`]($addCheckbox.md)
- [`$addCheckboxGroup`]($addCheckboxGroup.md)

## Community guides covering this function

- [$addButton guide](../../guides/guide-186.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-186)

**Source:** [`src/native/component/addButton.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addButton.ts)

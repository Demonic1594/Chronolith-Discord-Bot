# $addButtonTo

> Adds a button component to the newest row in a message

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v1.5.0 | required | yes | `Boolean` |

## Signature

```fs
$addButtonTo[channel ID;message ID;custom ID;label;style;emoji;disabled]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `TextChannel` | **yes** | no | The channel id to pull message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to add button to |
| 3 | `custom ID` | `String` | **yes** | no | The custom id for this component |
| 4 | `label` | `String` | **yes** | no | The button label |
| 5 | `style` | `Enum` | **yes** | no | The style for this button |
| 6 | `emoji` | `String` | no | no | The emoji for this button |
| 7 | `disabled` | `Boolean` | no | no | Whether to disable the button |

### Per-parameter notes

- **`channel ID`** (`TextChannel`, required): The channel id to pull message from. Expects a textable channel ID. Same snowflake rules as Channel, but the channel must support messages (`.messages` present), otherwise rejected.
- **`message ID`** (`Message`, required): The message to add button to. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`custom ID`** (`String`, required): The custom id for this component. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`label`** (`String`, required): The button label. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`style`** (`Enum`, required): The style for this button. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`emoji`** (`String`, optional): The emoji for this button. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`disabled`** (`Boolean`, optional): Whether to disable the button. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addButtonTo` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$addButtonTo[123456789012345678;123456789012345678;123456789012345678;value;value]
```

**Full form (all arguments)**

```fs
$addButtonTo[123456789012345678;123456789012345678;123456789012345678;value;value;:smile:;true]
```

## Reference implementation (source)

Taken from `src/native/component/addButtonTo.ts` in the `ForgeScript` repository — this is exactly what runs:

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

        const components = m.components.map(x => createComponentBuilder(x.toJSON()))
        const comp = components.at(-1)
        if (comp instanceof ActionRowBuilder) comp.addComponents(btn)

        return this.success(
            !!(await m.edit({ components: components.map(x => x.toJSON()) }).catch(ctx.noop))
        )
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`emoji`, `disabled`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addActionRow`]($addActionRow.md)
- [`$addActionRowTo`]($addActionRowTo.md)
- [`$addButton`]($addButton.md)
- [`$addChannelSelectMenu`]($addChannelSelectMenu.md)
- [`$addChannelSelectMenuTo`]($addChannelSelectMenuTo.md)
- [`$addChannelType`]($addChannelType.md)
- [`$addCheckbox`]($addCheckbox.md)
- [`$addCheckboxGroup`]($addCheckboxGroup.md)

**Source:** [`src/native/component/addButtonTo.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addButtonTo.ts)

# $editOption

> Edits a select menu option

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v1.4.0 | required | yes | — |

## Signature

```fs
$editOption[name;new name;description;value;emoji;default]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The option name to find |
| 2 | `new name` | `String` | **yes** | no | The new option name |
| 3 | `description` | `String` | no | no | The new description for this option |
| 4 | `value` | `String` | no | no | The new value for this option |
| 5 | `emoji` | `String` | no | no | The new emoji for this option |
| 6 | `default` | `Boolean` | no | no | Whether to set this option as default |

### Per-parameter notes

- **`name`** (`String`, required): The option name to find. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`new name`** (`String`, required): The new option name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`description`** (`String`, optional): The new description for this option. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`value`** (`String`, optional): The new value for this option. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`emoji`** (`String`, optional): The new emoji for this option. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`default`** (`Boolean`, optional): Whether to set this option as default. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$editOption` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$editOption[name;name]
```

**Full form (all arguments)**

```fs
$editOption[name;name;value;value;:smile:;true]
```

## Reference implementation (source)

Taken from `src/native/component/editOption.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        for (let i = 0, len = ctx.container.components.length;i < len;i++) {
            const comp = ctx.container.components[i]
            const comps = comp instanceof ContainerBuilder
                ? comp.components.map((x) => buildComponent(x.toJSON()))
                : ("components" in comp ? comp.components : undefined)
            if (!comps) continue

            for (let n = 0, len = comps.length;n < len;n++) {
                const row = comps[n]
                const menu = row instanceof ActionRowBuilder ? row.components[0] : row

                if (menu instanceof StringSelectMenuBuilder) {
                    const index = menu.options.findIndex(x => x.data.label === old)
                    if (index !== -1) {
                        const option = menu.options[index]

                        option.setLabel(name)
                        if (value) option.setValue(value)
                        if (emoji) option.setEmoji(parseEmoji(emoji)!)
                        if (desc) option.setDescription(desc)
                        if (typeof def === "boolean") option.setDefault(def)

                        if (comp instanceof ContainerBuilder) comp.spliceComponents(n, 1, new ActionRowBuilder().addComponents(menu))

                        return this.success()
                    }
                }
            }
        }

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`description`, `value`, `emoji`, `default`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/component/editOption.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/editOption.ts)

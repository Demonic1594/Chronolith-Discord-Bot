# $editMentionableSelectMenu

> Edits a mentionable select menu

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v2.2.0 | required | yes | — |

## Signature

```fs
$editMentionableSelectMenu[old custom ID;new custom ID;placeholder;disabled;min values;max values;default roles/users]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `old custom ID` | `String` | **yes** | no | The custom id of the menu to edit |
| 2 | `new custom ID` | `String` | **yes** | no | The new custom id to use for this menu |
| 3 | `placeholder` | `String` | no | no | The placeholder to use for the menu |
| 4 | `disabled` | `Boolean` | no | no | Whether to keep this menu disabled |
| 5 | `min values` | `Number` | no | no | The min values to choose for the menu |
| 6 | `max values` | `Number` | no | no | The max values to choose for the menu |
| 7 | `default roles/users` | `RoleOrUser` | no | yes | The default selected roles or users to use |

### Per-parameter notes

- **`old custom ID`** (`String`, required): The custom id of the menu to edit. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`new custom ID`** (`String`, required): The new custom id to use for this menu. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`placeholder`** (`String`, optional): The placeholder to use for the menu. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`disabled`** (`Boolean`, optional): Whether to keep this menu disabled. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`min values`** (`Number`, optional): The min values to choose for the menu. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`max values`** (`Number`, optional): The max values to choose for the menu. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`default roles/users`** (`RoleOrUser` , rest, optional): The default selected roles or users to use. Expects a role or user ID. Tried as a role in the pointer guild first, then as a user fetch.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$editMentionableSelectMenu` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `default roles/users` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$editMentionableSelectMenu[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$editMentionableSelectMenu[123456789012345678;123456789012345678;value;true;5;5;value]
```

## Reference implementation (source)

Taken from `src/native/component/editMentionableSelectMenu.ts` in the `ForgeScript` repository — this is exactly what runs:

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

                if (menu instanceof MentionableSelectMenuBuilder && menu.data.custom_id === old) {
                    menu.setCustomId(id)
                    
                    if (placeholder) menu.setPlaceholder(placeholder)
                    if (typeof disabled === "boolean") menu.setDisabled(disabled)
                    if (typeof min === "number") menu.setMinValues(min)
                    if (typeof max === "number") menu.setMaxValues(max)
                    if (defaults.length) {
                        menu.setDefaultValues(defaults.filter(Boolean).map(x => {
                            return {
                                id: x.id,
                                type: x instanceof User ? SelectMenuDefaultValueType.User : SelectMenuDefaultValueType.Role
                            }
                        }))
                    }
                    
                    if (comp instanceof ContainerBuilder) comp.spliceComponents(n, 1, new ActionRowBuilder().addComponents(menu))
                    
                    return this.success()
                }
            }
        }

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`placeholder`, `disabled`, `min values`, `max values`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/component/editMentionableSelectMenu.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/editMentionableSelectMenu.ts)

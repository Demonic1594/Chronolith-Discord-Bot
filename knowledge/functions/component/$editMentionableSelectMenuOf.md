# $editMentionableSelectMenuOf

> Edits a mentionable select menu of a message, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v2.2.0 | required | yes | `Boolean` |

## Signature

```fs
$editMentionableSelectMenuOf[channel ID;message ID;old custom ID;new custom ID;placeholder;disabled;min values;max values;default roles/users]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `TextChannel` | **yes** | no | The channel id to pull message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to edit select menu for |
| 3 | `old custom ID` | `String` | **yes** | no | The custom id of the menu to edit |
| 4 | `new custom ID` | `String` | **yes** | no | The new custom id to use for this menu |
| 5 | `placeholder` | `String` | no | no | The placeholder to use for the menu |
| 6 | `disabled` | `Boolean` | no | no | Whether to keep this menu disabled |
| 7 | `min values` | `Number` | no | no | The min values to choose for the menu |
| 8 | `max values` | `Number` | no | no | The max values to choose for the menu |
| 9 | `default roles/users` | `RoleOrUser` | no | yes | The default selected roles or users to use |

### Per-parameter notes

- **`channel ID`** (`TextChannel`, required): The channel id to pull message from. Expects a textable channel ID. Same snowflake rules as Channel, but the channel must support messages (`.messages` present), otherwise rejected.
- **`message ID`** (`Message`, required): The message to edit select menu for. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
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

`$editMentionableSelectMenuOf` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `default roles/users` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$editMentionableSelectMenuOf[123456789012345678;123456789012345678;123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$editMentionableSelectMenuOf[123456789012345678;123456789012345678;123456789012345678;123456789012345678;value;true;5;5;value]
```

## Reference implementation (source)

Taken from `src/native/component/editMentionableSelectMenuOf.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const components = m.components.map((x) => buildComponent(x))

        outer:
        for (let i = 0, len = components.length;i < len;i++) {
            const comp = components[i]
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
                    
                    break outer
                }
            }
        }

        return this.success(
            !!(await m.edit({ components: components.map((x) => x.toJSON()) }).catch(ctx.noop))
        )
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`placeholder`, `disabled`, `min values`, `max values`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addActionRow`]($addActionRow.md)
- [`$addActionRowTo`]($addActionRowTo.md)
- [`$addButton`]($addButton.md)
- [`$addButtonTo`]($addButtonTo.md)
- [`$addChannelSelectMenu`]($addChannelSelectMenu.md)
- [`$addChannelSelectMenuTo`]($addChannelSelectMenuTo.md)
- [`$addChannelType`]($addChannelType.md)
- [`$addCheckbox`]($addCheckbox.md)

**Source:** [`src/native/component/editMentionableSelectMenuOf.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/editMentionableSelectMenuOf.ts)

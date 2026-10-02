# $addRoleSelectMenu

> Creates a role select menu

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v1.3.0 | required | yes | — |

## Signature

```fs
$addRoleSelectMenu[custom ID;placeholder;min values;max values;disabled;required]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `custom ID` | `String` | **yes** | no | The custom id for this menu |
| 2 | `placeholder` | `String` | no | no | The placeholder to use for the menu |
| 3 | `min values` | `Number` | no | no | The min values to choose for the menu |
| 4 | `max values` | `Number` | no | no | The max values to choose for the menu |
| 5 | `disabled` | `Boolean` | no | no | Whether the menu is disabled by default |
| 6 | `required` | `Boolean` | no | no | Whether this menu is required inside a modal |

### Per-parameter notes

- **`custom ID`** (`String`, required): The custom id for this menu. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`placeholder`** (`String`, optional): The placeholder to use for the menu. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`min values`** (`Number`, optional): The min values to choose for the menu. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`max values`** (`Number`, optional): The max values to choose for the menu. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`disabled`** (`Boolean`, optional): Whether the menu is disabled by default. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`required`** (`Boolean`, optional): Whether this menu is required inside a modal. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addRoleSelectMenu` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$addRoleSelectMenu[123456789012345678]
```

**Full form (all arguments)**

```fs
$addRoleSelectMenu[123456789012345678;value;5;5;true;true]
```

## Reference implementation (source)

Taken from `src/native/component/addRoleSelectMenu.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const menu = new RoleSelectMenuBuilder()
            .setDisabled(disabled || false)
            .setRequired(required || false)
            .setCustomId(id)

        if (placeholder) menu.setPlaceholder(placeholder)
        if (min) menu.setMinValues(min)
        if (max) menu.setMaxValues(max)

        if (ctx.container.isInside(ComponentType.Label)) ctx.component.label?.setRoleSelectMenuComponent(menu)
        else ctx.container.actionRow?.addComponents(menu)

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`placeholder`, `min values`, `max values`, `disabled`, `required`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/component/addRoleSelectMenu.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addRoleSelectMenu.ts)

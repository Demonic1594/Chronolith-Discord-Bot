# $addRoleSelectMenuTo

> Creates a role select menu on a message

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v1.5.0 | required | yes | `Boolean` |

## Signature

```fs
$addRoleSelectMenuTo[channel ID;message ID;custom ID;placeholder;min values;max values;disabled;default roles]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `TextChannel` | **yes** | no | The channel id to pull message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to add select menu to |
| 3 | `custom ID` | `String` | **yes** | no | The custom id for this menu |
| 4 | `placeholder` | `String` | no | no | The placeholder to use for the menu |
| 5 | `min values` | `Number` | no | no | The min values to choose for the menu |
| 6 | `max values` | `Number` | no | no | The max values to choose for the menu |
| 7 | `disabled` | `Boolean` | no | no | Whether the menu is disabled by default |
| 8 | `default roles` | `String` | no | yes | The default selected roles to use |

### Per-parameter notes

- **`channel ID`** (`TextChannel`, required): The channel id to pull message from. Expects a textable channel ID. Same snowflake rules as Channel, but the channel must support messages (`.messages` present), otherwise rejected.
- **`message ID`** (`Message`, required): The message to add select menu to. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`custom ID`** (`String`, required): The custom id for this menu. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`placeholder`** (`String`, optional): The placeholder to use for the menu. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`min values`** (`Number`, optional): The min values to choose for the menu. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`max values`** (`Number`, optional): The max values to choose for the menu. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`disabled`** (`Boolean`, optional): Whether the menu is disabled by default. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`default roles`** (`String` , rest, optional): The default selected roles to use. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addRoleSelectMenuTo` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `default roles` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$addRoleSelectMenuTo[123456789012345678;123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$addRoleSelectMenuTo[123456789012345678;123456789012345678;123456789012345678;value;5;5;true;value]
```

## Reference implementation (source)

Taken from `src/native/component/addRoleSelectMenuTo.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const menu = new RoleSelectMenuBuilder()
            .setDefaultRoles(roles)
            .setDisabled(disabled || false)
            .setCustomId(id)
            
        if (placeholder) menu.setPlaceholder(placeholder)
        if (min) menu.setMinValues(min)
        if (max) menu.setMaxValues(max)

        const components = m.components.map(x => createComponentBuilder(x.toJSON()))
        components.push(new ActionRowBuilder().addComponents(menu))

        return this.success(
            !!(await m.edit({ components: components.map(x => x.toJSON()) }).catch(ctx.noop))
        )
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`placeholder`, `min values`, `max values`, `disabled`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/component/addRoleSelectMenuTo.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addRoleSelectMenuTo.ts)

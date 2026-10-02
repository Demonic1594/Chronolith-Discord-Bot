# $enableButtonsOf

> Enables all buttons of a message, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v2.2.0 | required | yes | `Boolean` |

> aliases: $enableAllButtonsOf

## Signature

```fs
$enableButtonsOf[channel ID;message ID;index]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `TextChannel` | **yes** | no | The channel id to pull message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to enable buttons on |
| 3 | `index` | `Number` | no | no | The index of the row to enable |

### Per-parameter notes

- **`channel ID`** (`TextChannel`, required): The channel id to pull message from. Expects a textable channel ID. Same snowflake rules as Channel, but the channel must support messages (`.messages` present), otherwise rejected.
- **`message ID`** (`Message`, required): The message to enable buttons on. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`index`** (`Number`, optional): The index of the row to enable. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$enableButtonsOf` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$enableButtonsOf[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$enableButtonsOf[123456789012345678;123456789012345678;5]
```

## Reference implementation (source)

Taken from `src/native/component/enableButtonsOf.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const components = msg.components.map(x => ActionRowBuilder.from(x as ActionRow<MessageActionRowComponent>))

        for (let i = 0, len = components.length; i < len; i++) {
            if (Number.isFinite(index) && i !== index) continue
            const actionRow = new ActionRowBuilder()

            components[i]?.components.forEach(comp => {
                if (comp instanceof ButtonBuilder) {
                    actionRow.addComponents(comp.setDisabled(false))
                } else {
                    actionRow.addComponents(comp)
                }
            })
            if (i === index) break
        }

        return this.success(!!(await msg.edit({ components: components as ActionRowBuilder<ButtonBuilder>[] }).catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$enableAllButtonsOf` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`index`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/component/enableButtonsOf.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/enableButtonsOf.ts)

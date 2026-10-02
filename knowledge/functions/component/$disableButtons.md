# $disableButtons

> Disables all buttons on the current message

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v2.2.0 | optional | yes | — |

> aliases: $disableAllButtons

## Signature

```fs
$disableButtons[index]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `index` | `Number` | **yes** | no | The index of the row to disable |

### Per-parameter notes

- **`index`** (`Number`, required): The index of the row to disable. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$disableButtons` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$disableButtons[5]
```

## Reference implementation (source)

Taken from `src/native/component/disableButtons.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const data = ctx.container.components
        const components = Number.isFinite(index) ? new Array(data[index]) : data

        ctx.container.actionRow?.components.forEach((x) => {
            if (x instanceof ButtonBuilder) x.setDisabled(true)
        })

        for (let i = 0, len = components.length; i < len; i++) {
            const row = components[i]
            if (!(row instanceof ActionRowBuilder)) continue
            const actionRow = new ActionRowBuilder()
            row?.components.forEach((x) => {
                if (x instanceof ButtonBuilder) actionRow.addComponents(x.setDisabled(true))
            })
        }

        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$disableAllButtons` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addActionRow`]($addActionRow.md)
- [`$addActionRowTo`]($addActionRowTo.md)
- [`$addButton`]($addButton.md)
- [`$addButtonTo`]($addButtonTo.md)
- [`$addChannelSelectMenu`]($addChannelSelectMenu.md)
- [`$addChannelSelectMenuTo`]($addChannelSelectMenuTo.md)
- [`$addChannelType`]($addChannelType.md)
- [`$addCheckbox`]($addCheckbox.md)

**Source:** [`src/native/component/disableButtons.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/disableButtons.ts)

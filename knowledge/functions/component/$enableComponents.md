# $enableComponents

> Enables all components on the current message

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v2.2.0 | none | no | — |

> aliases: $enableAllComponents

## Signature

```fs
$enableComponents
```

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$enableComponents` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$enableComponents
```

## Reference implementation (source)

Taken from `src/native/component/enableComponents.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const components = ctx.container.components
        ctx.container.actionRow?.components.forEach((x) => x.setDisabled(false))

        for (let comp of components) {
            if (!(comp instanceof ActionRowBuilder)) continue
            const actionRow = new ActionRowBuilder()
            comp?.components.forEach((x) => actionRow.addComponents(x.setDisabled(false)))
        }

        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$enableAllComponents` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. This function has no brackets — it is used bare.
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

**Source:** [`src/native/component/enableComponents.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/enableComponents.ts)

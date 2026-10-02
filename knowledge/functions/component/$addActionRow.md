# $addActionRow

> Adds an action row

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v1.0.0 | none | no | — |

## Signature

```fs
$addActionRow
```

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addActionRow` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$addActionRow
```

## Reference implementation (source)

Taken from `src/native/component/addActionRow.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        addActionRow(ctx, false)
        ctx.container.actionRow = new ActionRowBuilder()
        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addActionRowTo`]($addActionRowTo.md)
- [`$addButton`]($addButton.md)
- [`$addButtonTo`]($addButtonTo.md)
- [`$addChannelSelectMenu`]($addChannelSelectMenu.md)
- [`$addChannelSelectMenuTo`]($addChannelSelectMenuTo.md)
- [`$addChannelType`]($addChannelType.md)
- [`$addCheckbox`]($addCheckbox.md)
- [`$addCheckboxGroup`]($addCheckboxGroup.md)

## Community guides covering this function

- [$addActionRow guide](../../guides/guide-250.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-250)

**Source:** [`src/native/component/addActionRow.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addActionRow.ts)

# $deleteComponent

> Deletes a message component with given custom id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v1.0.0 | required | yes | — |

## Signature

```fs
$deleteComponent[custom ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `custom ID` | `String` | **yes** | no | The component's custom id to delete |

### Per-parameter notes

- **`custom ID`** (`String`, required): The component's custom id to delete. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$deleteComponent` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteComponent[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/component/deleteComponent.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const row = ctx.container.actionRow
        const n = row?.components.findIndex((x) => "custom_id" in x.data && x.data.custom_id === id)
        if (n != -1) {
            if (row?.components.length === 1) delete ctx.container.actionRow
            else ctx.container.actionRow?.components.splice(n!, 1)
        }

        for (let i = 0, len = ctx.container.components.length; i < len; i++) {
            const comp = ctx.container.components[i]
            if (!(comp instanceof ActionRowBuilder)) continue
            
            const index = comp.components.findIndex((x) => "custom_id" in x.data && x.data.custom_id === id)
            if (index !== -1) {
                if (comp.components.length === 1) ctx.container.components.splice(i, 1)
                else comp.components.splice(index, 1)
                break
            }
        }

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addActionRow`]($addActionRow.md)
- [`$addActionRowTo`]($addActionRowTo.md)
- [`$addButton`]($addButton.md)
- [`$addButtonTo`]($addButtonTo.md)
- [`$addChannelSelectMenu`]($addChannelSelectMenu.md)
- [`$addChannelSelectMenuTo`]($addChannelSelectMenuTo.md)
- [`$addChannelType`]($addChannelType.md)
- [`$addCheckbox`]($addCheckbox.md)

**Source:** [`src/native/component/deleteComponent.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/deleteComponent.ts)

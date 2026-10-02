# $addTextDisplay

> Adds a new text display component

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v2.4.0 | required | yes | — |

## Signature

```fs
$addTextDisplay[content]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `content` | `String` | **yes** | no | The content of this text display |

### Per-parameter notes

- **`content`** (`String`, required): The content of this text display. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addTextDisplay` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$addTextDisplay[Hello!]
```

## Reference implementation (source)

Taken from `src/native/component/addTextDisplay.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        addActionRow(ctx)
        const comp = ctx.container.components.at(-1)
        const text = new TextDisplayBuilder().setContent(content)

        if (ctx.container.modal) ctx.container.modal.addTextDisplayComponents(text)
        else if (ctx.container.isInside(ComponentType.Section)) ctx.component.section?.addTextDisplayComponents(text)
        else if (comp instanceof ContainerBuilder && ctx.container.isInside(ComponentType.Container)) 
            comp.addTextDisplayComponents(text)
        else ctx.container.components.push(text)

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

**Source:** [`src/native/component/addTextDisplay.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addTextDisplay.ts)

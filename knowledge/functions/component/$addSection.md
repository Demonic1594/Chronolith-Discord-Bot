# $addSection

> Adds a new section component

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v2.4.0 | required | no | — |

## Signature

```fs
$addSection[components]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `components` | `String` | **yes** | no | The components and accessory to add |

### Per-parameter notes

- **`components`** (`String`, required): The components and accessory to add. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addSection` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$addSection[value]
```

## Reference implementation (source)

Taken from `src/native/component/addSection.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        addActionRow(ctx)
        const comp = ctx.container.components.at(-1)
        ctx.component.section = new SectionBuilder()
        ctx.container.inside.push(ComponentType.Section)

        const code = this.data.fields![0] as IExtendedCompiledFunctionField
        const resolved = await this["resolveCode"](ctx, code)
        if (!this["isValidReturnType"](resolved)) return resolved

        if (comp instanceof ContainerBuilder && ctx.container.isInside(ComponentType.Container))
            comp.addSectionComponents(ctx.component.section)
        else ctx.container.components.push(ctx.component.section)

        delete ctx.component.section
        ctx.container.inside.pop()
        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
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

**Source:** [`src/native/component/addSection.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addSection.ts)

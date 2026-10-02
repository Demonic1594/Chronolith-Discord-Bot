# $addLabel

> Adds a new label component to the modal

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v2.6.0 | required | no | — |

## Signature

```fs
$addLabel[name;description;component]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name for the label |
| 2 | `description` | `String` | no | no | The description for the label |
| 3 | `component` | `String` | **yes** | no | The component to attach to the label |

### Per-parameter notes

- **`name`** (`String`, required): The name for the label. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`description`** (`String`, optional): The description for the label. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`component`** (`String`, required): The component to attach to the label. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addLabel` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$addLabel[name;value]
```

**Full form (all arguments)**

```fs
$addLabel[name;value;value]
```

## Reference implementation (source)

Taken from `src/native/component/addLabel.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (!ctx.interaction) return this.success()
        ctx.container.inside.push(ComponentType.Label)

        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1)
        if (!this["isValidReturnType"](rt)) return rt
        const [name, desc] = args

        const label = new LabelBuilder().setLabel(name)
        if (desc) label.setDescription(desc)

        ctx.component.label = label

        const code = this.data.fields![2] as IExtendedCompiledFunctionField
        const resolved = await this["resolveCode"](ctx, code)
        if (!this["isValidReturnType"](resolved)) return resolved

        ctx.container.modal?.addLabelComponents(ctx.component.label)

        ctx.component = {}
        ctx.container.inside.pop()
        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`description`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/component/addLabel.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addLabel.ts)

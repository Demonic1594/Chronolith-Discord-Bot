# $addSeparator

> Adds a new separator component

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v2.4.0 | optional | yes | — |

## Signature

```fs
$addSeparator[spacing;divider]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `spacing` | `Enum` | **yes** | no | The spacing of this separator |
| 2 | `divider` | `Boolean` | no | no | Whether to show a divider line |

### Per-parameter notes

- **`spacing`** (`Enum`, required): The spacing of this separator. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`divider`** (`Boolean`, optional): Whether to show a divider line. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addSeparator` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$addSeparator[value]
```

**Full form (all arguments)**

```fs
$addSeparator[value;true]
```

## Reference implementation (source)

Taken from `src/native/component/addSeparator.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        addActionRow(ctx)
        const comp = ctx.container.components.at(-1)
        const sep = new SeparatorBuilder()

        if (spacing) sep.setSpacing(spacing)
        if (divider === false) sep.setDivider(false)

        if (comp instanceof ContainerBuilder && ctx.container.isInside(ComponentType.Container))
            comp.addSeparatorComponents(sep)
        else ctx.container.components.push(sep)

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`divider`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/component/addSeparator.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addSeparator.ts)

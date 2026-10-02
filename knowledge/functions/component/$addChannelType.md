# $addChannelType

> Adds channel types to the last select menu

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v1.4.0 | required | yes | — |

> aliases: $addChannelTypes

## Signature

```fs
$addChannelType[types]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `types` | `Enum` | **yes** | yes | The channel types to add |

### Per-parameter notes

- **`types`** (`Enum` , rest, required): The channel types to add. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addChannelType` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `types` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$addChannelType[value]
```

## Reference implementation (source)

Taken from `src/native/component/addChannelType.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const menu = getLastComponent(ctx)
        if (menu instanceof ChannelSelectMenuBuilder) {
            menu.addChannelTypes(types)
        }
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$addChannelTypes` — function names are case-insensitive.
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
- [`$addCheckbox`]($addCheckbox.md)
- [`$addCheckboxGroup`]($addCheckboxGroup.md)

**Source:** [`src/native/component/addChannelType.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addChannelType.ts)

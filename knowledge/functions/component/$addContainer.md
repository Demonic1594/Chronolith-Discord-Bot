# $addContainer

> Adds a new container component

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v2.4.0 | required | no | — |

## Signature

```fs
$addContainer[components;color;spoiler]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `components` | `String` | **yes** | no | The components to add |
| 2 | `color` | `Color` | no | no | The color to set |
| 3 | `spoiler` | `Boolean` | no | no | Whether to set a spoiler |

### Per-parameter notes

- **`components`** (`String`, required): The components to add. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`color`** (`Color`, optional): The color to set. Expects a color. Accepts hex (`#5865F2` or `5865F2`), integer (`4455093`), and known color names via `resolveColor`.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`spoiler`** (`Boolean`, optional): Whether to set a spoiler. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addContainer` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$addContainer[value]
```

**Full form (all arguments)**

```fs
$addContainer[value;#5865F2;true]
```

## Reference implementation (source)

Taken from `src/native/component/addContainer.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        addActionRow(ctx)
        ctx.container.components.push(new ContainerBuilder())
        ctx.container.inside.push(ComponentType.Container)
        const comp = ctx.container.components.at(-1) as ContainerBuilder

        const code = this.data.fields![0] as IExtendedCompiledFunctionField
        const resolved = await this["resolveCode"](ctx, code)
        if (!this["isValidReturnType"](resolved)) return resolved

        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 1, 2)
        if (!this["isValidReturnType"](rt)) return rt
        const [ color, spoiler ] = args

        comp.setAccentColor(color || undefined)
        comp.setSpoiler(spoiler || false)

        addActionRow(ctx)
        ctx.container.inside.pop()
        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`color`, `spoiler`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
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

**Source:** [`src/native/component/addContainer.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addContainer.ts)

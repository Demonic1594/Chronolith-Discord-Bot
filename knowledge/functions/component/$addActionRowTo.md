# $addActionRowTo

> Adds an action row (or rows) to a message

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v1.5.0 | required | no | `Boolean` |

> aliases: $addActionRowsTo

## Signature

```fs
$addActionRowTo[channel ID;message ID;components;keep existing rows]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `TextChannel` | **yes** | no | The channel id to pull message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to add row to |
| 3 | `components` | `String` | **yes** | no | Components for this row |
| 4 | `keep existing rows` | `Boolean` | no | no | Whether to keep or remove existing rows of given message |

### Per-parameter notes

- **`channel ID`** (`TextChannel`, required): The channel id to pull message from. Expects a textable channel ID. Same snowflake rules as Channel, but the channel must support messages (`.messages` present), otherwise rejected.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`message ID`** (`Message`, required): The message to add row to. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`components`** (`String`, required): Components for this row. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`keep existing rows`** (`Boolean`, optional): Whether to keep or remove existing rows of given message. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addActionRowTo` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$addActionRowTo[123456789012345678;123456789012345678;value]
```

**Full form (all arguments)**

```fs
$addActionRowTo[123456789012345678;123456789012345678;value;true]
```

## Reference implementation (source)

Taken from `src/native/component/addActionRowTo.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3)
        if (!this["isValidReturnType"](rt)) return rt

        const [, m, keep ] = args
        const code = this.data.fields![2] as IExtendedCompiledFunctionField

        const comps = keep ? m.components.map((x) => createComponentBuilder(x.toJSON())) : new Array<ActionRowBuilder>()

        const oldContainer = ctx.runtime.container
        const newContainer = new Container()

        // Add our new rows
        newContainer.components = comps

        // Use new container
        ctx.container = newContainer

        const codeExec = await this["resolveCode"](ctx, code)
        addActionRow(ctx, false)

        // Return the container
        ctx.container = oldContainer!

        if (!this["isValidReturnType"](codeExec)) return codeExec

        // Since rows is a reference, we do not need to retrieve from container.
        return this.success(
            !!(await m.edit({ components: comps.map((x) => x.toJSON()) }).catch(ctx.noop))
        )
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$addActionRowsTo` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
4. Optional arguments (`keep existing rows`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
5. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
6. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
7. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
8. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addActionRow`]($addActionRow.md)
- [`$addButton`]($addButton.md)
- [`$addButtonTo`]($addButtonTo.md)
- [`$addChannelSelectMenu`]($addChannelSelectMenu.md)
- [`$addChannelSelectMenuTo`]($addChannelSelectMenuTo.md)
- [`$addChannelType`]($addChannelType.md)
- [`$addCheckbox`]($addCheckbox.md)
- [`$addCheckboxGroup`]($addCheckboxGroup.md)

**Source:** [`src/native/component/addActionRowTo.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addActionRowTo.ts)

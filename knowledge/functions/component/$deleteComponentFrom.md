# $deleteComponentFrom

> Deletes a message component with given custom id from a message

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v1.5.0 | required | yes | `Boolean` |

## Signature

```fs
$deleteComponentFrom[channel ID;message ID;custom ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `TextChannel` | **yes** | no | The channel id to pull message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to remove component from |
| 3 | `custom ID` | `String` | **yes** | no | The component's custom id to delete |

### Per-parameter notes

- **`channel ID`** (`TextChannel`, required): The channel id to pull message from. Expects a textable channel ID. Same snowflake rules as Channel, but the channel must support messages (`.messages` present), otherwise rejected.
- **`message ID`** (`Message`, required): The message to remove component from. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`custom ID`** (`String`, required): The component's custom id to delete. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$deleteComponentFrom` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteComponentFrom[123456789012345678;123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/component/deleteComponentFrom.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const components = m.components.map(x => ActionRowBuilder.from(x as ActionRow<MessageActionRowComponent>))

        for (let i = 0, len = components.length; i < len; i++) {
            const comp = components[i]
            const index = comp.components.findIndex((x) => "custom_id" in x.data && x.data.custom_id === id)
            if (index !== -1) {
                if (comp.components.length === 1) components.splice(i, 1)
                else comp.components.splice(index, 1)
                break
            }
        }

        return this.success(
            !!(await m.edit({ components: components as ActionRowBuilder<ButtonBuilder>[] }).catch(ctx.noop))
        )
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
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

**Source:** [`src/native/component/deleteComponentFrom.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/deleteComponentFrom.ts)

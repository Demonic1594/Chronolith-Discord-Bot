# $getComponents

> Retrieves data of a component, not providing any property returns component json

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `message` | v1.4.0 | optional | yes | `Json`, `Unknown` |

> aliases: $getComponent

## Signature

```fs
$getComponents[channel ID;message ID;row index;component index;property;separator;component index;property]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to pull message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to retrieve data from |
| 3 | `row index` | `Number` | no | no | The row index to get data from |
| 4 | `component index` | `Number` | no | no | The first component index to get data from |
| 5 | `property` | `Enum` | no | no | The first property to pull |
| 6 | `separator` | `String` | no | no | The separator to use for each value in case of array |
| 7 | `component index` | `Number` | no | no | The second component index to get data from |
| 8 | `property` | `Enum` | no | no | The second property to pull |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to pull message from. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`message ID`** (`Message`, required): The message to retrieve data from. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`row index`** (`Number`, optional): The row index to get data from. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`component index`** (`Number`, optional): The first component index to get data from. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`property`** (`Enum`, optional): The first property to pull. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`separator`** (`String`, optional): The separator to use for each value in case of array. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`component index`** (`Number`, optional): The second component index to get data from. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`property`** (`Enum`, optional): The second property to pull. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$getComponents` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getComponents[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$getComponents[123456789012345678;123456789012345678;5;5;value;,;5;value]
```

## Reference implementation (source)

Taken from `src/native/message/getComponents.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        m ??= ctx.message!
        let isV2 = m.flags.has(MessageFlags.IsComponentsV2)

        if (typeof rowIndex !== "number") {
            return this.successJSON(m?.components.map((x) =>
                isV2 ? x.toJSON() : (x as ActionRow<MessageActionRowComponent>).components
            ))
        }

        const row = m.components[rowIndex]
        const comps = "components" in row ? row.components : undefined
        const comp = (typeof compIndex1 === "number" ? comps?.[compIndex1] : undefined)

        if (!prop1) {
            return this.successJSON((isV2 ? comp : comp?.data) ?? (isV2 ? row : comps))
        }

        const comp1 = comp ?? row

        if (prop1 !== ComponentProperty.components && prop1 !== ComponentProperty.accessory) {
            return this.success(ComponentProperties[prop1](comp1, sep))
        }

        const comps2 = (prop1 === ComponentProperty.accessory && comp1 && "accessory" in comp1)
            ? comp1.accessory
            : comp1 && "components" in comp1
                ? comp1.components
                : undefined
        const comp2 = (!Array.isArray(comps2) ? comps2 : typeof compIndex2 === "number" ? comps2?.[compIndex2] : undefined)

        if (!prop2) {
            return this.successJSON(comp2?.data ?? comps2)
        }

        return this.success(ComponentProperties[prop2](comp2, sep))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$getComponent` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`row index`, `component index`, `property`, `separator`, `component index`, `property`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
6. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
7. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addMessageReactions`]($addMessageReactions.md)
- [`$attachment`]($attachment.md)
- [`$deleteAllMessageReactions`]($deleteAllMessageReactions.md)
- [`$deleteIn`]($deleteIn.md)
- [`$deleteMessage`]($deleteMessage.md)
- [`$deleteUserMessageReaction`]($deleteUserMessageReaction.md)
- [`$editMessage`]($editMessage.md)
- [`$fetchComponents`]($fetchComponents.md)

**Source:** [`src/native/message/getComponents.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/message/getComponents.ts)

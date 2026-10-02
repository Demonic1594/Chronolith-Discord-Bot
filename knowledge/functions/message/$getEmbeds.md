# $getEmbeds

> Retrieves data of an embed, not providing any property returns embed json

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `message` | v1.0.3 | optional | yes | `Unknown` |

> aliases: $getEmbed

## Signature

```fs
$getEmbeds[channel ID;message ID;embed index;property;field index]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to pull message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to retrieve data from |
| 3 | `embed index` | `Number` | no | no | The embed index to get data from |
| 4 | `property` | `Enum` | no | no | The property to pull |
| 5 | `field index` | `Number` | no | no | The index of field to get |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to pull message from. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`message ID`** (`Message`, required): The message to retrieve data from. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`embed index`** (`Number`, optional): The embed index to get data from. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`property`** (`Enum`, optional): The property to pull. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`field index`** (`Number`, optional): The index of field to get. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$getEmbeds` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getEmbeds[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$getEmbeds[123456789012345678;123456789012345678;5;value;5]
```

## Reference implementation (source)

Taken from `src/native/message/getEmbeds.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (typeof index !== "number") {
            return this.successJSON((m ?? ctx.message)?.embeds.map(x => x.data))
        }
        
        const embed = m.embeds[index] as Embed | undefined
        if (!prop) return this.successJSON(embed)

        return this.success(EmbedProperties[prop](embed ? EmbedBuilder.from(embed) : undefined, undefined, fieldIndex))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$getEmbed` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`embed index`, `property`, `field index`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/message/getEmbeds.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/message/getEmbeds.ts)

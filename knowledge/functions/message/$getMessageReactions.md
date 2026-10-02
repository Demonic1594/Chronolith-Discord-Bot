# $getMessageReactions

> Retrieves all reactions of a message

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `message` | v2.2.0 | optional | yes | `Unknown[]` |

> aliases: $getReactions

## Signature

```fs
$getMessageReactions[channel ID;message ID;property;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `TextChannel` | **yes** | no | The channel to pull message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to retrieve reactions from |
| 3 | `property` | `Enum` | no | no | The property of the reactions to return |
| 4 | `separator` | `String` | no | no | The separator to use for each property |

### Per-parameter notes

- **`channel ID`** (`TextChannel`, required): The channel to pull message from. Expects a textable channel ID. Same snowflake rules as Channel, but the channel must support messages (`.messages` present), otherwise rejected.
- **`message ID`** (`Message`, required): The message to retrieve reactions from. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`property`** (`Enum`, optional): The property of the reactions to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`separator`** (`String`, optional): The separator to use for each property. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$getMessageReactions` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getMessageReactions[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$getMessageReactions[123456789012345678;123456789012345678;value;,]
```

## Reference implementation (source)

Taken from `src/native/message/getMessageReactions.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const reactions = (await (message ?? ctx.message)?.fetch().catch(ctx.noop))?.reactions.cache
        return this.success(reactions?.map(reaction => ReactionProperties[prop || ReactionProperty.emoji](reaction, sep)).join(sep ?? ", "))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$getReactions` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`property`, `separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addMessageReactions`]($addMessageReactions.md)
- [`$attachment`]($attachment.md)
- [`$deleteAllMessageReactions`]($deleteAllMessageReactions.md)
- [`$deleteIn`]($deleteIn.md)
- [`$deleteMessage`]($deleteMessage.md)
- [`$deleteUserMessageReaction`]($deleteUserMessageReaction.md)
- [`$editMessage`]($editMessage.md)
- [`$fetchComponents`]($fetchComponents.md)

**Source:** [`src/native/message/getMessageReactions.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/message/getMessageReactions.ts)

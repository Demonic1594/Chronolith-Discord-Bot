# $getMessageReactionCount

> Gets the amount of users that have reacted to a specific emoji

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `message` | v1.0.0 | required | yes | `Number` |

## Signature

```fs
$getMessageReactionCount[channel ID;message ID;emoji;type]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel the message is located |
| 2 | `message ID` | `Message` | **yes** | no | The message to get emoji count from |
| 3 | `emoji` | `Reaction` | **yes** | no | The emoji to get its user count |
| 4 | `type` | `Enum` | no | no | The type of the reaction to count users for |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel the message is located. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`message ID`** (`Message`, required): The message to get emoji count from. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`emoji`** (`Reaction`, required): The emoji to get its user count. Expects a reaction emoji. Parsed with `parseEmoji` and looked up on the message resolved by the `pointer` argument.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`type`** (`Enum`, optional): The type of the reaction to count users for. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$getMessageReactionCount` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getMessageReactionCount[123456789012345678;123456789012345678;:smile:]
```

**Full form (all arguments)**

```fs
$getMessageReactionCount[123456789012345678;123456789012345678;:smile:;value]
```

## Reference implementation (source)

Taken from `src/native/message/getMessageReactionCount.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(type ? reaction?.countDetails?.[type] : reaction?.count)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`type`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addMessageReactions`]($addMessageReactions.md)
- [`$attachment`]($attachment.md)
- [`$deleteAllMessageReactions`]($deleteAllMessageReactions.md)
- [`$deleteIn`]($deleteIn.md)
- [`$deleteMessage`]($deleteMessage.md)
- [`$deleteUserMessageReaction`]($deleteUserMessageReaction.md)
- [`$editMessage`]($editMessage.md)
- [`$fetchComponents`]($fetchComponents.md)

**Source:** [`src/native/message/getMessageReactionCount.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/message/getMessageReactionCount.ts)

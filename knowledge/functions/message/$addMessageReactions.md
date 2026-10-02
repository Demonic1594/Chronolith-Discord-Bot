# $addMessageReactions

> Adds reactions to a message, returns amount of emojis successfully reacted

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `message` | v1.0.0 | required | yes | `Number` |

## Signature

```fs
$addMessageReactions[channel ID;message ID;emojis]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel the message is located |
| 2 | `message ID` | `Message` | **yes** | no | The message to add reactions to |
| 3 | `emojis` | `String` | **yes** | yes | The emojis to react with |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel the message is located. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`message ID`** (`Message`, required): The message to add reactions to. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`emojis`** (`String` , rest, required): The emojis to react with. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$addMessageReactions` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `emojis` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$addMessageReactions[123456789012345678;123456789012345678;:smile:]
```

## Reference implementation (source)

Taken from `src/native/message/addMessageReactions.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        let count = 0

        for (const emoji of emojis) {
            const success = await message.react(emoji).catch(ctx.noop)
            if (success) count++
        }

        return this.success(count)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$attachment`]($attachment.md)
- [`$deleteAllMessageReactions`]($deleteAllMessageReactions.md)
- [`$deleteIn`]($deleteIn.md)
- [`$deleteMessage`]($deleteMessage.md)
- [`$deleteUserMessageReaction`]($deleteUserMessageReaction.md)
- [`$editMessage`]($editMessage.md)
- [`$fetchComponents`]($fetchComponents.md)
- [`$fetchEmbeds`]($fetchEmbeds.md)

**Source:** [`src/native/message/addMessageReactions.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/message/addMessageReactions.ts)

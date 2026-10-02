# $deleteMessage

> Deletes given messages, returns the count of messages deleted

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `message` | v1.0.0 | required | yes | `Number` |

> aliases: $deleteMessages

## Signature

```fs
$deleteMessage[channel ID;messages]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to delete this message from |
| 2 | `messages` | `String` | **yes** | yes | The message ids to delete |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to delete this message from. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`messages`** (`String` , rest, required): The message ids to delete. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$deleteMessage` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `messages` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$deleteMessage[123456789012345678;Hello!]
```

## Reference implementation (source)

Taken from `src/native/message/deleteMessage.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const ch = (channel as TextChannel)
        if (!messages.length) return this.success(0)

        if (messages.length === 1) {
            try {
                await ch.messages.delete(messages[0])
                return this.success(1)
            } catch (error) {
                ctx.noop(error)
                return this.success(0)
            }
        }

        const col = (await ch
            .bulkDelete(messages, true)
            .then((x) => x.size)
            .catch(ctx.noop)) ?? 0
        return this.success(col)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$deleteMessages` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addMessageReactions`]($addMessageReactions.md)
- [`$attachment`]($attachment.md)
- [`$deleteAllMessageReactions`]($deleteAllMessageReactions.md)
- [`$deleteIn`]($deleteIn.md)
- [`$deleteUserMessageReaction`]($deleteUserMessageReaction.md)
- [`$editMessage`]($editMessage.md)
- [`$fetchComponents`]($fetchComponents.md)
- [`$fetchEmbeds`]($fetchEmbeds.md)

**Source:** [`src/native/message/deleteMessage.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/message/deleteMessage.ts)

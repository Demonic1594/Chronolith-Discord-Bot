# $fetchResponse

> Fetches all data from the message and loads it to the next response, this includes: embeds, components, attachments, stickers

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `message` | v1.4.0 | optional | yes | — |

## Signature

```fs
$fetchResponse[channel ID;message ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `TextChannel` | **yes** | no | The channel to pull message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to fetch its data |

### Per-parameter notes

- **`channel ID`** (`TextChannel`, required): The channel to pull message from. Expects a textable channel ID. Same snowflake rules as Channel, but the channel must support messages (`.messages` present), otherwise rejected.
- **`message ID`** (`Message`, required): The message to fetch its data. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$fetchResponse` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$fetchResponse[123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/message/fetchResponse.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        msg ??= ctx.message!
        if (msg) {
            ctx.container.embeds.push(...msg.embeds.map(x => EmbedBuilder.from(x)))
            ctx.container.components.push(...msg.components.map(x => buildComponent(x, ctx)))
            ctx.container.files.push(...msg.attachments.map(x => new AttachmentBuilder(x.url, { name: x.name })))
            ctx.container.stickers.push(...msg.stickers.map(x => x.id))
        }
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addMessageReactions`]($addMessageReactions.md)
- [`$attachment`]($attachment.md)
- [`$deleteAllMessageReactions`]($deleteAllMessageReactions.md)
- [`$deleteIn`]($deleteIn.md)
- [`$deleteMessage`]($deleteMessage.md)
- [`$deleteUserMessageReaction`]($deleteUserMessageReaction.md)
- [`$editMessage`]($editMessage.md)
- [`$fetchComponents`]($fetchComponents.md)

**Source:** [`src/native/message/fetchResponse.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/message/fetchResponse.ts)

# $sendMessage

> Sends a message to a channel

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v1.0.0 | required | yes | `Message` |

> aliases: $channelSendMessage

## Signature

```fs
$sendMessage[channel ID;content;return message ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to send this message to |
| 2 | `content` | `String` | no | no | The content for the message |
| 3 | `return message ID` | `Boolean` | no | no | Whether to return the message id of the newly sent message |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to send this message to. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`content`** (`String`, optional): The content for the message. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`return message ID`** (`Boolean`, optional): Whether to return the message id of the newly sent message. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$sendMessage` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Simple send**

```fs
$sendMessage[$channelID;Hello world!;false]
```

**Return the sent message ID**

```fs
$let[msgID;$sendMessage[$channelID;Pinned!;true]]
```

**To another channel**

```fs
$sendMessage[123456789012345678;Announcement from $username[$authorID]!;false]
```

## Reference implementation (source)

Taken from `src/native/channel/sendMessage.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.container.content = content || undefined
        const msg = await ctx.container.send<Message<true>>(channel)
        return this.success(returnMessageID ? msg?.id : undefined)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$channelSendMessage` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`content`, `return message ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
6. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
7. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addChannelPerms`]($addChannelPerms.md)
- [`$addPermissionOverwrite`]($addPermissionOverwrite.md)
- [`$addPostTags`]($addPostTags.md)
- [`$addThreadMember`]($addThreadMember.md)
- [`$archiveThread`]($archiveThread.md)
- [`$channelBitrate`]($channelBitrate.md)
- [`$channelCategoryID`]($channelCategoryID.md)
- [`$channelChildrenCount`]($channelChildrenCount.md)

## Community guides covering this function

- [$sendMessage guide](../../guides/guide-127.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-127)

**Source:** [`src/native/channel/sendMessage.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/sendMessage.ts)

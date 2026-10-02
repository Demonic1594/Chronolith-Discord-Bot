# $webhookSend

> Sends a message with a webhook

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `webhook` | v1.0.0 | required | yes | `Message` |

## Signature

```fs
$webhookSend[url;content;return message ID;username;avatar;thread ID;post name;tags]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `url` | `String` | **yes** | no | The webhook url |
| 2 | `content` | `String` | no | no | The content for the message |
| 3 | `return message ID` | `Boolean` | no | no | Return the message id of the sent message |
| 4 | `username` | `String` | no | no | The username for the message |
| 5 | `avatar` | `String` | no | no | The avatar for the message |
| 6 | `thread ID` | `Channel` | no | no | The thread to send message to |
| 7 | `post name` | `String` | no | no | The name for the created forum post |
| 8 | `tags` | `String` | no | yes | The tags for the created forum post |

### Per-parameter notes

- **`url`** (`String`, required): The webhook url. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`content`** (`String`, optional): The content for the message. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`return message ID`** (`Boolean`, optional): Return the message id of the sent message. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`username`** (`String`, optional): The username for the message. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`avatar`** (`String`, optional): The avatar for the message. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`thread ID`** (`Channel`, optional): The thread to send message to. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`post name`** (`String`, optional): The name for the created forum post. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`tags`** (`String` , rest, optional): The tags for the created forum post. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Webhook functions create, edit, execute and delete webhooks.

`$webhookSend` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `tags` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$webhookSend[https://example.com]
```

**Full form (all arguments)**

```fs
$webhookSend[https://example.com;Hello!;true;name;value;123456789012345678;name;value]
```

## Reference implementation (source)

Taken from `src/native/webhook/webhookSend.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const web = new WebhookClient({ url })

        ctx.container.content = content || undefined
        ctx.container.avatarURL = avatarUrl || undefined
        ctx.container.username = username || undefined
        ctx.container.threadId = thread?.id || undefined
        ctx.container.threadName = name || undefined
        ctx.container.appliedTags = tags || undefined
        ctx.container.withComponents = true

        const m = await ctx.container.send<Message>(web)
        return this.success(returnMessageID && m ? m.id : undefined)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`content`, `return message ID`, `username`, `avatar`, `thread ID`, `post name`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$getWebhook`]($getWebhook.md)
- [`$webhookCreate`]($webhookCreate.md)
- [`$webhookDelete`]($webhookDelete.md)
- [`$webhookEdit`]($webhookEdit.md)
- [`$webhookEditMessage`]($webhookEditMessage.md)
- [`$webhookExists`]($webhookExists.md)
- [`$webhookIsUserCreated`]($webhookIsUserCreated.md)
- [`$webhookToken`]($webhookToken.md)

**Source:** [`src/native/webhook/webhookSend.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/webhook/webhookSend.ts)

# $webhookEditMessage

> Edits a webhook message, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `webhook` | v1.5.0 | required | yes | `Boolean` |

## Signature

```fs
$webhookEditMessage[url;message ID;content;thread ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `url` | `String` | **yes** | no | The webhook url |
| 2 | `message ID` | `String` | **yes** | no | The message to edit |
| 3 | `content` | `String` | no | no | The new content for the message |
| 4 | `thread ID` | `Channel` | no | no | The thread this message belongs to |

### Per-parameter notes

- **`url`** (`String`, required): The webhook url. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`message ID`** (`String`, required): The message to edit. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`content`** (`String`, optional): The new content for the message. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`thread ID`** (`Channel`, optional): The thread this message belongs to. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.

## How it works

Webhook functions create, edit, execute and delete webhooks.

`$webhookEditMessage` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$webhookEditMessage[https://example.com;Hello!]
```

**Full form (all arguments)**

```fs
$webhookEditMessage[https://example.com;Hello!;Hello!;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/webhook/webhookEditMessage.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const web = new WebhookClient({ url })

        ctx.container.content = content || undefined
        ctx.container.threadId = thread?.id || undefined
        ctx.container.edit = true
        ctx.container.withComponents = true

        return this.success(!!(await ctx.container.send<Message>(web, undefined, msg)))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`content`, `thread ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$getWebhook`]($getWebhook.md)
- [`$webhookCreate`]($webhookCreate.md)
- [`$webhookDelete`]($webhookDelete.md)
- [`$webhookEdit`]($webhookEdit.md)
- [`$webhookExists`]($webhookExists.md)
- [`$webhookIsUserCreated`]($webhookIsUserCreated.md)
- [`$webhookSend`]($webhookSend.md)
- [`$webhookToken`]($webhookToken.md)

**Source:** [`src/native/webhook/webhookEditMessage.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/webhook/webhookEditMessage.ts)

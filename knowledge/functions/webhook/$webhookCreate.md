# $webhookCreate

> Creates a webhook in a channel, returns the webhook id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `webhook` | v1.0.0 | required | yes | `Webhook` |

## Signature

```fs
$webhookCreate[channel ID;name;url]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to create the webhook |
| 2 | `name` | `String` | **yes** | no | The webhook name |
| 3 | `url` | `String` | no | no | The avatar url |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to create the webhook. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`name`** (`String`, required): The webhook name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`url`** (`String`, optional): The avatar url. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Webhook functions create, edit, execute and delete webhooks.

`$webhookCreate` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$webhookCreate[123456789012345678;name]
```

**Full form (all arguments)**

```fs
$webhookCreate[123456789012345678;name;https://example.com]
```

## Reference implementation (source)

Taken from `src/native/webhook/webhookCreate.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const ch = channel as TextChannel
        const web = await ch
            .createWebhook({
                name: name,
                avatar: url || undefined,
                reason: ctx.reason
            })
            .catch(ctx.noop)

        return this.success(web ? web.id : undefined)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`url`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$getWebhook`]($getWebhook.md)
- [`$webhookDelete`]($webhookDelete.md)
- [`$webhookEdit`]($webhookEdit.md)
- [`$webhookEditMessage`]($webhookEditMessage.md)
- [`$webhookExists`]($webhookExists.md)
- [`$webhookIsUserCreated`]($webhookIsUserCreated.md)
- [`$webhookSend`]($webhookSend.md)
- [`$webhookToken`]($webhookToken.md)

**Source:** [`src/native/webhook/webhookCreate.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/webhook/webhookCreate.ts)

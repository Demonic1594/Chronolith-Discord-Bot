# $getWebhook

> Returns a webhook from a channel

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `webhook` | v2.6.0 | required | yes | `Json`, `Unknown` |

## Signature

```fs
$getWebhook[webhook ID;property]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `webhook ID` | `Webhook` | **yes** | no | The webhook to get |
| 2 | `property` | `Enum` | no | no | The property of the webhook to return |

### Per-parameter notes

- **`webhook ID`** (`Webhook`, required): The webhook to get. Expects a webhook ID. Fetched via `client.fetchWebhook`.
- **`property`** (`Enum`, optional): The property of the webhook to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Webhook functions create, edit, execute and delete webhooks.

`$getWebhook` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getWebhook[123456789012345678]
```

**Full form (all arguments)**

```fs
$getWebhook[123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/native/webhook/getWebhook.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (prop) return this.success(WebhookProperties[prop](web))
        return this.successJSON(web)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`property`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$webhookCreate`]($webhookCreate.md)
- [`$webhookDelete`]($webhookDelete.md)
- [`$webhookEdit`]($webhookEdit.md)
- [`$webhookEditMessage`]($webhookEditMessage.md)
- [`$webhookExists`]($webhookExists.md)
- [`$webhookIsUserCreated`]($webhookIsUserCreated.md)
- [`$webhookSend`]($webhookSend.md)
- [`$webhookToken`]($webhookToken.md)

**Source:** [`src/native/webhook/getWebhook.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/webhook/getWebhook.ts)

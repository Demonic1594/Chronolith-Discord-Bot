# $webhookURL

> Returns the url of a webhook

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `webhook` | v1.0.0 | required | yes | `URL` |

## Signature

```fs
$webhookURL[webhook ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `webhook ID` | `Webhook` | **yes** | no | The webhook to pull data from |

### Per-parameter notes

- **`webhook ID`** (`Webhook`, required): The webhook to pull data from. Expects a webhook ID. Fetched via `client.fetchWebhook`.

## How it works

Webhook functions create, edit, execute and delete webhooks.

`$webhookURL` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$webhookURL[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/webhook/webhookURL.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(web.url)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$getWebhook`]($getWebhook.md)
- [`$webhookCreate`]($webhookCreate.md)
- [`$webhookDelete`]($webhookDelete.md)
- [`$webhookEdit`]($webhookEdit.md)
- [`$webhookEditMessage`]($webhookEditMessage.md)
- [`$webhookExists`]($webhookExists.md)
- [`$webhookIsUserCreated`]($webhookIsUserCreated.md)
- [`$webhookSend`]($webhookSend.md)

**Source:** [`src/native/webhook/webhookURL.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/webhook/webhookURL.ts)

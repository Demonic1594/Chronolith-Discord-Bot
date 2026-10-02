# $webhookExists

> Checks whether given webhook id exists

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `webhook` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$webhookExists[webhook ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `webhook ID` | `String` | **yes** | no | The webhook id to check for |

### Per-parameter notes

- **`webhook ID`** (`String`, required): The webhook id to check for. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Webhook functions create, edit, execute and delete webhooks.

`$webhookExists` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$webhookExists[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/webhook/webhookExists.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(CompiledFunction.IdRegex.test(id) && (await ctx.client.fetchWebhook(id).catch(() => false)) !== false)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$getWebhook`]($getWebhook.md)
- [`$webhookCreate`]($webhookCreate.md)
- [`$webhookDelete`]($webhookDelete.md)
- [`$webhookEdit`]($webhookEdit.md)
- [`$webhookEditMessage`]($webhookEditMessage.md)
- [`$webhookIsUserCreated`]($webhookIsUserCreated.md)
- [`$webhookSend`]($webhookSend.md)
- [`$webhookToken`]($webhookToken.md)

**Source:** [`src/native/webhook/webhookExists.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/webhook/webhookExists.ts)

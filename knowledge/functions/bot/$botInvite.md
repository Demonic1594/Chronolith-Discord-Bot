# $botInvite

> Returns a bot's invite link

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `bot` | v1.0.0 | optional | yes | `URL` |

> aliases: $clientInvite, $getBotInvite

## Signature

```fs
$botInvite[perms]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `perms` | `String` | **yes** | yes | The perms for the invite link |

### Per-parameter notes

- **`perms`** (`String` , rest, required): The perms for the invite link. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Bot functions expose the client itself — its user, settings, uptime, presence and similar self-inspection utilities.

`$botInvite` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `perms` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$botInvite[value]
```

## Reference implementation (source)

Taken from `src/native/bot/botInvite.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            ctx.client.generateInvite({
                scopes: ctx.client.application.installParams?.scopes as OAuth2Scopes[] || [OAuth2Scopes.Bot],
                permissions: perms as PermissionsString[] || ctx.client.application.installParams?.permissions,
            })
        )
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$clientInvite`, `$getBotInvite` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$applicationCommandCount`]($applicationCommandCount.md)
- [`$applicationCommands`]($applicationCommands.md)
- [`$botCount`]($botCount.md)
- [`$botCustomInvite`]($botCustomInvite.md)
- [`$botDescription`]($botDescription.md)
- [`$botDestroy`]($botDestroy.md)
- [`$botID`]($botID.md)
- [`$botMutualGuilds`]($botMutualGuilds.md)

**Source:** [`src/native/bot/botInvite.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/bot/botInvite.ts)

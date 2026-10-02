# $botTeamCreatedAt

> Returns the client's team creation timestamp

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `bot` | v2.4.0 | none | no | `Number` |

> aliases: $clientTeamCreatedAt

## Signature

```fs
$botTeamCreatedAt
```

## How it works

Bot functions expose the client itself — its user, settings, uptime, presence and similar self-inspection utilities.

`$botTeamCreatedAt` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$botTeamCreatedAt
```

## Reference implementation (source)

Taken from `src/native/bot/botTeamCreatedAt.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (!ctx.client.application.owner) await ctx.client.application.fetch().catch(ctx.noop)
        const owner = ctx.client.application.owner
        return this.success(owner instanceof Team ? owner.createdTimestamp : null)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$clientTeamCreatedAt` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. This function has no brackets — it is used bare.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$applicationCommandCount`]($applicationCommandCount.md)
- [`$applicationCommands`]($applicationCommands.md)
- [`$botCount`]($botCount.md)
- [`$botCustomInvite`]($botCustomInvite.md)
- [`$botDescription`]($botDescription.md)
- [`$botDestroy`]($botDestroy.md)
- [`$botID`]($botID.md)
- [`$botInvite`]($botInvite.md)

**Source:** [`src/native/bot/botTeamCreatedAt.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/bot/botTeamCreatedAt.ts)

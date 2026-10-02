# $botDestroy

> Destroys the discord.js client

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `bot` | v1.0.0 | none | no | — |

> aliases: $clientDestroy

## Signature

```fs
$botDestroy
```

## How it works

Bot functions expose the client itself — its user, settings, uptime, presence and similar self-inspection utilities.

`$botDestroy` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$botDestroy
```

## Reference implementation (source)

Taken from `src/native/bot/botDestroy.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.client.destroy()
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$clientDestroy` — function names are case-insensitive.
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
- [`$botID`]($botID.md)
- [`$botInvite`]($botInvite.md)
- [`$botMutualGuilds`]($botMutualGuilds.md)

## Community guides covering this function

- [$botDestroy guide](../../guides/guide-80.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-80)

**Source:** [`src/native/bot/botDestroy.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/bot/botDestroy.ts)

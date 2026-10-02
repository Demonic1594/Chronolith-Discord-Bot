# $updateCommands

> Updates bot commands, also registers new ones

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `bot` | v1.0.2 | none | no | — |

## Signature

```fs
$updateCommands
```

## How it works

Bot functions expose the client itself — its user, settings, uptime, presence and similar self-inspection utilities.

`$updateCommands` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$updateCommands
```

## Reference implementation (source)

Taken from `src/native/bot/updateCommands.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.client.commandManagers.forEach(x => x.refresh())
        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
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
- [`$botInvite`]($botInvite.md)

**Source:** [`src/native/bot/updateCommands.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/bot/updateCommands.ts)

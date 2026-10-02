# $deleteGlobalApplicationCommands

> Deletes all global commands of your bot

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `bot` | v2.3.0 | none | no | `Boolean` |

## Signature

```fs
$deleteGlobalApplicationCommands
```

## How it works

Bot functions expose the client itself — its user, settings, uptime, presence and similar self-inspection utilities.

`$deleteGlobalApplicationCommands` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$deleteGlobalApplicationCommands
```

## Reference implementation (source)

Taken from `src/native/bot/deleteGlobalApplicationCommands.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(!!(await ctx.client.application?.commands.set([]).catch(ctx.noop)))
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

**Source:** [`src/native/bot/deleteGlobalApplicationCommands.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/bot/deleteGlobalApplicationCommands.ts)

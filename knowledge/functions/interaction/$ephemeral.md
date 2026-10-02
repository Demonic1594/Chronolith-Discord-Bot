# $ephemeral

> Marks this reply as ephemeral

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `interaction` | v1.0.0 | none | no | — |

## Signature

```fs
$ephemeral
```

## How it works

Interaction functions handle slash commands, context menus, buttons, select menus and modals — replying, deferring, updating, reading options and raw data.

`$ephemeral` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$ephemeral
```

## Reference implementation (source)

Taken from `src/native/interaction/ephemeral.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.container.ephemeral = true
        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.
5. VERIFIED (2.7.1): the flag is read at FLUSH time (defer/reply), not at call time — it must appear BEFORE `$defer`/`$interactionReply`; after them it has no effect.

## Related functions

- [`$applicationCommandDescription`]($applicationCommandDescription.md)
- [`$applicationCommandDisplay`]($applicationCommandDisplay.md)
- [`$applicationCommandID`]($applicationCommandID.md)
- [`$applicationCommandName`]($applicationCommandName.md)
- [`$applicationCommandOptions`]($applicationCommandOptions.md)
- [`$applicationSubCommandGroupName`]($applicationSubCommandGroupName.md)
- [`$applicationSubCommandName`]($applicationSubCommandName.md)
- [`$authorizingIntegrationOwners`]($authorizingIntegrationOwners.md)

**Source:** [`src/native/interaction/ephemeral.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/interaction/ephemeral.ts)

# $interactionRequirePremium

> Requires premium to use this interaction

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `interaction` | v1.5.0 | none | no | — |

> 🚫 **deprecated**

## Signature

```fs
$interactionRequirePremium
```

## How it works

Interaction functions handle slash commands, context menus, buttons, select menus and modals — replying, deferring, updating, reading options and raw data.

`$interactionRequirePremium` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$interactionRequirePremium
```

## Reference implementation (source)

Taken from `src/native/interaction/interactionRequirePremium.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        Logger.deprecated(
            "$interactionRequirePremium is deprecated and will be removed with the release of discord.js v15.0.0, please use the new premium-style buttons, this is the new Discord behavior."
        )
        if (ctx.interaction?.isRepliable())
            await ctx.interaction.sendPremiumRequired()
        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Marked **deprecated** in source — migrate away from this function.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$applicationCommandDescription`]($applicationCommandDescription.md)
- [`$applicationCommandDisplay`]($applicationCommandDisplay.md)
- [`$applicationCommandID`]($applicationCommandID.md)
- [`$applicationCommandName`]($applicationCommandName.md)
- [`$applicationCommandOptions`]($applicationCommandOptions.md)
- [`$applicationSubCommandGroupName`]($applicationSubCommandGroupName.md)
- [`$applicationSubCommandName`]($applicationSubCommandName.md)
- [`$authorizingIntegrationOwners`]($authorizingIntegrationOwners.md)

**Source:** [`src/native/interaction/interactionRequirePremium.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/interaction/interactionRequirePremium.ts)

# $isActivityCommand

> Returns whether the interaction is an activity command

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `interaction` | v2.4.0 | none | no | `Boolean` |

## Signature

```fs
$isActivityCommand
```

## How it works

Interaction functions handle slash commands, context menus, buttons, select menus and modals — replying, deferring, updating, reading options and raw data.

`$isActivityCommand` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$isActivityCommand
```

## Reference implementation (source)

Taken from `src/native/interaction/isActivityCommand.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(Boolean(ctx.interaction?.isPrimaryEntryPointCommand()))
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$applicationCommandDescription`]($applicationCommandDescription.md)
- [`$applicationCommandDisplay`]($applicationCommandDisplay.md)
- [`$applicationCommandID`]($applicationCommandID.md)
- [`$applicationCommandName`]($applicationCommandName.md)
- [`$applicationCommandOptions`]($applicationCommandOptions.md)
- [`$applicationSubCommandGroupName`]($applicationSubCommandGroupName.md)
- [`$applicationSubCommandName`]($applicationSubCommandName.md)
- [`$authorizingIntegrationOwners`]($authorizingIntegrationOwners.md)

**Source:** [`src/native/interaction/isActivityCommand.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/interaction/isActivityCommand.ts)

# $applicationCommandID

> Returns the application command id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `interaction` | v1.0.7 | optional | yes | `String` |

## Signature

```fs
$applicationCommandID[name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the command to pull its id |

### Per-parameter notes

- **`name`** (`String`, required): The name of the command to pull its id. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Interaction functions handle slash commands, context menus, buttons, select menus and modals — replying, deferring, updating, reading options and raw data.

`$applicationCommandID` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$applicationCommandID[name]
```

## Reference implementation (source)

Taken from `src/native/interaction/applicationCommandID.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (this.hasFields) {
            const commands = await ctx.client.application.commands.fetch().catch(ctx.noop)
            return this.success(commands?.find((x) => x.name === name)?.id)
        }

        return this.success(ctx.interaction && "command" in ctx.interaction ? ctx.interaction.commandId : undefined)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$applicationCommandDescription`]($applicationCommandDescription.md)
- [`$applicationCommandDisplay`]($applicationCommandDisplay.md)
- [`$applicationCommandName`]($applicationCommandName.md)
- [`$applicationCommandOptions`]($applicationCommandOptions.md)
- [`$applicationSubCommandGroupName`]($applicationSubCommandGroupName.md)
- [`$applicationSubCommandName`]($applicationSubCommandName.md)
- [`$authorizingIntegrationOwners`]($authorizingIntegrationOwners.md)
- [`$autocomplete`]($autocomplete.md)

**Source:** [`src/native/interaction/applicationCommandID.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/interaction/applicationCommandID.ts)

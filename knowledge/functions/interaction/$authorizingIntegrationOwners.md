# $authorizingIntegrationOwners

> Returns the authorizing integration owners of this interaction

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `interaction` | v1.5.0 | optional | yes | `Json`, `User`, `Guild` |

## Signature

```fs
$authorizingIntegrationOwners[type]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `type` | `Enum` | **yes** | no | The type of authorizing integration owners to return |

### Per-parameter notes

- **`type`** (`Enum`, required): The type of authorizing integration owners to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Interaction functions handle slash commands, context menus, buttons, select menus and modals — replying, deferring, updating, reading options and raw data.

`$authorizingIntegrationOwners` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$authorizingIntegrationOwners[value]
```

## Reference implementation (source)

Taken from `src/native/interaction/authorizingIntegrationOwners.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const owners = ctx.interaction && "authorizingIntegrationOwners" in ctx.interaction ? ctx.interaction.authorizingIntegrationOwners : undefined
        return this.successJSON(owners && this.hasFields ? owners[type] : owners)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$applicationCommandDescription`]($applicationCommandDescription.md)
- [`$applicationCommandDisplay`]($applicationCommandDisplay.md)
- [`$applicationCommandID`]($applicationCommandID.md)
- [`$applicationCommandName`]($applicationCommandName.md)
- [`$applicationCommandOptions`]($applicationCommandOptions.md)
- [`$applicationSubCommandGroupName`]($applicationSubCommandGroupName.md)
- [`$applicationSubCommandName`]($applicationSubCommandName.md)
- [`$autocomplete`]($autocomplete.md)

**Source:** [`src/native/interaction/authorizingIntegrationOwners.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/interaction/authorizingIntegrationOwners.ts)

# $targetMessageEmbeds

> Retrieves data of embeds from the target message

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `interaction` | v1.5.0 | optional | yes | `Json`, `Unknown` |

> aliases: $targetMessageEmbed

## Signature

```fs
$targetMessageEmbeds[embed index;property;field index]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `embed index` | `Number` | no | no | The embed index to get data from |
| 2 | `property` | `Enum` | no | no | The property to pull |
| 3 | `field index` | `Number` | no | no | The index of the field to get |

### Per-parameter notes

- **`embed index`** (`Number`, optional): The embed index to get data from. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`property`** (`Enum`, optional): The property to pull. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`field index`** (`Number`, optional): The index of the field to get. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Interaction functions handle slash commands, context menus, buttons, select menus and modals — replying, deferring, updating, reading options and raw data.

`$targetMessageEmbeds` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$targetMessageEmbeds[5]
```

**Full form (all arguments)**

```fs
$targetMessageEmbeds[5;value;5]
```

## Reference implementation (source)

Taken from `src/native/interaction/targetMessageEmbeds.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (!ctx.interaction?.isMessageContextMenuCommand()) return this.success()

        const message = ctx.interaction.targetMessage
        if (typeof index !== "number") return this.successJSON(message.embeds.map(x => x.data))

        const embed = message.embeds[index] as Embed | undefined
        if (prop === null) return this.successJSON(embed)

        return this.success(EmbedProperties[prop](embed ? EmbedBuilder.from(embed) : undefined, undefined, fieldIndex))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$targetMessageEmbed` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`embed index`, `property`, `field index`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$applicationCommandDescription`]($applicationCommandDescription.md)
- [`$applicationCommandDisplay`]($applicationCommandDisplay.md)
- [`$applicationCommandID`]($applicationCommandID.md)
- [`$applicationCommandName`]($applicationCommandName.md)
- [`$applicationCommandOptions`]($applicationCommandOptions.md)
- [`$applicationSubCommandGroupName`]($applicationSubCommandGroupName.md)
- [`$applicationSubCommandName`]($applicationSubCommandName.md)
- [`$authorizingIntegrationOwners`]($authorizingIntegrationOwners.md)

**Source:** [`src/native/interaction/targetMessageEmbeds.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/interaction/targetMessageEmbeds.ts)

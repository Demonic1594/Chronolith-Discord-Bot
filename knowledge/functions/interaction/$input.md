# $input

> Returns the value from a modal field

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `interaction` | v1.0.0 | required | yes | `String` |

## Signature

```fs
$input[custom ID;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `custom ID` | `String` | **yes** | no | The custom id to get its field value |
| 2 | `separator` | `String` | no | no | The separator to use in case of array |

### Per-parameter notes

- **`custom ID`** (`String`, required): The custom id to get its field value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`separator`** (`String`, optional): The separator to use in case of array. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Interaction functions handle slash commands, context menus, buttons, select menus and modals — replying, deferring, updating, reading options and raw data.

`$input` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$input[123456789012345678]
```

**Full form (all arguments)**

```fs
$input[123456789012345678;,]
```

## Reference implementation (source)

Taken from `src/native/interaction/input.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (!ctx.interaction?.isModalSubmit()) return this.success()
        const field = ctx.interaction.fields.getField(id)

        return this.success(
            "value" in field
                ? field.value
                : ("attachments" in field && field.type === ComponentType.FileUpload)
                    ? field.attachments.map((x) => x.url).join(sep ?? ", ")
                    : field.values.join(sep ?? ", ")
        )
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/interaction/input.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/interaction/input.ts)

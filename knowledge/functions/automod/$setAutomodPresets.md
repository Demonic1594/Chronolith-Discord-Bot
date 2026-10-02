# $setAutomodPresets

> Sets preset keyword wordsets for current automod rule

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `automod` | v1.5.0 | required | yes | — |

## Signature

```fs
$setAutomodPresets[presets]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `presets` | `Enum` | **yes** | yes | The preset keyword types to set |

### Per-parameter notes

- **`presets`** (`Enum` , rest, required): The preset keyword types to set. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Automod functions create/edit/delete/read auto-moderation rules for a guild (requires the `AutoModeration*` intents and `ManageGuild`).

`$setAutomodPresets` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `presets` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$setAutomodPresets[value]
```

## Reference implementation (source)

Taken from `src/native/automod/setAutomodPresets.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.automodRule.triggerMetadata ??= {}
        ctx.automodRule.triggerMetadata.presets = presets
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$automodActionType`]($automodActionType.md)
- [`$automodAlertSystemMessageID`]($automodAlertSystemMessageID.md)
- [`$automodChannelID`]($automodChannelID.md)
- [`$automodContent`]($automodContent.md)
- [`$automodCustomMessage`]($automodCustomMessage.md)
- [`$automodDuration`]($automodDuration.md)
- [`$automodMatchedContent`]($automodMatchedContent.md)
- [`$automodMatchedKeyword`]($automodMatchedKeyword.md)

**Source:** [`src/native/automod/setAutomodPresets.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/automod/setAutomodPresets.ts)

# $automodActionType

> Returns the action type automod used

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `automod` | v1.2.0 | none | no | `AutoModerationActionType` |

## Signature

```fs
$automodActionType
```

## How it works

Automod functions create/edit/delete/read auto-moderation rules for a guild (requires the `AutoModeration*` intents and `ManageGuild`).

`$automodActionType` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$automodActionType
```

## Reference implementation (source)

Taken from `src/native/automod/automodActionType.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const type = ctx.automod?.action.type
        return this.success(type ? AutoModerationActionType[type] : null)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$automodAlertSystemMessageID`]($automodAlertSystemMessageID.md)
- [`$automodChannelID`]($automodChannelID.md)
- [`$automodContent`]($automodContent.md)
- [`$automodCustomMessage`]($automodCustomMessage.md)
- [`$automodDuration`]($automodDuration.md)
- [`$automodMatchedContent`]($automodMatchedContent.md)
- [`$automodMatchedKeyword`]($automodMatchedKeyword.md)
- [`$automodRuleID`]($automodRuleID.md)

**Source:** [`src/native/automod/automodActionType.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/automod/automodActionType.ts)

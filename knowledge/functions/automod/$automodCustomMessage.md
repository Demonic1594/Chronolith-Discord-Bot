# $automodCustomMessage

> Returns the custom message used by automod on this detection

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `automod` | v1.2.0 | none | no | `String` |

## Signature

```fs
$automodCustomMessage
```

## How it works

Automod functions create/edit/delete/read auto-moderation rules for a guild (requires the `AutoModeration*` intents and `ManageGuild`).

`$automodCustomMessage` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$automodCustomMessage
```

## Reference implementation (source)

Taken from `src/native/automod/automodCustomMessage.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.automod?.action.metadata.customMessage)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$automodActionType`]($automodActionType.md)
- [`$automodAlertSystemMessageID`]($automodAlertSystemMessageID.md)
- [`$automodChannelID`]($automodChannelID.md)
- [`$automodContent`]($automodContent.md)
- [`$automodDuration`]($automodDuration.md)
- [`$automodMatchedContent`]($automodMatchedContent.md)
- [`$automodMatchedKeyword`]($automodMatchedKeyword.md)
- [`$automodRuleID`]($automodRuleID.md)

**Source:** [`src/native/automod/automodCustomMessage.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/automod/automodCustomMessage.ts)

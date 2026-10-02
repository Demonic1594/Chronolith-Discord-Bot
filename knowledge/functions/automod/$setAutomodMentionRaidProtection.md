# $setAutomodMentionRaidProtection

> Sets mention raid protection for current automod rule

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `automod` | v1.5.0 | required | yes | — |

## Signature

```fs
$setAutomodMentionRaidProtection[enabled]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `enabled` | `Boolean` | **yes** | no | Whether to enable mention raid protection |

### Per-parameter notes

- **`enabled`** (`Boolean`, required): Whether to enable mention raid protection. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Automod functions create/edit/delete/read auto-moderation rules for a guild (requires the `AutoModeration*` intents and `ManageGuild`).

`$setAutomodMentionRaidProtection` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setAutomodMentionRaidProtection[true]
```

## Reference implementation (source)

Taken from `src/native/automod/setAutomodMentionRaidProtection.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.automodRule.triggerMetadata ??= {}
        ctx.automodRule.triggerMetadata.mentionRaidProtectionEnabled = enabled
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$automodActionType`]($automodActionType.md)
- [`$automodAlertSystemMessageID`]($automodAlertSystemMessageID.md)
- [`$automodChannelID`]($automodChannelID.md)
- [`$automodContent`]($automodContent.md)
- [`$automodCustomMessage`]($automodCustomMessage.md)
- [`$automodDuration`]($automodDuration.md)
- [`$automodMatchedContent`]($automodMatchedContent.md)
- [`$automodMatchedKeyword`]($automodMatchedKeyword.md)

**Source:** [`src/native/automod/setAutomodMentionRaidProtection.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/automod/setAutomodMentionRaidProtection.ts)

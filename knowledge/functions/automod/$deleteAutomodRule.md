# $deleteAutomodRule

> Deletes an automod rule from a guild, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `automod` | v1.5.0 | required | yes | `Boolean` |

## Signature

```fs
$deleteAutomodRule[guild ID;rule ID;reason]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to delete automod rule from |
| 2 | `rule ID` | `AutomodRule` | **yes** | no | The automod rule to delete |
| 3 | `reason` | `String` | no | no | The reason for deleting the rule |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to delete automod rule from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`rule ID`** (`AutomodRule`, required): The automod rule to delete. Expects an automod rule ID. Fetched from the pointer guild's autoModerationRules manager.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`reason`** (`String`, optional): The reason for deleting the rule. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Automod functions create/edit/delete/read auto-moderation rules for a guild (requires the `AutoModeration*` intents and `ManageGuild`).

`$deleteAutomodRule` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteAutomodRule[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$deleteAutomodRule[123456789012345678;123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/native/automod/deleteAutomodRule.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        try {
            await rule.delete(reason || ctx.reason)
        } catch (error) {
            ctx.noop(error)
            return this.success(false)
        }

        return this.success(true)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$automodActionType`]($automodActionType.md)
- [`$automodAlertSystemMessageID`]($automodAlertSystemMessageID.md)
- [`$automodChannelID`]($automodChannelID.md)
- [`$automodContent`]($automodContent.md)
- [`$automodCustomMessage`]($automodCustomMessage.md)
- [`$automodDuration`]($automodDuration.md)
- [`$automodMatchedContent`]($automodMatchedContent.md)
- [`$automodMatchedKeyword`]($automodMatchedKeyword.md)

**Source:** [`src/native/automod/deleteAutomodRule.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/automod/deleteAutomodRule.ts)

# $createAutomodRule

> Creates a new automod rule for a guild, returns rule id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `automod` | v1.5.0 | required | yes | `AutomodRule` |

## Signature

```fs
$createAutomodRule[guild ID;name;trigger;event;enabled;reason]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to create automod rule on |
| 2 | `name` | `String` | **yes** | no | The name of the automod rule |
| 3 | `trigger` | `Enum` | **yes** | no | The trigger type of the automod rule |
| 4 | `event` | `Enum` | **yes** | no | The event type of the automod rule |
| 5 | `enabled` | `Boolean` | no | no | Whether the automod rule should be enabled |
| 6 | `reason` | `String` | no | no | The reason for creating the automod rule |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to create automod rule on. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`name`** (`String`, required): The name of the automod rule. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`trigger`** (`Enum`, required): The trigger type of the automod rule. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`event`** (`Enum`, required): The event type of the automod rule. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`enabled`** (`Boolean`, optional): Whether the automod rule should be enabled. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`reason`** (`String`, optional): The reason for creating the automod rule. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Automod functions create/edit/delete/read auto-moderation rules for a guild (requires the `AutoModeration*` intents and `ManageGuild`).

`$createAutomodRule` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$createAutomodRule[123456789012345678;name;value;value]
```

**Full form (all arguments)**

```fs
$createAutomodRule[123456789012345678;name;value;value;true;value]
```

## Reference implementation (source)

Taken from `src/native/automod/createAutomodRule.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const rule = await guild.autoModerationRules.create({
            name: name,
            eventType: event,
            triggerType: trigger,
            triggerMetadata: ctx.automodRule.triggerMetadata,
            actions: ctx.automodRule.actions || [],
            exemptRoles: ctx.automodRule.exemptRoles,
            exemptChannels: ctx.automodRule.exemptChannels,
            enabled: typeof(enabled) === "boolean" ? enabled : true,
            reason: reason || ctx.reason
        }).catch(ctx.noop)

        ctx.clearAutomodRuleOptions()
        
        return this.success(rule?.id)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`enabled`, `reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$automodActionType`]($automodActionType.md)
- [`$automodAlertSystemMessageID`]($automodAlertSystemMessageID.md)
- [`$automodChannelID`]($automodChannelID.md)
- [`$automodContent`]($automodContent.md)
- [`$automodCustomMessage`]($automodCustomMessage.md)
- [`$automodDuration`]($automodDuration.md)
- [`$automodMatchedContent`]($automodMatchedContent.md)
- [`$automodMatchedKeyword`]($automodMatchedKeyword.md)

**Source:** [`src/native/automod/createAutomodRule.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/automod/createAutomodRule.ts)

# $setAutomodAction

> Sets a new action for current automod rule

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `automod` | v1.5.0 | required | yes | — |

## Signature

```fs
$setAutomodAction[type;channel ID;duration;message]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `type` | `Enum` | **yes** | no | The type of the automod rule action |
| 2 | `channel ID` | `Channel` | no | no | The channel to which content will be logged |
| 3 | `duration` | `Number` | no | no | The timeout duration in seconds |
| 4 | `message` | `String` | no | no | The custom message that is shown whenever a message is blocked |

### Per-parameter notes

- **`type`** (`Enum`, required): The type of the automod rule action. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`channel ID`** (`Channel`, optional): The channel to which content will be logged. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`duration`** (`Number`, optional): The timeout duration in seconds. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`message`** (`String`, optional): The custom message that is shown whenever a message is blocked. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Automod functions create/edit/delete/read auto-moderation rules for a guild (requires the `AutoModeration*` intents and `ManageGuild`).

`$setAutomodAction` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setAutomodAction[value]
```

**Full form (all arguments)**

```fs
$setAutomodAction[value;123456789012345678;5;Hello!]
```

## Reference implementation (source)

Taken from `src/native/automod/setAutomodAction.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const action = {
            type: type,
            metadata: {
                channel: channel as GuildTextChannelResolvable | ThreadChannel,
                customMessage: message,
                durationSeconds: duration
            }
        } as AutoModerationActionOptions

        ctx.automodRule.actions ??= []
        ctx.automodRule.actions.push(action)

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`channel ID`, `duration`, `message`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/automod/setAutomodAction.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/automod/setAutomodAction.ts)

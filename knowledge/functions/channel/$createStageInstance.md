# $createStageInstance

> Creates a new stage instance, returns instance id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v2.3.0 | required | yes | `StageInstance` |

## Signature

```fs
$createStageInstance[channel ID;topic;privacy level;notify;event ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to create stage instance on |
| 2 | `topic` | `String` | **yes** | no | The topic of the stage instance |
| 3 | `privacy level` | `Enum` | no | no | The privacy level of the stage instance |
| 4 | `notify` | `Boolean` | no | no | Whether to notify @everyone that the stage instance has started |
| 5 | `event ID` | `ScheduledEvent` | no | no | The scheduled event associated with the stage instance |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to create stage instance on. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`topic`** (`String`, required): The topic of the stage instance. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`privacy level`** (`Enum`, optional): The privacy level of the stage instance. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`notify`** (`Boolean`, optional): Whether to notify @everyone that the stage instance has started. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`event ID`** (`ScheduledEvent`, optional): The scheduled event associated with the stage instance. Expects a scheduled event ID. Fetched from the pointer guild's scheduledEvents manager.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$createStageInstance` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$createStageInstance[123456789012345678;value]
```

**Full form (all arguments)**

```fs
$createStageInstance[123456789012345678;value;value;true;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/channel/createStageInstance.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const instance = await (channel as StageChannel).createStageInstance({
            topic,
            privacyLevel: level || undefined,
            guildScheduledEvent: event || undefined,
            sendStartNotification: typeof(notify) === "boolean" ? notify : undefined
        }).catch(ctx.noop)

        return this.success(instance?.id)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`privacy level`, `notify`, `event ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addChannelPerms`]($addChannelPerms.md)
- [`$addPermissionOverwrite`]($addPermissionOverwrite.md)
- [`$addPostTags`]($addPostTags.md)
- [`$addThreadMember`]($addThreadMember.md)
- [`$archiveThread`]($archiveThread.md)
- [`$channelBitrate`]($channelBitrate.md)
- [`$channelCategoryID`]($channelCategoryID.md)
- [`$channelChildrenCount`]($channelChildrenCount.md)

**Source:** [`src/native/channel/createStageInstance.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/createStageInstance.ts)

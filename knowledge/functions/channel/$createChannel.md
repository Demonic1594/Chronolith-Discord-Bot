# $createChannel

> Creates a channel in a guild, returns the channel id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v1.0.0 | required | yes | `Channel` |

## Signature

```fs
$createChannel[guild ID;name;type;topic;parent ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to create this channel on |
| 2 | `name` | `String` | **yes** | no | The name for the channel |
| 3 | `type` | `Enum` | **yes** | no | The type of the channel, some are not supported |
| 4 | `topic` | `String` | no | no | The topic for the channel |
| 5 | `parent ID` | `Channel` | no | no | The parent id for the channel |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to create this channel on. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`name`** (`String`, required): The name for the channel. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`type`** (`Enum`, required): The type of the channel, some are not supported. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`topic`** (`String`, optional): The topic for the channel. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`parent ID`** (`Channel`, optional): The parent id for the channel. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$createChannel` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$createChannel[123456789012345678;name;value]
```

**Full form (all arguments)**

```fs
$createChannel[123456789012345678;name;value;value;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/channel/createChannel.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const ch = await guild.channels
            .create({
                type: type as GuildChannelCreateOptions["type"],
                name,
                topic: topic || undefined,
                parent: parent as CategoryChannel,
                permissionOverwrites: ctx.permissionOverwrites,
                reason: ctx.reason
            })
            .catch(ctx.noop)
        return this.success(ch ? ch.id : undefined)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`topic`, `parent ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addChannelPerms`]($addChannelPerms.md)
- [`$addPermissionOverwrite`]($addPermissionOverwrite.md)
- [`$addPostTags`]($addPostTags.md)
- [`$addThreadMember`]($addThreadMember.md)
- [`$archiveThread`]($archiveThread.md)
- [`$channelBitrate`]($channelBitrate.md)
- [`$channelCategoryID`]($channelCategoryID.md)
- [`$channelChildrenCount`]($channelChildrenCount.md)

**Source:** [`src/native/channel/createChannel.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/createChannel.ts)

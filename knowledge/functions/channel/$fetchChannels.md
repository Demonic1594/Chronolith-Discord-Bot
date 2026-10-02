# $fetchChannels

> Caches all channels of a guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v2.2.0 | optional | yes | — |

> aliases: $fetchChannel

## Signature

```fs
$fetchChannels[guild ID;channel ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to cache channels of |
| 2 | `channel ID` | `Channel` | no | no | The channel to fetch |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to cache channels of. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`channel ID`** (`Channel`, optional): The channel to fetch. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$fetchChannels` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$fetchChannels[123456789012345678]
```

**Full form (all arguments)**

```fs
$fetchChannels[123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/channel/fetchChannels.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        guild ??= ctx.guild!
        if (channel) await guild?.channels.fetch(channel.id)
        else await guild?.channels.fetch()
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$fetchChannel` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`channel ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/channel/fetchChannels.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/fetchChannels.ts)

# $deleteChannelPerms

> Deletes some permission overwrites from a channel, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v1.0.3 | required | yes | `Boolean` |

## Signature

```fs
$deleteChannelPerms[channel ID;id;perms]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to clear perms from |
| 2 | `id` | `String` | **yes** | no | The role or member id to clear these perms for |
| 3 | `perms` | `String` | **yes** | yes | The perms to clear from the id |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to clear perms from. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`id`** (`String`, required): The role or member id to clear these perms for. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`perms`** (`String` , rest, required): The perms to clear from the id. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$deleteChannelPerms` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `perms` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$deleteChannelPerms[123456789012345678;123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/native/channel/deleteChannelPerms.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const channel = ch as GuildChannel

        const obj: Partial<Record<PermissionsString, null>> = {}

        perms.forEach((x) => (obj[x as PermissionsString] = null))

        return this.success(!!(await channel.permissionOverwrites.create(id, obj, { reason: ctx.reason })))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addChannelPerms`]($addChannelPerms.md)
- [`$addPermissionOverwrite`]($addPermissionOverwrite.md)
- [`$addPostTags`]($addPostTags.md)
- [`$addThreadMember`]($addThreadMember.md)
- [`$archiveThread`]($archiveThread.md)
- [`$channelBitrate`]($channelBitrate.md)
- [`$channelCategoryID`]($channelCategoryID.md)
- [`$channelChildrenCount`]($channelChildrenCount.md)

**Source:** [`src/native/channel/deleteChannelPerms.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/deleteChannelPerms.ts)

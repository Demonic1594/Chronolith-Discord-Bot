# $channelPermissionsFor

> Returns permissions for a role or member in a channel

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v1.4.0 | required | yes | `PermissionFlagsBits[]` |

> aliases: $channelPermsFor, $memberChannelPerms, $roleChannelPerms

## Signature

```fs
$channelPermissionsFor[channel ID;id;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to get perms from |
| 2 | `id` | `String` | **yes** | no | The role or user to get perms for |
| 3 | `separator` | `String` | no | no | The separator to use for every perm |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to get perms from. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`id`** (`String`, required): The role or user to get perms for. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`separator`** (`String`, optional): The separator to use for every perm. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$channelPermissionsFor` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$channelPermissionsFor[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$channelPermissionsFor[123456789012345678;123456789012345678;,]
```

## Reference implementation (source)

Taken from `src/native/channel/channelPermissionsFor.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success((channel as GuildTextBasedChannel).permissionsFor(id)?.toArray().join(sep ?? ", "))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$channelPermsFor`, `$memberChannelPerms`, `$roleChannelPerms` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/channel/channelPermissionsFor.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/channelPermissionsFor.ts)

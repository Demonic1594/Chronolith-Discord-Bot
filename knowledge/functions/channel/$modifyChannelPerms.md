# $modifyChannelPerms

> Modifies given channel perms for a role or user

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v1.4.0 | required | yes | `Boolean` |

> aliases: $editChannelPerms

## Signature

```fs
$modifyChannelPerms[channel ID;roleOrUser;perms]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to modify perms for |
| 2 | `roleOrUser` | `RoleOrUser` | **yes** | no | The role or user to modify perms for |
| 3 | `perms` | `OverwritePermission` | **yes** | yes | The permissions to allow, nullify or disallow, (+,/,-)Perm |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to modify perms for. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`roleOrUser`** (`RoleOrUser`, required): The role or user to modify perms for. Expects a role or user ID. Tried as a role in the pointer guild first, then as a user fetch.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`perms`** (`OverwritePermission` , rest, required): The permissions to allow, nullify or disallow, (+,/,-)Perm. Expects an overwrite permission. A permission name PRECEDED by a symbol: `+Perm` (allow), `-Perm` (deny), `/Perm` (inherit/null).

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$modifyChannelPerms` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `perms` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$modifyChannelPerms[123456789012345678;value;+ManageMessages]
```

## Reference implementation (source)

Taken from `src/native/channel/modifyChannelPerms.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const ch = channel as GuildChannel
        const mapped = overwritePermissionsArrayToObject(raw)

        if (ch.permissionOverwrites.cache.has(roleOrUser.id)) {
            return this.success(
                !!(await ch.permissionOverwrites.edit(roleOrUser, mapped, { reason: ctx.reason }).catch(ctx.noop))
            )
        } else {
            return this.success(
                !!(await ch.permissionOverwrites.create(roleOrUser, mapped, { reason: ctx.reason }).catch(ctx.noop))
            )
        }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$editChannelPerms` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
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

**Source:** [`src/native/channel/modifyChannelPerms.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/modifyChannelPerms.ts)

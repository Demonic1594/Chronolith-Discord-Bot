# $addPermissionOverwrite

> Adds a new permission overwrite to the channel

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v2.7.0 | required | yes | — |

## Signature

```fs
$addPermissionOverwrite[roleOrUser;perms]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `roleOrUser` | `RoleOrUser` | **yes** | no | The role or member to set perms for |
| 2 | `perms` | `OverwritePermission` | **yes** | yes | The permissions to allow or disallow, (+,-)Perm |

### Per-parameter notes

- **`roleOrUser`** (`RoleOrUser`, required): The role or member to set perms for. Expects a role or user ID. Tried as a role in the pointer guild first, then as a user fetch.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`perms`** (`OverwritePermission` , rest, required): The permissions to allow or disallow, (+,-)Perm. Expects an overwrite permission. A permission name PRECEDED by a symbol: `+Perm` (allow), `-Perm` (deny), `/Perm` (inherit/null).

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$addPermissionOverwrite` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `perms` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$addPermissionOverwrite[value;+ManageMessages]
```

## Reference implementation (source)

Taken from `src/native/channel/addPermissionOverwrite.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const obj = overwritePermissionsToOverwriteData(roleOrUser.id, raw)
        ctx.permissionOverwrites ??= []
        ctx.permissionOverwrites.push(obj)
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addChannelPerms`]($addChannelPerms.md)
- [`$addPostTags`]($addPostTags.md)
- [`$addThreadMember`]($addThreadMember.md)
- [`$archiveThread`]($archiveThread.md)
- [`$channelBitrate`]($channelBitrate.md)
- [`$channelCategoryID`]($channelCategoryID.md)
- [`$channelChildrenCount`]($channelChildrenCount.md)
- [`$channelChildrenIDs`]($channelChildrenIDs.md)

## Community guides covering this function

- [$addPermissionOverwrite guide](../../guides/guide-295.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-295)

**Source:** [`src/native/channel/addPermissionOverwrite.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/addPermissionOverwrite.ts)

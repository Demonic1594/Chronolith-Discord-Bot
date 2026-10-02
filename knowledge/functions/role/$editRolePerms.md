# $editRolePerms

> Edits a role's permissions, returns boolean

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `role` | v1.0.7 | required | yes | `Boolean` |

> aliases: $modifyRolePerms

## Signature

```fs
$editRolePerms[guild ID;role ID;perms]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to pull the role from |
| 2 | `role ID` | `Role` | **yes** | no | The role to edit perms for |
| 3 | `perms` | `Permission` | no | yes | The new perms for the role, omit to clear perms |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to pull the role from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`role ID`** (`Role`, required): The role to edit perms for. Expects a role ID. Looked up in the guild resolved by the `pointer` argument or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`perms`** (`Permission` , rest, optional): The new perms for the role, omit to clear perms. Expects a permission name. A `PermissionFlagsBits` key like `ManageMessages`, `BanMembers` (camelCase, no spaces).

## How it works

Role functions read and mutate guild roles — creation, edits, position, permissions, member assignment.

`$editRolePerms` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `perms` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$editRolePerms[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$editRolePerms[123456789012345678;123456789012345678;ManageMessages]
```

## Reference implementation (source)

Taken from `src/native/role/editRolePerms.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(!!(await role.setPermissions(perms, ctx.reason).catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$modifyRolePerms` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addRole`]($addRole.md)
- [`$cloneRole`]($cloneRole.md)
- [`$deleteRoles`]($deleteRoles.md)
- [`$editRole`]($editRole.md)
- [`$editRoleColors`]($editRoleColors.md)
- [`$editRoleIcon`]($editRoleIcon.md)
- [`$editRoleName`]($editRoleName.md)
- [`$editRolePosition`]($editRolePosition.md)

**Source:** [`src/native/role/editRolePerms.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/role/editRolePerms.ts)

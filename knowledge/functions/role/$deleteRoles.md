# $deleteRoles

> Deletes given roles, returns the count of roles deleted

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `role` | v1.0.0 | required | yes | `Number` |

## Signature

```fs
$deleteRoles[guild ID;roles]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to delete roles from |
| 2 | `roles` | `Role` | **yes** | yes | The roles to delete |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to delete roles from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`roles`** (`Role` , rest, required): The roles to delete. Expects a role ID. Looked up in the guild resolved by the `pointer` argument or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Role functions read and mutate guild roles — creation, edits, position, permissions, member assignment.

`$deleteRoles` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `roles` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$deleteRoles[123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/role/deleteRoles.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        let count = 0
        for (let i = 0, len = roles.length; i < len; i++) {
            const role = roles[i]
            const success = await role.delete(ctx.reason).catch(ctx.noop)
            if (success) count++
        }

        return this.success(count)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addRole`]($addRole.md)
- [`$cloneRole`]($cloneRole.md)
- [`$editRole`]($editRole.md)
- [`$editRoleColors`]($editRoleColors.md)
- [`$editRoleIcon`]($editRoleIcon.md)
- [`$editRoleName`]($editRoleName.md)
- [`$editRolePerms`]($editRolePerms.md)
- [`$editRolePosition`]($editRolePosition.md)

**Source:** [`src/native/role/deleteRoles.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/role/deleteRoles.ts)

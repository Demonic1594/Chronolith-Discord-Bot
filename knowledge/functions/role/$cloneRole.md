# $cloneRole

> Clones an existing role of a guild, returns role id if success

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `role` | v2.4.0 | required | yes | `Role` |

## Signature

```fs
$cloneRole[guild ID;role ID;name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to fetch role from |
| 2 | `role ID` | `Role` | **yes** | no | The role to clone |
| 3 | `name` | `String` | no | no | The role name for the cloned role |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to fetch role from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`role ID`** (`Role`, required): The role to clone. Expects a role ID. Looked up in the guild resolved by the `pointer` argument or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`name`** (`String`, optional): The role name for the cloned role. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Role functions read and mutate guild roles — creation, edits, position, permissions, member assignment.

`$cloneRole` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$cloneRole[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$cloneRole[123456789012345678;123456789012345678;name]
```

## Reference implementation (source)

Taken from `src/native/role/cloneRole.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const created = await guild.roles
            .create({
                name: name || role.name,
                colors: role.colors as RoleColorsResolvable,
                icon: role.icon,
                hoist: role.hoist,
                mentionable: role.mentionable,
                permissions: role.permissions,
                unicodeEmoji: role.unicodeEmoji,
                reason: ctx.reason
            })
            .catch(ctx.noop)
        return this.success(created ? created.id : undefined)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`name`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addRole`]($addRole.md)
- [`$deleteRoles`]($deleteRoles.md)
- [`$editRole`]($editRole.md)
- [`$editRoleColors`]($editRoleColors.md)
- [`$editRoleIcon`]($editRoleIcon.md)
- [`$editRoleName`]($editRoleName.md)
- [`$editRolePerms`]($editRolePerms.md)
- [`$editRolePosition`]($editRolePosition.md)

**Source:** [`src/native/role/cloneRole.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/role/cloneRole.ts)

# $editRole

> Edits a role on a guild, returns boolean

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `role` | v1.0.7 | required | yes | `Boolean` |

## Signature

```fs
$editRole[guild ID;role ID;name;color;icon;hoisted;mentionable;perms]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to pull the role from |
| 2 | `role ID` | `Role` | **yes** | no | The role to edit data |
| 3 | `name` | `String` | no | no | The new role name, leave empty to not modify |
| 4 | `color` | `Color` | no | no | The new role color, leave empty to not modify |
| 5 | `icon` | `String` | no | no | The new role icon, leave empty to not modify |
| 6 | `hoisted` | `Boolean` | no | no | Whether the role is hoisted, leave empty to not modify |
| 7 | `mentionable` | `Boolean` | no | no | Whether the role can be mentioned, leave empty to not modify |
| 8 | `perms` | `Permission` | no | yes | The new perms for the role |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to pull the role from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`role ID`** (`Role`, required): The role to edit data. Expects a role ID. Looked up in the guild resolved by the `pointer` argument or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`name`** (`String`, optional): The new role name, leave empty to not modify. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`color`** (`Color`, optional): The new role color, leave empty to not modify. Expects a color. Accepts hex (`#5865F2` or `5865F2`), integer (`4455093`), and known color names via `resolveColor`.
- **`icon`** (`String`, optional): The new role icon, leave empty to not modify. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`hoisted`** (`Boolean`, optional): Whether the role is hoisted, leave empty to not modify. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`mentionable`** (`Boolean`, optional): Whether the role can be mentioned, leave empty to not modify. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`perms`** (`Permission` , rest, optional): The new perms for the role. Expects a permission name. A `PermissionFlagsBits` key like `ManageMessages`, `BanMembers` (camelCase, no spaces).

## How it works

Role functions read and mutate guild roles — creation, edits, position, permissions, member assignment.

`$editRole` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `perms` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$editRole[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$editRole[123456789012345678;123456789012345678;name;#5865F2;value;true;true;ManageMessages]
```

## Reference implementation (source)

Taken from `src/native/role/editRole.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const edit = await role.edit({
            colors: !color ? undefined : { primaryColor: color },
            mentionable: typeof(mentionable) === "boolean" ? mentionable : undefined,
            hoist: typeof(hoist) === "boolean" ? hoist : undefined,
            name: name || undefined,
            icon: icon || undefined,
            permissions: perms?.length ? perms : undefined,
            reason: ctx.reason
        }).catch(ctx.noop)

        return this.success(!!edit)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`name`, `color`, `icon`, `hoisted`, `mentionable`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addRole`]($addRole.md)
- [`$cloneRole`]($cloneRole.md)
- [`$deleteRoles`]($deleteRoles.md)
- [`$editRoleColors`]($editRoleColors.md)
- [`$editRoleIcon`]($editRoleIcon.md)
- [`$editRoleName`]($editRoleName.md)
- [`$editRolePerms`]($editRolePerms.md)
- [`$editRolePosition`]($editRolePosition.md)

**Source:** [`src/native/role/editRole.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/role/editRole.ts)

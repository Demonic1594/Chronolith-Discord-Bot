# $addRole

> Adds a role to a guild, returns role id if success

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `role` | v1.0.0 | required | yes | `Role` |

## Signature

```fs
$addRole[guild ID;name;color;icon;hoisted;mentionable;position;perms]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to add the role to |
| 2 | `name` | `String` | **yes** | no | The role name |
| 3 | `color` | `Color` | no | no | The role color |
| 4 | `icon` | `String` | no | no | The role icon |
| 5 | `hoisted` | `Boolean` | no | no | Whether the role is hoisted |
| 6 | `mentionable` | `Boolean` | no | no | Whether the role is mentionable |
| 7 | `position` | `Number` | no | no | The position for this role |
| 8 | `perms` | `String` | no | yes | The role perms |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to add the role to. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`name`** (`String`, required): The role name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`color`** (`Color`, optional): The role color. Expects a color. Accepts hex (`#5865F2` or `5865F2`), integer (`4455093`), and known color names via `resolveColor`.
- **`icon`** (`String`, optional): The role icon. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`hoisted`** (`Boolean`, optional): Whether the role is hoisted. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`mentionable`** (`Boolean`, optional): Whether the role is mentionable. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`position`** (`Number`, optional): The position for this role. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`perms`** (`String` , rest, optional): The role perms. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Role functions read and mutate guild roles — creation, edits, position, permissions, member assignment.

`$addRole` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `perms` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$addRole[123456789012345678;name]
```

**Full form (all arguments)**

```fs
$addRole[123456789012345678;name;#5865F2;value;true;true;5;value]
```

## Reference implementation (source)

Taken from `src/native/role/addRole.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const created = await guild.roles
            .create({
                colors: !color ? undefined : { primaryColor: color },
                icon: icon || undefined,
                hoist: hoist || false,
                mentionable: mentionable || false,
                name,
                permissions: (perms as PermissionsString[]) || [],
                position: pos || undefined,
                reason: ctx.reason
            })
            .catch(ctx.noop)
        return this.success(created ? created.id : undefined)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`color`, `icon`, `hoisted`, `mentionable`, `position`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$cloneRole`]($cloneRole.md)
- [`$deleteRoles`]($deleteRoles.md)
- [`$editRole`]($editRole.md)
- [`$editRoleColors`]($editRoleColors.md)
- [`$editRoleIcon`]($editRoleIcon.md)
- [`$editRoleName`]($editRoleName.md)
- [`$editRolePerms`]($editRolePerms.md)
- [`$editRolePosition`]($editRolePosition.md)

**Source:** [`src/native/role/addRole.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/role/addRole.ts)

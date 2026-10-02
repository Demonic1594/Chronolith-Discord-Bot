# $editRoleColors

> Edits a role's colors, returns boolean

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `role` | v2.5.0 | required | yes | `Boolean` |

> aliases: $editRoleColor

## Signature

```fs
$editRoleColors[guild ID;role ID;primary;secondary;tertiary]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to pull the role from |
| 2 | `role ID` | `Role` | **yes** | no | The role to edit colors for |
| 3 | `primary` | `Color` | **yes** | no | The new primary color |
| 4 | `secondary` | `Color` | no | no | The new secondary color |
| 5 | `tertiary` | `Color` | no | no | The new tertiary color |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to pull the role from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`role ID`** (`Role`, required): The role to edit colors for. Expects a role ID. Looked up in the guild resolved by the `pointer` argument or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`primary`** (`Color`, required): The new primary color. Expects a color. Accepts hex (`#5865F2` or `5865F2`), integer (`4455093`), and known color names via `resolveColor`.
- **`secondary`** (`Color`, optional): The new secondary color. Expects a color. Accepts hex (`#5865F2` or `5865F2`), integer (`4455093`), and known color names via `resolveColor`.
- **`tertiary`** (`Color`, optional): The new tertiary color. Expects a color. Accepts hex (`#5865F2` or `5865F2`), integer (`4455093`), and known color names via `resolveColor`.

## How it works

Role functions read and mutate guild roles — creation, edits, position, permissions, member assignment.

`$editRoleColors` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$editRoleColors[123456789012345678;123456789012345678;#5865F2]
```

**Full form (all arguments)**

```fs
$editRoleColors[123456789012345678;123456789012345678;#5865F2;#5865F2;#5865F2]
```

## Reference implementation (source)

Taken from `src/native/role/editRoleColors.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(!!(await role.setColors({
            primaryColor: primary,
            secondaryColor: secondary || undefined,
            tertiaryColor: tertiary || undefined
        }, ctx.reason).catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$editRoleColor` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`secondary`, `tertiary`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addRole`]($addRole.md)
- [`$cloneRole`]($cloneRole.md)
- [`$deleteRoles`]($deleteRoles.md)
- [`$editRole`]($editRole.md)
- [`$editRoleIcon`]($editRoleIcon.md)
- [`$editRoleName`]($editRoleName.md)
- [`$editRolePerms`]($editRolePerms.md)
- [`$editRolePosition`]($editRolePosition.md)

**Source:** [`src/native/role/editRoleColors.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/role/editRoleColors.ts)

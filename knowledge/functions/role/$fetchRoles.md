# $fetchRoles

> Caches all roles of a guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `role` | v2.2.0 | optional | yes | — |

> aliases: $fetchRole

## Signature

```fs
$fetchRoles[guild ID;role ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to cache roles of |
| 2 | `role ID` | `Role` | no | no | The role to fetch |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to cache roles of. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`role ID`** (`Role`, optional): The role to fetch. Expects a role ID. Looked up in the guild resolved by the `pointer` argument or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Role functions read and mutate guild roles — creation, edits, position, permissions, member assignment.

`$fetchRoles` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$fetchRoles[123456789012345678]
```

**Full form (all arguments)**

```fs
$fetchRoles[123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/role/fetchRoles.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        guild ??= ctx.guild!
        if (role) await guild?.roles.fetch(role.id)
        else await guild?.roles.fetch()
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$fetchRole` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`role ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addRole`]($addRole.md)
- [`$cloneRole`]($cloneRole.md)
- [`$deleteRoles`]($deleteRoles.md)
- [`$editRole`]($editRole.md)
- [`$editRoleColors`]($editRoleColors.md)
- [`$editRoleIcon`]($editRoleIcon.md)
- [`$editRoleName`]($editRoleName.md)
- [`$editRolePerms`]($editRolePerms.md)

**Source:** [`src/native/role/fetchRoles.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/role/fetchRoles.ts)

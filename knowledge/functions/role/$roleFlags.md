# $roleFlags

> Returns the role flags

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `role` | v1.3.0 | optional | yes | `RoleFlags[]` |

## Signature

```fs
$roleFlags[guild ID;role ID;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to pull the role from |
| 2 | `role ID` | `Role` | **yes** | no | The role to return its flags |
| 3 | `separator` | `String` | no | no | The separator to use for every flag |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to pull the role from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`role ID`** (`Role`, required): The role to return its flags. Expects a role ID. Looked up in the guild resolved by the `pointer` argument or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`separator`** (`String`, optional): The separator to use for every flag. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Role functions read and mutate guild roles — creation, edits, position, permissions, member assignment.

`$roleFlags` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$roleFlags[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$roleFlags[123456789012345678;123456789012345678;,]
```

## Reference implementation (source)

Taken from `src/native/role/roleFlags.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success((role ?? ctx.role)?.flags.toArray().join(sep || ", "))
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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
- [`$editRolePerms`]($editRolePerms.md)

**Source:** [`src/native/role/roleFlags.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/role/roleFlags.ts)

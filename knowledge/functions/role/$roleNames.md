# $roleNames

> Returns the role names of a guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `role` | v1.0.0 | optional | yes | `String[]` |

## Signature

```fs
$roleNames[guild ID;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to return the roles of |
| 2 | `separator` | `String` | **yes** | no | The separator to use for each role |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to return the roles of. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`separator`** (`String`, required): The separator to use for each role. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Role functions read and mutate guild roles — creation, edits, position, permissions, member assignment.

`$roleNames` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$roleNames[123456789012345678;,]
```

## Reference implementation (source)

Taken from `src/native/role/roleNames.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            (guild ?? ctx.guild)?.roles.cache
                .filter((x) => x.guild.id !== x.id)
                .map((x) => x.name)
                .join(sep || ", ")
        )
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addRole`]($addRole.md)
- [`$cloneRole`]($cloneRole.md)
- [`$deleteRoles`]($deleteRoles.md)
- [`$editRole`]($editRole.md)
- [`$editRoleColors`]($editRoleColors.md)
- [`$editRoleIcon`]($editRoleIcon.md)
- [`$editRoleName`]($editRoleName.md)
- [`$editRolePerms`]($editRolePerms.md)

**Source:** [`src/native/role/roleNames.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/role/roleNames.ts)

# $deleteRoleVar

> Deletes a value from a role variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `role` | v2.0.0 | required | yes | — |

## Signature

```fs
$deleteRoleVar[name;role ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable |
| 2 | `role ID` | `Role` | **yes** | no | The ID of the role |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`role ID`** (`Role`, required): The ID of the role. Expects a role ID. Looked up in the guild resolved by the `pointer` argument or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Role functions read and mutate guild roles — creation, edits, position, permissions, member assignment.

`$deleteRoleVar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteRoleVar[name;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/role/deleteRoleVar.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        await DataBase.delete({ name, id: role?.id, type: "role", guildId: role.guild.id })
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$getRoleVar`]($getRoleVar.md)
- [`$setRoleVar`]($setRoleVar.md)

**Source:** [`src/functions/role/deleteRoleVar.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/role/deleteRoleVar.ts)

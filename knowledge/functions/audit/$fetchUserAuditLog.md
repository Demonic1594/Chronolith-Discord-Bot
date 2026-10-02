# $fetchUserAuditLog

> Fetches an audit log from a user using the type of it

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `audit` | v1.4.0 | required | yes | `Unknown` |

## Signature

```fs
$fetchUserAuditLog[guild ID;user;type;property;index;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to get audit log from |
| 2 | `user` | `User` | no | no | The user to filter by |
| 3 | `type` | `Enum` | **yes** | no | The event type of the log |
| 4 | `property` | `Enum` | **yes** | no | The property to pull from the audit log |
| 5 | `index` | `Number` | no | no | The index of the entry to use |
| 6 | `separator` | `String` | no | no | The separator to use in case of array output |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to get audit log from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`user`** (`User`, optional): The user to filter by. Expects a user ID. Must be a 16-23 digit snowflake; fetched via `client.users.fetch`.
- **`type`** (`Enum`, required): The event type of the log. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`property`** (`Enum`, required): The property to pull from the audit log. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`index`** (`Number`, optional): The index of the entry to use. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`separator`** (`String`, optional): The separator to use in case of array output. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Audit-log functions read Discord guild audit log entries (requires the `GuildModeration` intent and usually `ViewAuditLog` permission).

`$fetchUserAuditLog` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$fetchUserAuditLog[123456789012345678;123456789012345678;value]
```

**Full form (all arguments)**

```fs
$fetchUserAuditLog[123456789012345678;123456789012345678;value;value;5;,]
```

## Reference implementation (source)

Taken from `src/native/audit/fetchUserAuditLog.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const logs = await g.fetchAuditLogs({
            type,
            user: user ?? undefined
        }).catch(ctx.noop)
        return this.success(logs ? AuditProperties[prop](logs.entries.at(index ?? 0), sep) : null)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`user`, `index`, `separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$fetchAuditLog`]($fetchAuditLog.md)
- [`$fetchAuditLogCount`]($fetchAuditLogCount.md)
- [`$setAuditLogReason`]($setAuditLogReason.md)

**Source:** [`src/native/audit/fetchUserAuditLog.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/audit/fetchUserAuditLog.ts)

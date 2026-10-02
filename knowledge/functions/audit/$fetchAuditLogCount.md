# $fetchAuditLogCount

> Fetches audit log count using the type of it

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `audit` | v1.4.0 | required | yes | `Number` |

## Signature

```fs
$fetchAuditLogCount[guild ID;type;user]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to get audit log from |
| 2 | `type` | `Enum` | **yes** | no | The event type of the log |
| 3 | `user` | `User` | no | no | The user to filter by |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to get audit log from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`type`** (`Enum`, required): The event type of the log. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`user`** (`User`, optional): The user to filter by. Expects a user ID. Must be a 16-23 digit snowflake; fetched via `client.users.fetch`.

## How it works

Audit-log functions read Discord guild audit log entries (requires the `GuildModeration` intent and usually `ViewAuditLog` permission).

`$fetchAuditLogCount` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$fetchAuditLogCount[123456789012345678;value]
```

**Full form (all arguments)**

```fs
$fetchAuditLogCount[123456789012345678;value;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/audit/fetchAuditLogCount.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const logs = await g.fetchAuditLogs({
            type,
            user: user ?? undefined
        }).catch(ctx.noop)
        return this.success(logs ? logs.entries.size : null)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`user`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$fetchAuditLog`]($fetchAuditLog.md)
- [`$fetchUserAuditLog`]($fetchUserAuditLog.md)
- [`$setAuditLogReason`]($setAuditLogReason.md)

**Source:** [`src/native/audit/fetchAuditLogCount.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/audit/fetchAuditLogCount.ts)

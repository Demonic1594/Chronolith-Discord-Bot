# $pruneMembers

> Prunes inactive members from the guild, returns number of kicked members

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `member` | v1.5.0 | required | yes | `Number` |

> aliases: $prune, $membersPrune

## Signature

```fs
$pruneMembers[guild ID;days;dry;reason;roles]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to prune members from |
| 2 | `days` | `Number` | no | no | The days of inactivity required to kick |
| 3 | `dry` | `Boolean` | no | no | Whether to perform a dry prune |
| 4 | `reason` | `String` | no | no | The reason for pruning members |
| 5 | `roles` | `Role` | no | yes | The roles to include when pruning |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to prune members from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`days`** (`Number`, optional): The days of inactivity required to kick. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`dry`** (`Boolean`, optional): Whether to perform a dry prune. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`reason`** (`String`, optional): The reason for pruning members. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`roles`** (`Role` , rest, optional): The roles to include when pruning. Expects a role ID. Looked up in the guild resolved by the `pointer` argument or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Member functions operate on guild members — roles, timeouts, moderation actions, voice state, properties.

`$pruneMembers` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `roles` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$pruneMembers[123456789012345678]
```

**Full form (all arguments)**

```fs
$pruneMembers[123456789012345678;5;true;value;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/member/pruneMembers.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            (await guild.members
                .prune({
                    count: true,
                    days: days || 7,
                    dry: dry || false,
                    roles: roles,
                    reason: reason || ctx.reason,
                }).catch(ctx.noop))
        )
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$prune`, `$membersPrune` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`days`, `dry`, `reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
6. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
7. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$ban`]($ban.md)
- [`$fetchMembers`]($fetchMembers.md)
- [`$hasAnyPerms`]($hasAnyPerms.md)
- [`$hasAnyRole`]($hasAnyRole.md)
- [`$hasPerms`]($hasPerms.md)
- [`$hasRoles`]($hasRoles.md)
- [`$isBannable`]($isBannable.md)
- [`$isBanned`]($isBanned.md)

**Source:** [`src/native/member/pruneMembers.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/member/pruneMembers.ts)

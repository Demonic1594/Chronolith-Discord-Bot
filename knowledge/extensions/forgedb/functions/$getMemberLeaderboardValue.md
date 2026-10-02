# $getMemberLeaderboardValue

> Retrieves the position of a member in the leaderboard of a variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `member` | v2.0.0 | required | yes | `Number` |

> aliases: $getMemberLeaderboardPosition

## Signature

```fs
$getMemberLeaderboardValue[name;sort type;member ID;guild ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable to query |
| 2 | `sort type` | `Enum` | no | no | The sort order for the leaderboard, either ascending (asc) or descending (desc) |
| 3 | `member ID` | `String` | no | no | The member ID for which to retrieve the position |
| 4 | `guild ID` | `Guild` | no | no | The guild ID to which the member belongs |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable to query. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`sort type`** (`Enum`, optional): The sort order for the leaderboard, either ascending (asc) or descending (desc). Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`member ID`** (`String`, optional): The member ID for which to retrieve the position. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`guild ID`** (`Guild`, optional): The guild ID to which the member belongs. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.

## How it works

Member functions operate on guild members — roles, timeouts, moderation actions, voice state, properties.

`$getMemberLeaderboardValue` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getMemberLeaderboardValue[name]
```

**Full form (all arguments)**

```fs
$getMemberLeaderboardValue[name;value;123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/member/getMemberLeaderboardValue.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        const data = await DataBase.find({ name, type: "member", guildId: guild?.id ?? ctx.guild!.id })
        const index = data.sort((x, y) => (sortType === SortType.asc ? Number(x.value) - Number(y.value) : Number(y.value) - Number(x.value))).findIndex((s) => s.id === (member ?? ctx.member?.id))
        return this.success(index + 1)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$getMemberLeaderboardPosition` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`sort type`, `member ID`, `guild ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteMemberVar`]($deleteMemberVar.md)
- [`$getMemberLeaderboardID`]($getMemberLeaderboardID.md)
- [`$getMemberLeaderboardLength`]($getMemberLeaderboardLength.md)
- [`$getMemberVar`]($getMemberVar.md)
- [`$memberLeaderboard`]($memberLeaderboard.md)
- [`$setMemberVar`]($setMemberVar.md)

**Source:** [`src/functions/member/getMemberLeaderboardValue.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/member/getMemberLeaderboardValue.ts)

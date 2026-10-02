# $getMemberLeaderboardID

> Returns the member in the leaderboard of a specified position

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `member` | v2.1.0 | required | yes | `Member` |

## Signature

```fs
$getMemberLeaderboardID[name;sort type;position;guild ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable |
| 2 | `sort type` | `Enum` | no | no | The sort order for the leaderboard, either ascending (asc) or descending (desc) |
| 3 | `position` | `Number` | **yes** | no | The position of the member to find |
| 4 | `guild ID` | `Guild` | no | no | The guild ID to which the member belongs |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`sort type`** (`Enum`, optional): The sort order for the leaderboard, either ascending (asc) or descending (desc). Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`position`** (`Number`, required): The position of the member to find. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`guild ID`** (`Guild`, optional): The guild ID to which the member belongs. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.

## How it works

Member functions operate on guild members — roles, timeouts, moderation actions, voice state, properties.

`$getMemberLeaderboardID` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getMemberLeaderboardID[name;value]
```

**Full form (all arguments)**

```fs
$getMemberLeaderboardID[name;value;5;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/member/getMemberLeaderboardID.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        const data = await DataBase.find({ name, type: "member", guildId: guild?.id ?? ctx.guild!.id })
        const member = data.sort((x, y) => (sortType === SortType.asc ? Number(x.value) - Number(y.value) : Number(y.value) - Number(x.value)))[pos - 1]
        return this.success(member?.id)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`sort type`, `guild ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteMemberVar`]($deleteMemberVar.md)
- [`$getMemberLeaderboardLength`]($getMemberLeaderboardLength.md)
- [`$getMemberLeaderboardValue`]($getMemberLeaderboardValue.md)
- [`$getMemberVar`]($getMemberVar.md)
- [`$memberLeaderboard`]($memberLeaderboard.md)
- [`$setMemberVar`]($setMemberVar.md)

**Source:** [`src/functions/member/getMemberLeaderboardID.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/member/getMemberLeaderboardID.ts)

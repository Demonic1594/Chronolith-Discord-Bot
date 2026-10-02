# $getUserLeaderboardValue

> Returns the position of a user in the leaderboard of a specified variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `user` | v2.0.0 | required | yes | `Number` |

> aliases: $getUserLeaderboardPosition

## Signature

```fs
$getUserLeaderboardValue[name;sort type;user ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable |
| 2 | `sort type` | `Enum` | no | no | The sort order for the leaderboard, either ascending (asc) or descending (desc) |
| 3 | `user ID` | `String` | no | no | The user ID of the value |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`sort type`** (`Enum`, optional): The sort order for the leaderboard, either ascending (asc) or descending (desc). Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`user ID`** (`String`, optional): The user ID of the value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$getUserLeaderboardValue` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getUserLeaderboardValue[name]
```

**Full form (all arguments)**

```fs
$getUserLeaderboardValue[name;value;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/user/getUserLeaderboardValue.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        const data = await DataBase.find({ name, type: "user" })
        const index = data.sort((x, y) => (sortType === SortType.asc ? Number(x.value) - Number(y.value) : Number(y.value) - Number(x.value))).findIndex((s) => s.id === (user ?? ctx.user?.id))
        return this.success(index + 1)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$getUserLeaderboardPosition` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`sort type`, `user ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteUserVar`]($deleteUserVar.md)
- [`$getUserLeaderboardID`]($getUserLeaderboardID.md)
- [`$getUserLeaderboardLength`]($getUserLeaderboardLength.md)
- [`$getUserVar`]($getUserVar.md)
- [`$setUserVar`]($setUserVar.md)
- [`$userLeaderboard`]($userLeaderboard.md)

**Source:** [`src/functions/user/getUserLeaderboardValue.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/user/getUserLeaderboardValue.ts)

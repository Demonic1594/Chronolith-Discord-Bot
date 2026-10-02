# $getGuildLeaderboardID

> Returns the guild in the leaderboard of a specified position

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `guild` | v2.1.0 | required | yes | `Guild` |

> aliases: $getServerLeaderboardID

## Signature

```fs
$getGuildLeaderboardID[name;sort type;position]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable |
| 2 | `sort type` | `Enum` | no | no | The sort order for the leaderboard, either ascending (asc) or descending (desc) |
| 3 | `position` | `Number` | **yes** | no | The position of the guild to find |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`sort type`** (`Enum`, optional): The sort order for the leaderboard, either ascending (asc) or descending (desc). Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`position`** (`Number`, required): The position of the guild to find. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$getGuildLeaderboardID` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getGuildLeaderboardID[name;value]
```

**Full form (all arguments)**

```fs
$getGuildLeaderboardID[name;value;5]
```

## Reference implementation (source)

Taken from `src/functions/guild/getGuildLeaderboardID.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        const data = await DataBase.find({ name, type: "guild" })
        const guild = data.sort((x, y) => (sortType === SortType.asc ? Number(x.value) - Number(y.value) : Number(y.value) - Number(x.value)))[pos - 1]
        return this.success(guild?.id)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$getServerLeaderboardID` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`sort type`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteGuildVar`]($deleteGuildVar.md)
- [`$getGuildLeaderboardLength`]($getGuildLeaderboardLength.md)
- [`$getGuildLeaderboardValue`]($getGuildLeaderboardValue.md)
- [`$getGuildVar`]($getGuildVar.md)
- [`$guildLeaderboard`]($guildLeaderboard.md)
- [`$setGuildVar`]($setGuildVar.md)

**Source:** [`src/functions/guild/getGuildLeaderboardID.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/guild/getGuildLeaderboardID.ts)

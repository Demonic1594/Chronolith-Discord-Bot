# $getChannelLeaderboardValue

> Fetches the position of a channel in the leaderboard of a variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `channel` | v2.0.0 | required | yes | `Number` |

> aliases: $getChannelLeaderboardPosition

## Signature

```fs
$getChannelLeaderboardValue[name;sort type;channel ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable to query |
| 2 | `sort type` | `Enum` | no | no | The sort order for the leaderboard, either ascending (asc) or descending (desc) |
| 3 | `channel ID` | `Channel` | no | no | The channel ID of the value |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable to query. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`sort type`** (`Enum`, optional): The sort order for the leaderboard, either ascending (asc) or descending (desc). Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`channel ID`** (`Channel`, optional): The channel ID of the value. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$getChannelLeaderboardValue` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getChannelLeaderboardValue[name]
```

**Full form (all arguments)**

```fs
$getChannelLeaderboardValue[name;value;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/channel/getChannelLeaderboardValue.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        const data = await DataBase.find({ name, type: "channel", guildId: (channel as BaseGuildTextChannel)?.guild.id ?? ctx.guild?.id })
        const index = data.sort((x, y) => (sortType === SortType.asc ? Number(x.value) - Number(y.value) : Number(y.value) - Number(x.value))).findIndex((s) => s.id === (channel ?? ctx.channel?.id))
        return this.success(index + 1)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$getChannelLeaderboardPosition` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`sort type`, `channel ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$channelLeaderboard`]($channelLeaderboard.md)
- [`$deleteChannelVar`]($deleteChannelVar.md)
- [`$getChannelLeaderboardID`]($getChannelLeaderboardID.md)
- [`$getChannelLeaderboardLength`]($getChannelLeaderboardLength.md)
- [`$getChannelVar`]($getChannelVar.md)
- [`$setChannelVar`]($setChannelVar.md)

**Source:** [`src/functions/channel/getChannelLeaderboardValue.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/channel/getChannelLeaderboardValue.ts)

# $getChannelLeaderboardLength

> Returns the total number of entries in a channel leaderboard.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `channel` | v2.0.0 | required | yes | `Number` |

## Signature

```fs
$getChannelLeaderboardLength[name;guild ID;length;decimals]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable to query |
| 2 | `guild ID` | `Guild` | no | no | The guild ID for which to retrieve channel variables |
| 3 | `length` | `Number` | no | no | The number of users per page |
| 4 | `decimals` | `Boolean` | no | no | Specify whether to return decimals for more precise results (default: false) |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable to query. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`guild ID`** (`Guild`, optional): The guild ID for which to retrieve channel variables. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`length`** (`Number`, optional): The number of users per page. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`decimals`** (`Boolean`, optional): Specify whether to return decimals for more precise results (default: false). Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$getChannelLeaderboardLength` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getChannelLeaderboardLength[name]
```

**Full form (all arguments)**

```fs
$getChannelLeaderboardLength[name;123456789012345678;5;true]
```

## Reference implementation (source)

Taken from `src/functions/channel/getChannelLeaderboardLength.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        const data = await DataBase.find({ name, type: "channel", guildId: guild?.id ?? ctx.guild!.id })
        data.sort((a, b) => parseInt(a.value) - parseInt(b.value))
        const number = data.length / (length ?? 1)
        return this.success(decimals ? number : number % 1 ? Math.floor(number) + 1 : number)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`guild ID`, `length`, `decimals`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$channelLeaderboard`]($channelLeaderboard.md)
- [`$deleteChannelVar`]($deleteChannelVar.md)
- [`$getChannelLeaderboardID`]($getChannelLeaderboardID.md)
- [`$getChannelLeaderboardValue`]($getChannelLeaderboardValue.md)
- [`$getChannelVar`]($getChannelVar.md)
- [`$setChannelVar`]($setChannelVar.md)

**Source:** [`src/functions/channel/getChannelLeaderboardLength.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/channel/getChannelLeaderboardLength.ts)

# $channelLeaderboard

> Creates a leaderboard specific to channels based on a variable.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `channel` | v2.0.0 | required | no | `String` |

## Signature

```fs
$channelLeaderboard[name;guild ID;sort type;max;page;separator;envValue;envPosition;code]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable used to create the leaderboard. |
| 2 | `guild ID` | `Guild` | no | no | The unique identifier of the guild for which you want to retrieve channel variables. |
| 3 | `sort type` | `Enum` | no | no | The sorting order for the leaderboard, either ascending (asc) or descending (desc). |
| 4 | `max` | `Number` | no | no | The maximum number of entries to display per page on the leaderboard. |
| 5 | `page` | `Number` | no | no | The specific page number of the leaderboard you wish to view. |
| 6 | `separator` | `String` | no | no | The separator to be utilized between each row in the leaderboard. |
| 7 | `envValue` | `String` | no | no | The variable name to employ for $env, facilitating the retrieval of identifiers and values using $env[<name>;id] and $env[<name>;value] respectively. |
| 8 | `envPosition` | `String` | no | no | The variable name utilized for $env to acquire the position using $env[<name>]. |
| 9 | `code` | `String` | no | no | Code executed for each row. Remember to use $return, otherwise it will not return anything. |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable used to create the leaderboard.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`guild ID`** (`Guild`, optional): The unique identifier of the guild for which you want to retrieve channel variables.. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`sort type`** (`Enum`, optional): The sorting order for the leaderboard, either ascending (asc) or descending (desc).. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`max`** (`Number`, optional): The maximum number of entries to display per page on the leaderboard.. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`page`** (`Number`, optional): The specific page number of the leaderboard you wish to view.. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`separator`** (`String`, optional): The separator to be utilized between each row in the leaderboard.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`envValue`** (`String`, optional): The variable name to employ for $env, facilitating the retrieval of identifiers and values using $env[<name>;id] and $env[<name>;value] respectively.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`envPosition`** (`String`, optional): The variable name utilized for $env to acquire the position using $env[<name>].. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`code`** (`String`, optional): Code executed for each row. Remember to use $return, otherwise it will not return anything.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$channelLeaderboard` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$channelLeaderboard[name]
```

**Full form (all arguments)**

```fs
$channelLeaderboard[name;123456789012345678;value;5;5;,;value;value;code]
```

## Reference implementation (source)

Taken from `src/functions/channel/channelLeaderboard.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        const [name, guild, sortType, max, page, separator, valueVariable, positionVariable, code] = this.data.fields as IExtendedCompiledFunctionField[]

        const nameV = (await this["resolveCode"](ctx, name)) as Return
        if (!this["isValidReturnType"](nameV)) return nameV

        const guildID = (await this["resolveCode"](ctx, guild)) as Return
        if (!this["isValidReturnType"](guildID)) return guildID

        const sortTypeV = (await this["resolveCode"](ctx, sortType)) as Return
        if (!this["isValidReturnType"](sortTypeV)) return sortTypeV

        const maxV = (await this["resolveCode"](ctx, max)) as Return
        if (!this["isValidReturnType"](maxV)) return maxV

        const pageV = (await this["resolveCode"](ctx, page)) as Return
        if (!this["isValidReturnType"](pageV)) return pageV

        const separatorV = (await this["resolveCode"](ctx, separator)) as Return
        if (!this["isValidReturnType"](separatorV)) return separatorV

        const limit = Number(maxV.value) || 10
        const pag = Number(pageV.value) || 1

        const elements = new Array<string>()
        const rows = await DataBase.find({ name: nameV.value as string, type: "channel", guildId: (guildID.value as string) ?? ctx.guild!.id })
            .then((x) => x.sort((x, y) => (sortTypeV?.value === "asc" ? Number(x.value) - Number(y.value) : Number(y.value) - Number(x.value))))
            .then((x) => x.slice(pag * limit - limit, pag * limit))

        for (let i = 0, len = rows.length; i < len; i++) {
            const index = pag * limit - limit + i + 1
            const row = rows[i]
            const channel_name = ctx.client.guilds.cache.get((guildID.value as string) ?? ctx.guild!.id)?.channels.cache.get(row.id)?.name

            const info = { channel_name, ...row }
            ctx.setEnvironmentKey(positionVariable?.value || "", index)
            ctx.setEnvironmentKey(valueVariable?.value || "", info)
            if (!code) elements.push(`${index}. ${channel_name} ~ ${row.value}`)
            const execution = (await this["resolveCode"](ctx, code)) as Return
            if (execution.value) elements.push(execution.value as string)
        }

        return this.success(elements.join((separatorV?.value as string) || "\n"))
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`guild ID`, `sort type`, `max`, `page`, `separator`, `envValue`, `envPosition`, `code`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteChannelVar`]($deleteChannelVar.md)
- [`$getChannelLeaderboardID`]($getChannelLeaderboardID.md)
- [`$getChannelLeaderboardLength`]($getChannelLeaderboardLength.md)
- [`$getChannelLeaderboardValue`]($getChannelLeaderboardValue.md)
- [`$getChannelVar`]($getChannelVar.md)
- [`$setChannelVar`]($setChannelVar.md)

**Source:** [`src/functions/channel/channelLeaderboard.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/channel/channelLeaderboard.ts)

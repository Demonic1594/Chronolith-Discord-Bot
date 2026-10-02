# $memberLeaderboard

> Creates a leaderboard of members for a variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `member` | v2.0.0 | required | no | `String` |

## Signature

```fs
$memberLeaderboard[name;guild ID;sort type;max;page;separator;envValue;envPosition;code]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable to create the leaderboard for |
| 2 | `guild ID` | `Guild` | no | no | The guild ID for which to retrieve the variable of members |
| 3 | `sort type` | `Enum` | no | no | The sort order for the leaderboard, either ascending (asc) or descending (desc) |
| 4 | `max` | `Number` | no | no | The maximum number of rows per page |
| 5 | `page` | `Number` | no | no | The page number |
| 6 | `separator` | `String` | no | no | The separator to use for each row |
| 7 | `envValue` | `String` | no | no | The variable name to use for $env, retrieve the id with $env[<name>;id] and the value with $env[<name>;value] |
| 8 | `envPosition` | `String` | no | no | The variable name to use for $env, retrieve the position with $env[<name>] |
| 9 | `code` | `String` | no | no | Code to execute for each row. Remember to use $return, otherwise it will not return anything. |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable to create the leaderboard for. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`guild ID`** (`Guild`, optional): The guild ID for which to retrieve the variable of members. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`sort type`** (`Enum`, optional): The sort order for the leaderboard, either ascending (asc) or descending (desc). Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`max`** (`Number`, optional): The maximum number of rows per page. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`page`** (`Number`, optional): The page number. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`separator`** (`String`, optional): The separator to use for each row. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`envValue`** (`String`, optional): The variable name to use for $env, retrieve the id with $env[<name>;id] and the value with $env[<name>;value]. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`envPosition`** (`String`, optional): The variable name to use for $env, retrieve the position with $env[<name>]. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`code`** (`String`, optional): Code to execute for each row. Remember to use $return, otherwise it will not return anything.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Member functions operate on guild members — roles, timeouts, moderation actions, voice state, properties.

`$memberLeaderboard` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$memberLeaderboard[name]
```

**Full form (all arguments)**

```fs
$memberLeaderboard[name;123456789012345678;value;5;5;,;value;value;code]
```

## Reference implementation (source)

Taken from `src/functions/member/memberLeaderboard.ts` in the `ForgeDB` repository — this is exactly what runs:

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
        const rows = await DataBase.find({ name: nameV.value as string, type: "member", guildId: (guildID.value as string) ?? ctx.guild!.id })
            .then((x) => x.sort((x, y) => (sortTypeV?.value === "asc" ? Number(x.value) - Number(y.value) : Number(y.value) - Number(x.value))))
            .then((x) => x.slice(pag * limit - limit, pag * limit))

        for (let i = 0, len = rows.length; i < len; i++) {
            const index = pag * limit - limit + i + 1
            const row = rows[i]
            const username = ctx.client.guilds.cache.get((guildID.value as string) ?? ctx.guild!.id)?.members.cache.get(row.id)?.user.username

            const info = { username, ...row }
            ctx.setEnvironmentKey(positionVariable?.value || "", index)
            ctx.setEnvironmentKey(valueVariable?.value || "", info)
            if (!code) elements.push(`${index}. ${username} ~ ${row.value}`)
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

- [`$deleteMemberVar`]($deleteMemberVar.md)
- [`$getMemberLeaderboardID`]($getMemberLeaderboardID.md)
- [`$getMemberLeaderboardLength`]($getMemberLeaderboardLength.md)
- [`$getMemberLeaderboardValue`]($getMemberLeaderboardValue.md)
- [`$getMemberVar`]($getMemberVar.md)
- [`$setMemberVar`]($setMemberVar.md)

**Source:** [`src/functions/member/memberLeaderboard.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/member/memberLeaderboard.ts)

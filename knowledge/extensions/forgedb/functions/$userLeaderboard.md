# $userLeaderboard

> Creates a user leaderboard for a variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `user` | v2.0.0 | required | no | `String` |

## Signature

```fs
$userLeaderboard[name;sort type;max;page;separator;envValue;envPosition;code]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable |
| 2 | `sort type` | `Enum` | no | no | The sort type for the leaderboard, either asc (ascending) or desc (descending) |
| 3 | `max` | `Number` | no | no | The maximum number of rows per page |
| 4 | `page` | `Number` | no | no | The page number |
| 5 | `separator` | `String` | no | no | The separator to use for each row |
| 6 | `envValue` | `String` | no | no | The variable name to use for $env. Retrieve the id with $env[<name>;id] and the value with $env[<name>;value] |
| 7 | `envPosition` | `String` | no | no | The variable name to use for $env. Retrieve the position with $env[<name>] |
| 8 | `code` | `String` | no | no | Code to execute for each row. Remember to use $return, otherwise it will not return anything. |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`sort type`** (`Enum`, optional): The sort type for the leaderboard, either asc (ascending) or desc (descending). Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`max`** (`Number`, optional): The maximum number of rows per page. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`page`** (`Number`, optional): The page number. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`separator`** (`String`, optional): The separator to use for each row. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`envValue`** (`String`, optional): The variable name to use for $env. Retrieve the id with $env[<name>;id] and the value with $env[<name>;value]. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`envPosition`** (`String`, optional): The variable name to use for $env. Retrieve the position with $env[<name>]. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`code`** (`String`, optional): Code to execute for each row. Remember to use $return, otherwise it will not return anything.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$userLeaderboard` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$userLeaderboard[name]
```

**Full form (all arguments)**

```fs
$userLeaderboard[name;value;5;5;,;value;value;code]
```

## Reference implementation (source)

Taken from `src/functions/user/userLeaderboard.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        const [name, sortType, max, page, separator, valueVariable, positionVariable, code] = this.data.fields as IExtendedCompiledFunctionField[]

        const nameV = (await this["resolveCode"](ctx, name)) as Return
        if (!this["isValidReturnType"](nameV)) return nameV

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
        const rows = await DataBase.find({ name: nameV.value as string, type: "user" })
            .then((x) => x.sort((x, y) => (sortTypeV?.value === "asc" ? Number(x.value) - Number(y.value) : Number(y.value) - Number(x.value))))
            .then((x) => x.slice(pag * limit - limit, pag * limit))

        for (let i = 0, len = rows.length; i < len; i++) {
            const index = pag * limit - limit + i + 1
            const row = rows[i]
            const username = ctx.client.users.cache.get(row.id)?.username

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
3. Optional arguments (`sort type`, `max`, `page`, `separator`, `envValue`, `envPosition`, `code`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteUserVar`]($deleteUserVar.md)
- [`$getUserLeaderboardID`]($getUserLeaderboardID.md)
- [`$getUserLeaderboardLength`]($getUserLeaderboardLength.md)
- [`$getUserLeaderboardValue`]($getUserLeaderboardValue.md)
- [`$getUserVar`]($getUserVar.md)
- [`$setUserVar`]($setUserVar.md)

**Source:** [`src/functions/user/userLeaderboard.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/user/userLeaderboard.ts)

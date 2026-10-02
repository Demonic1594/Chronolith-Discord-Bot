# $getUserLeaderboardLength

> Returns the length of a user leaderboard

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `user` | v2.0.0 | required | yes | `Number` |

## Signature

```fs
$getUserLeaderboardLength[name;length;decimals]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable |
| 2 | `length` | `Number` | no | no | The length of users per page |
| 3 | `decimals` | `Boolean` | no | no | Return decimals for more accurate results, default: false |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`length`** (`Number`, optional): The length of users per page. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`decimals`** (`Boolean`, optional): Return decimals for more accurate results, default: false. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$getUserLeaderboardLength` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getUserLeaderboardLength[name]
```

**Full form (all arguments)**

```fs
$getUserLeaderboardLength[name;5;true]
```

## Reference implementation (source)

Taken from `src/functions/user/getUserLeaderboardLength.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        const data = await DataBase.find({ name, type: "user" })
        data.sort((a, b) => parseInt(a.value) - parseInt(b.value))
        const number = data.length / (length ?? 1)
        return this.success(decimals ? number : number % 1 ? Math.floor(number) + 1 : number)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`length`, `decimals`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteUserVar`]($deleteUserVar.md)
- [`$getUserLeaderboardID`]($getUserLeaderboardID.md)
- [`$getUserLeaderboardValue`]($getUserLeaderboardValue.md)
- [`$getUserVar`]($getUserVar.md)
- [`$setUserVar`]($setUserVar.md)
- [`$userLeaderboard`]($userLeaderboard.md)

**Source:** [`src/functions/user/getUserLeaderboardLength.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/user/getUserLeaderboardLength.ts)

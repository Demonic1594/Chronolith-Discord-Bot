# $setUserVar

> Sets a user's value in a variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `user` | v2.0.0 | required | yes | — |

## Signature

```fs
$setUserVar[name;value;user ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable |
| 2 | `value` | `String` | **yes** | no | The value |
| 3 | `user ID` | `String` | no | no | The user id of the variable |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`value`** (`String`, required): The value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`user ID`** (`String`, optional): The user id of the variable. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$setUserVar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setUserVar[name;value]
```

**Full form (all arguments)**

```fs
$setUserVar[name;value;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/user/setUserVar.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        await DataBase.set({ name, id: user ?? ctx.user!.id, value, type: "user" })
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`user ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteUserVar`]($deleteUserVar.md)
- [`$getUserLeaderboardID`]($getUserLeaderboardID.md)
- [`$getUserLeaderboardLength`]($getUserLeaderboardLength.md)
- [`$getUserLeaderboardValue`]($getUserLeaderboardValue.md)
- [`$getUserVar`]($getUserVar.md)
- [`$userLeaderboard`]($userLeaderboard.md)

**Source:** [`src/functions/user/setUserVar.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/user/setUserVar.ts)

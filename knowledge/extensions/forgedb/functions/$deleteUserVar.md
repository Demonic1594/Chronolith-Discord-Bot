# $deleteUserVar

> Deletes a value from a user variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `user` | v2.0.0 | required | yes | — |

## Signature

```fs
$deleteUserVar[name;user ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable |
| 2 | `user ID` | `String` | no | no | The ID of the user |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`user ID`** (`String`, optional): The ID of the user. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$deleteUserVar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteUserVar[name]
```

**Full form (all arguments)**

```fs
$deleteUserVar[name;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/user/deleteUserVar.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        await DataBase.delete({ name, id: user ?? ctx.user!.id, type: "user" })
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`user ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$getUserLeaderboardID`]($getUserLeaderboardID.md)
- [`$getUserLeaderboardLength`]($getUserLeaderboardLength.md)
- [`$getUserLeaderboardValue`]($getUserLeaderboardValue.md)
- [`$getUserVar`]($getUserVar.md)
- [`$setUserVar`]($setUserVar.md)
- [`$userLeaderboard`]($userLeaderboard.md)

**Source:** [`src/functions/user/deleteUserVar.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/user/deleteUserVar.ts)

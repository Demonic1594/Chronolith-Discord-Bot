# $setMemberVar

> Sets a member's value in a variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `member` | v2.0.0 | required | yes | — |

## Signature

```fs
$setMemberVar[name;value;member ID;guild ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable |
| 2 | `value` | `String` | **yes** | no | The value to set |
| 3 | `member ID` | `String` | no | no | The ID of the member |
| 4 | `guild ID` | `Guild` | no | no | The guild ID |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`value`** (`String`, required): The value to set. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`member ID`** (`String`, optional): The ID of the member. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`guild ID`** (`Guild`, optional): The guild ID. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.

## How it works

Member functions operate on guild members — roles, timeouts, moderation actions, voice state, properties.

`$setMemberVar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setMemberVar[name;value]
```

**Full form (all arguments)**

```fs
$setMemberVar[name;value;123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/member/setMemberVar.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        await DataBase.set({ name, id: member ?? ctx.member!.id, value, type: "member", guildId: guild?.id ?? ctx.guild!.id })
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`member ID`, `guild ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteMemberVar`]($deleteMemberVar.md)
- [`$getMemberLeaderboardID`]($getMemberLeaderboardID.md)
- [`$getMemberLeaderboardLength`]($getMemberLeaderboardLength.md)
- [`$getMemberLeaderboardValue`]($getMemberLeaderboardValue.md)
- [`$getMemberVar`]($getMemberVar.md)
- [`$memberLeaderboard`]($memberLeaderboard.md)

**Source:** [`src/functions/member/setMemberVar.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/member/setMemberVar.ts)

# $deleteMemberVar

> Removes a value from a member variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `member` | v2.0.0 | required | yes | — |

## Signature

```fs
$deleteMemberVar[name;member ID;guild ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable from which to remove the value |
| 2 | `member ID` | `String` | no | no | The identifier of the value |
| 3 | `guild ID` | `String` | no | no | The guild to which the member belongs |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable from which to remove the value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`member ID`** (`String`, optional): The identifier of the value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`guild ID`** (`String`, optional): The guild to which the member belongs. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Member functions operate on guild members — roles, timeouts, moderation actions, voice state, properties.

`$deleteMemberVar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteMemberVar[name]
```

**Full form (all arguments)**

```fs
$deleteMemberVar[name;123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/member/deleteMemberVar.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        await DataBase.delete({ name, id: member ?? ctx.member!.id, type: "member", guildId: guild ?? ctx.guild!.id })
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`member ID`, `guild ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$getMemberLeaderboardID`]($getMemberLeaderboardID.md)
- [`$getMemberLeaderboardLength`]($getMemberLeaderboardLength.md)
- [`$getMemberLeaderboardValue`]($getMemberLeaderboardValue.md)
- [`$getMemberVar`]($getMemberVar.md)
- [`$memberLeaderboard`]($memberLeaderboard.md)
- [`$setMemberVar`]($setMemberVar.md)

**Source:** [`src/functions/member/deleteMemberVar.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/member/deleteMemberVar.ts)

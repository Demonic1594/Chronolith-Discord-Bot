# $getMemberCooldownTime

> Retrieves current cooldown time in ms for given guild and user id, binded to current command

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `cooldown` | v1.5.0 | required | yes | `Number` |

## Signature

```fs
$getMemberCooldownTime[guild ID;user ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `String` | **yes** | no | The guild id to get its cooldown |
| 2 | `user ID` | `String` | **yes** | no | The user id to get its cooldown |

### Per-parameter notes

- **`guild ID`** (`String`, required): The guild id to get its cooldown. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`user ID`** (`String`, required): The user id to get its cooldown. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Cooldown functions gate command execution per user/guild/channel/member with durations, and inspect remaining cooldown time.

`$getMemberCooldownTime` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getMemberCooldownTime[123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/cooldown/getMemberCooldownTime.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.client.cooldowns.getTimeLeft(ctx.client.cooldowns.identifier(ctx.cmd!.id, "member", gid, uid)))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$channelCooldown`]($channelCooldown.md)
- [`$cooldown`]($cooldown.md)
- [`$deleteChannelCooldown`]($deleteChannelCooldown.md)
- [`$deleteCooldown`]($deleteCooldown.md)
- [`$deleteGuildCooldown`]($deleteGuildCooldown.md)
- [`$deleteMemberCooldown`]($deleteMemberCooldown.md)
- [`$deleteUserCooldown`]($deleteUserCooldown.md)
- [`$getCooldownTime`]($getCooldownTime.md)

**Source:** [`src/native/cooldown/getMemberCooldownTime.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/cooldown/getMemberCooldownTime.ts)

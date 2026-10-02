# $deleteUserCooldown

> Deletes cooldown for given user id, binded to current command

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `cooldown` | v1.5.0 | required | yes | — |

## Signature

```fs
$deleteUserCooldown[user ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `user ID` | `String` | **yes** | no | The id to delete its cooldown |

### Per-parameter notes

- **`user ID`** (`String`, required): The id to delete its cooldown. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Cooldown functions gate command execution per user/guild/channel/member with durations, and inspect remaining cooldown time.

`$deleteUserCooldown` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteUserCooldown[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/cooldown/deleteUserCooldown.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.client.cooldowns.delete(ctx.client.cooldowns.identifier(ctx.cmd!.id, "user", id))
        return this.success()
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
- [`$getCooldownTime`]($getCooldownTime.md)
- [`$getGuildCooldownTime`]($getGuildCooldownTime.md)

**Source:** [`src/native/cooldown/deleteUserCooldown.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/cooldown/deleteUserCooldown.ts)

# $getUserCooldownTime

> Retrieves current cooldown time in ms for a user

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `cooldowns` | v2.0.0 | required | yes | `Number` |

## Signature

```fs
$getUserCooldownTime[name;user ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the command you are trying to check the cooldown |
| 2 | `user ID` | `User` | no | no | The user id to get its cooldown |

### Per-parameter notes

- **`name`** (`String`, required): The name of the command you are trying to check the cooldown. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`user ID`** (`User`, optional): The user id to get its cooldown. Expects a user ID. Must be a 16-23 digit snowflake; fetched via `client.users.fetch`.

## How it works

See the function list below for exact signatures.

`$getUserCooldownTime` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getUserCooldownTime[name]
```

**Full form (all arguments)**

```fs
$getUserCooldownTime[name;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/cooldowns/getUserCooldownTime.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success((await DataBase.cdTimeLeft(DataBase.make_cdIdentifier({ name: name, id: id?.id ?? ctx.user?.id }))).left)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`user ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$channelCooldown`]($channelCooldown.md)
- [`$deleteChannelCooldown`]($deleteChannelCooldown.md)
- [`$deleteGlobalCooldown`]($deleteGlobalCooldown.md)
- [`$deleteGuildCooldown`]($deleteGuildCooldown.md)
- [`$deleteMemberCooldown`]($deleteMemberCooldown.md)
- [`$deleteUserCooldown`]($deleteUserCooldown.md)
- [`$getChannelCooldownTime`]($getChannelCooldownTime.md)
- [`$getGlobalCooldownTime`]($getGlobalCooldownTime.md)

**Source:** [`src/functions/cooldowns/getUserCooldownTime.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/cooldowns/getUserCooldownTime.ts)

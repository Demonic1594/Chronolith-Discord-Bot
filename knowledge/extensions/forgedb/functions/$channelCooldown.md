# $channelCooldown

> Imposes a cooldown period for a command within a specific channel.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `cooldowns` | v2.0.0 | required | no | — |

## Signature

```fs
$channelCooldown[name;duration;code;channel ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the command for which you wish to set a cooldown. |
| 2 | `duration` | `Time` | **yes** | no | The length of time the cooldown will last. |
| 3 | `code` | `String` | no | no | The code to execute when the cooldown is in effect. |
| 4 | `channel ID` | `Channel` | no | no | The unique identifier (id) of the channel to apply the cooldown to. |

### Per-parameter notes

- **`name`** (`String`, required): The name of the command for which you wish to set a cooldown.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`duration`** (`Time`, required): The length of time the cooldown will last.. Expects a duration. A raw number is used as milliseconds directly; otherwise parsed by `TimeParser` (`10m`, `1h30m`, `2d`, `45s`, ...).
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`code`** (`String`, optional): The code to execute when the cooldown is in effect.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`channel ID`** (`Channel`, optional): The unique identifier (id) of the channel to apply the cooldown to.. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

See the function list below for exact signatures.

`$channelCooldown` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$channelCooldown[name;10m]
```

**Full form (all arguments)**

```fs
$channelCooldown[name;10m;code;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/cooldowns/channelCooldown.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        const [, , code] = this.data.fields! as IExtendedCompiledFunctionField[]
        const dur = await this["resolveUnhandledArg"](ctx, 1)
        if (!this["isValidReturnType"](dur)) return dur

        const nameV = await this["resolveUnhandledArg"](ctx, 0)
        if (!this["isValidReturnType"](nameV)) return nameV

        const idV = await this["resolveUnhandledArg"](ctx, 3)
        if (!this["isValidReturnType"](idV)) return idV

        const cooldown = await DataBase.cdTimeLeft(DataBase.make_cdIdentifier({ name: nameV.value, id: idV.value?.id ?? ctx.channel?.id }))

        if (cooldown.left !== 0) {
            ctx.setEnvironmentKey("time", cooldown.left)
            const content = await this["resolveCode"](ctx, code)
            if (!this["isValidReturnType"](content)) return content
            ctx.container.content = content.value as string
            await ctx.container.send(ctx.obj)
            return this.stop()
        }

        await DataBase.cdAdd({ name: nameV.value as string, id: idV.value?.id ?? ctx.channel?.id, duration: dur.value as number })

        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`code`, `channel ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Time arguments accept either a raw number (milliseconds) or a duration string like `10m`, `1h30m`, `2d`.
6. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
7. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteChannelCooldown`]($deleteChannelCooldown.md)
- [`$deleteGlobalCooldown`]($deleteGlobalCooldown.md)
- [`$deleteGuildCooldown`]($deleteGuildCooldown.md)
- [`$deleteMemberCooldown`]($deleteMemberCooldown.md)
- [`$deleteUserCooldown`]($deleteUserCooldown.md)
- [`$getChannelCooldownTime`]($getChannelCooldownTime.md)
- [`$getGlobalCooldownTime`]($getGlobalCooldownTime.md)
- [`$getGuildCooldownTime`]($getGuildCooldownTime.md)

**Source:** [`src/functions/cooldowns/channelCooldown.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/cooldowns/channelCooldown.ts)

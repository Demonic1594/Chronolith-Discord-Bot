# $guildCooldown

> Adds a cooldown binded to a guild and command

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `cooldown` | v1.5.0 | required | no | — |

> ⚠️ **experimental** · aliases: $serverCooldown

## Signature

```fs
$guildCooldown[guild ID;duration;code]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `String` | **yes** | no | The guild id to assign the cooldown to |
| 2 | `duration` | `Time` | **yes** | no | The duration of the cooldown |
| 3 | `code` | `String` | no | no | The code to execute if the cooldown is active |

### Per-parameter notes

- **`guild ID`** (`String`, required): The guild id to assign the cooldown to. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`duration`** (`Time`, required): The duration of the cooldown. Expects a duration. A raw number is used as milliseconds directly; otherwise parsed by `TimeParser` (`10m`, `1h30m`, `2d`, `45s`, ...).
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`code`** (`String`, optional): The code to execute if the cooldown is active. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Cooldown functions gate command execution per user/guild/channel/member with durations, and inspect remaining cooldown time.

`$guildCooldown` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$guildCooldown[123456789012345678;10m]
```

**Full form (all arguments)**

```fs
$guildCooldown[123456789012345678;10m;code]
```

## Reference implementation (source)

Taken from `src/native/cooldown/guildCooldown.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const [, , code] = this.data.fields! as IExtendedCompiledFunctionField[]

        const dur = await this["resolveUnhandledArg"](ctx, 1)
        if (!this["isValidReturnType"](dur)) return dur

        const idV = await this["resolveUnhandledArg"](ctx, 0)
        if (!this["isValidReturnType"](idV)) return idV

        const id = ctx.client.cooldowns.identifier(ctx.cmd!.id, "guild", idV.value as string)

        const cooldown = ctx.client.cooldowns.getTimeLeft(id)

        if (cooldown !== 0) {
            const content = await this["resolveCode"](ctx, code)
            if (!this["isValidReturnType"](content)) return content
            ctx.container.content = content.value as string
            await ctx.container.send(ctx.obj)
            return this.stop()
        }

        ctx.client.cooldowns.add(id, dur.value as number)

        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$serverCooldown` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
4. Optional arguments (`code`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
5. Time arguments accept either a raw number (milliseconds) or a duration string like `10m`, `1h30m`, `2d`.
6. Marked **experimental** in source — behavior may change without a major version bump.
7. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
8. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$channelCooldown`]($channelCooldown.md)
- [`$cooldown`]($cooldown.md)
- [`$deleteChannelCooldown`]($deleteChannelCooldown.md)
- [`$deleteCooldown`]($deleteCooldown.md)
- [`$deleteGuildCooldown`]($deleteGuildCooldown.md)
- [`$deleteMemberCooldown`]($deleteMemberCooldown.md)
- [`$deleteUserCooldown`]($deleteUserCooldown.md)
- [`$getCooldownTime`]($getCooldownTime.md)

**Source:** [`src/native/cooldown/guildCooldown.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/cooldown/guildCooldown.ts)

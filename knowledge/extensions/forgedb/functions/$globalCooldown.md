# $globalCooldown

> Adds a cooldown to a command for a global

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `cooldowns` | v2.0.0 | required | no | — |

## Signature

```fs
$globalCooldown[name;duration;code]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the command you are trying to add a cooldown |
| 2 | `duration` | `Time` | **yes** | no | The duration of the cooldown |
| 3 | `code` | `String` | no | no | The code to execute if the cooldown is active |

### Per-parameter notes

- **`name`** (`String`, required): The name of the command you are trying to add a cooldown. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`duration`** (`Time`, required): The duration of the cooldown. Expects a duration. A raw number is used as milliseconds directly; otherwise parsed by `TimeParser` (`10m`, `1h30m`, `2d`, `45s`, ...).
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`code`** (`String`, optional): The code to execute if the cooldown is active. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

See the function list below for exact signatures.

`$globalCooldown` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$globalCooldown[name;10m]
```

**Full form (all arguments)**

```fs
$globalCooldown[name;10m;code]
```

## Reference implementation (source)

Taken from `src/functions/cooldowns/globalCooldown.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        const [, , code] = this.data.fields! as IExtendedCompiledFunctionField[]
        const dur = await this["resolveUnhandledArg"](ctx, 1)
        if (!this["isValidReturnType"](dur)) return dur

        const nameV = await this["resolveUnhandledArg"](ctx, 0)
        if (!this["isValidReturnType"](nameV)) return nameV

        const cooldown = await DataBase.cdTimeLeft(DataBase.make_cdIdentifier({ name: nameV.value }))

        if (cooldown.left !== 0) {
            ctx.setEnvironmentKey("time", cooldown.left)
            const content = await this["resolveCode"](ctx, code)
            if (!this["isValidReturnType"](content)) return content
            ctx.container.content = content.value as string
            await ctx.container.send(ctx.obj)
            return this.stop()
        }

        await DataBase.cdAdd({ name: nameV.value as string, duration: dur.value as number })

        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`code`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Time arguments accept either a raw number (milliseconds) or a duration string like `10m`, `1h30m`, `2d`.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$channelCooldown`]($channelCooldown.md)
- [`$deleteChannelCooldown`]($deleteChannelCooldown.md)
- [`$deleteGlobalCooldown`]($deleteGlobalCooldown.md)
- [`$deleteGuildCooldown`]($deleteGuildCooldown.md)
- [`$deleteMemberCooldown`]($deleteMemberCooldown.md)
- [`$deleteUserCooldown`]($deleteUserCooldown.md)
- [`$getChannelCooldownTime`]($getChannelCooldownTime.md)
- [`$getGlobalCooldownTime`]($getGlobalCooldownTime.md)

**Source:** [`src/functions/cooldowns/globalCooldown.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/cooldowns/globalCooldown.ts)

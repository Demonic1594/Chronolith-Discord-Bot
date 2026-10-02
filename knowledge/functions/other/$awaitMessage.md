# $awaitMessage

> Awaits a message, returns message ID or nothing if no valid response

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `other` | v1.0.7 | required | no | `Message` |

## Signature

```fs
$awaitMessage[channel ID;variable name;filter;time]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to await message on |
| 2 | `variable name` | `String` | **yes** | no | The variable to load the message id that was sent as response by a user, get it with $env[<variable>] |
| 3 | `filter` | `String` | **yes** | no | The filter to run for every message sent after this |
| 4 | `time` | `Time` | **yes** | no | The max time to wait for a message |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to await message on. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`variable name`** (`String`, required): The variable to load the message id that was sent as response by a user, get it with $env[<variable>]. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`filter`** (`String`, required): The filter to run for every message sent after this. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
  - Condition argument: supports the operators `==`, `!=`, `<`, `<=`, `>`, `>=`. Without an operator, the left side is checked for equality against the string `"true"`.
- **`time`** (`Time`, required): The max time to wait for a message. Expects a duration. A raw number is used as milliseconds directly; otherwise parsed by `TimeParser` (`10m`, `1h30m`, `2d`, `45s`, ...).
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Uncategorized utilities.

`$awaitMessage` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$awaitMessage[123456789012345678;name;value;10m]
```

## Reference implementation (source)

Taken from `src/native/other/awaitMessage.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const filter = this.data.fields![2] as IExtendedCompiledFunctionConditionField
        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3)
        if (!this["isValidReturnType"](rt)) return rt
        const [ channel, varName, time ] = args
        const msg = await (channel as TextChannel).awaitMessages({
            errors: [ "time" ],
            max: 1,
            time,
            filter: async (m) => {
                ctx.setEnvironmentKey(varName, m.id)
                const res = await this["resolveCondition"](ctx, filter)
                if (res.return || res.success) {
                    return isTrue(res)
                } else return false
            }
        }).catch(ctx.noop)

        return this.success(msg?.first()?.id)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Time arguments accept either a raw number (milliseconds) or a duration string like `10m`, `1h30m`, `2d`.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedBar`]($advancedBar.md)
- [`$awaitComponent`]($awaitComponent.md)
- [`$awaitModalSubmit`]($awaitModalSubmit.md)
- [`$bar`]($bar.md)
- [`$c`]($c.md)
- [`$callFunction`]($callFunction.md)
- [`$callLocalFunction`]($callLocalFunction.md)
- [`$debug`]($debug.md)

**Source:** [`src/native/other/awaitMessage.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/other/awaitMessage.ts)

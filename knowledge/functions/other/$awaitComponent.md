# $awaitComponent

> Awaits a component, executing the code as the interaction context, returns bool depending on whether the interaction was received

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `other` | v1.4.0 | required | no | `Boolean` |

## Signature

```fs
$awaitComponent[channel ID;message ID;filter;success code;time]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to pull message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to await component on |
| 3 | `filter` | `String` | **yes** | no | The filter to run for every interaction received after this, this is called with interaction context |
| 4 | `success code` | `String` | **yes** | no | The code to execute on success, this is called with interaction context |
| 5 | `time` | `Time` | **yes** | no | The max time to wait for a component |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to pull message from. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`message ID`** (`Message`, required): The message to await component on. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`filter`** (`String`, required): The filter to run for every interaction received after this, this is called with interaction context. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
  - Condition argument: supports the operators `==`, `!=`, `<`, `<=`, `>`, `>=`. Without an operator, the left side is checked for equality against the string `"true"`.
- **`success code`** (`String`, required): The code to execute on success, this is called with interaction context. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`time`** (`Time`, required): The max time to wait for a component. Expects a duration. A raw number is used as milliseconds directly; otherwise parsed by `TimeParser` (`10m`, `1h30m`, `2d`, `45s`, ...).
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Uncategorized utilities.

`$awaitComponent` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$awaitComponent[123456789012345678;123456789012345678;value;code;10m]
```

## Reference implementation (source)

Taken from `src/native/other/awaitComponent.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const filter = this.data.fields![2] as IExtendedCompiledFunctionConditionField
        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 4)
        if (!this["isValidReturnType"](rt)) return rt
        const [ , msg, time ] = args

        const int = await msg.awaitMessageComponent({
            time,
            filter: async (m) => {
                const res = await this["resolveCondition"](ctx.clone({ obj: m }), filter)
                if (res.return || res.success) {
                    return isTrue(res)
                } else return false
            }
        }).catch(ctx.noop)
        
        if (int) {
            const rt = await this["resolveCode"](ctx.clone({ obj: int }), this.data.fields![3] as IExtendedCompiledFunctionField)
            if (!this["isValidReturnType"](rt))
                return rt
        }

        return this.success(!!int)
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
- [`$awaitMessage`]($awaitMessage.md)
- [`$awaitModalSubmit`]($awaitModalSubmit.md)
- [`$bar`]($bar.md)
- [`$c`]($c.md)
- [`$callFunction`]($callFunction.md)
- [`$callLocalFunction`]($callLocalFunction.md)
- [`$debug`]($debug.md)

**Source:** [`src/native/other/awaitComponent.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/other/awaitComponent.ts)

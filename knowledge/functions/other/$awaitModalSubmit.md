# $awaitModalSubmit

> Awaits a modal submit, executing the code as the interaction context, returns bool depending on whether the interaction was received

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `other` | v1.4.0 | required | no | `Boolean` |

## Signature

```fs
$awaitModalSubmit[custom ID;success code;time]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `custom ID` | `String` | **yes** | no | The modal's custom id to wait for |
| 2 | `success code` | `String` | **yes** | no | The code to execute on success, this is called with interaction context |
| 3 | `time` | `Time` | **yes** | no | The max time to wait for a component |

### Per-parameter notes

- **`custom ID`** (`String`, required): The modal's custom id to wait for. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`success code`** (`String`, required): The code to execute on success, this is called with interaction context. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`time`** (`Time`, required): The max time to wait for a component. Expects a duration. A raw number is used as milliseconds directly; otherwise parsed by `TimeParser` (`10m`, `1h30m`, `2d`, `45s`, ...).
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Uncategorized utilities.

`$awaitModalSubmit` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$awaitModalSubmit[123456789012345678;code;10m]
```

## Reference implementation (source)

Taken from `src/native/other/awaitModalSubmit.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (!ctx.interaction || !("awaitModalSubmit" in ctx.interaction))
            return this.success(false)

        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 2)
        if (!this["isValidReturnType"](rt)) return rt
        const [ id, time ] = args

        const int = await ctx.interaction.awaitModalSubmit({
            time,
            filter: i => i.customId === id
        }).catch(ctx.noop)
        
        if (int) {
            const rt = await this["resolveCode"](ctx.clone({ obj: int }), this.data.fields![0] as IExtendedCompiledFunctionField)
            if (!this["isValidReturnType"](rt))
                return rt
        }

        return this.success(!!int)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Time arguments accept either a raw number (milliseconds) or a duration string like `10m`, `1h30m`, `2d`.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedBar`]($advancedBar.md)
- [`$awaitComponent`]($awaitComponent.md)
- [`$awaitMessage`]($awaitMessage.md)
- [`$bar`]($bar.md)
- [`$c`]($c.md)
- [`$callFunction`]($callFunction.md)
- [`$callLocalFunction`]($callLocalFunction.md)
- [`$debug`]($debug.md)

**Source:** [`src/native/other/awaitModalSubmit.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/other/awaitModalSubmit.ts)

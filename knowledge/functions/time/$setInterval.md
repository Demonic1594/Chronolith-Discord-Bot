# $setInterval

> Executes code after given duration until canceled

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `time` | v1.0.2 | required | no | — |

## Signature

```fs
$setInterval[code;time;name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `code` | `String` | **yes** | no | The code to execute |
| 2 | `time` | `Time` | no | no | How long to wait for before running this code |
| 3 | `name` | `String` | no | no | The name for this interval |

### Per-parameter notes

- **`code`** (`String`, required): The code to execute. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`time`** (`Time`, optional): How long to wait for before running this code. Expects a duration. A raw number is used as milliseconds directly; otherwise parsed by `TimeParser` (`10m`, `1h30m`, `2d`, `45s`, ...).
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`name`** (`String`, optional): The name for this interval. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Time functions parse, format and convert timestamps/durations.

`$setInterval` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$setInterval[code]
```

**Full form (all arguments)**

```fs
$setInterval[code;10m;name]
```

## Reference implementation (source)

Taken from `src/native/time/setInterval.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const code = this.data.fields![0] as IExtendedCompiledFunctionField

        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 1, 2)
        if (!this["isValidReturnType"](rt)) return rt
        const [ time, name ] = args

        const c = ctx.clone(ctx.cloneRuntime())
        const data = setInterval(async () => {
            await this["resolveCode"](c, code).catch(ctx.noop)
        }, time || undefined)

        if (name) ctx.client.intervals.set(name, data)

        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`time`, `name`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Time arguments accept either a raw number (milliseconds) or a duration string like `10m`, `1h30m`, `2d`.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$calendarDay`]($calendarDay.md)
- [`$calendarWeek`]($calendarWeek.md)
- [`$clearInterval`]($clearInterval.md)
- [`$clearTimeout`]($clearTimeout.md)
- [`$day`]($day.md)
- [`$discordTimestamp`]($discordTimestamp.md)
- [`$executionTime`]($executionTime.md)
- [`$getTimestamp`]($getTimestamp.md)

## Community guides covering this function

- [$setInterval guide](../../guides/guide-161.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-161)

**Source:** [`src/native/time/setInterval.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/time/setInterval.ts)

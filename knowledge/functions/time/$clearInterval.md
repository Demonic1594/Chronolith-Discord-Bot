# $clearInterval

> Clears an active interval, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `time` | v2.3.0 | required | yes | `Boolean` |

> aliases: $stopInterval

## Signature

```fs
$clearInterval[name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the interval |

### Per-parameter notes

- **`name`** (`String`, required): The name of the interval. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Time functions parse, format and convert timestamps/durations.

`$clearInterval` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$clearInterval[name]
```

## Reference implementation (source)

Taken from `src/native/time/clearInterval.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const interval = ctx.client.intervals.get(name)
        clearInterval(interval)
        ctx.client.intervals.delete(name)
        return this.success(!!interval)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$stopInterval` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$calendarDay`]($calendarDay.md)
- [`$calendarWeek`]($calendarWeek.md)
- [`$clearTimeout`]($clearTimeout.md)
- [`$day`]($day.md)
- [`$discordTimestamp`]($discordTimestamp.md)
- [`$executionTime`]($executionTime.md)
- [`$getTimestamp`]($getTimestamp.md)
- [`$hour`]($hour.md)

## Community guides covering this function

- [$clearInterval guide](../../guides/guide-139.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-139)

**Source:** [`src/native/time/clearInterval.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/time/clearInterval.ts)

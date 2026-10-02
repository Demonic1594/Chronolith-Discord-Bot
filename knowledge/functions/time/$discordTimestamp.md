# $discordTimestamp

> Creates a discord timestamp

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `time` | v1.4.0 | required | yes | `String` |

## Signature

```fs
$discordTimestamp[time;style]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `time` | `Time` | **yes** | no | The time to turn into timestamp |
| 2 | `style` | `Enum` | **yes** | no | The timestamp style |

### Per-parameter notes

- **`time`** (`Time`, required): The time to turn into timestamp. Expects a duration. A raw number is used as milliseconds directly; otherwise parsed by `TimeParser` (`10m`, `1h30m`, `2d`, `45s`, ...).
- **`style`** (`Enum`, required): The timestamp style. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Time functions parse, format and convert timestamps/durations.

`$discordTimestamp` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$discordTimestamp[10m;value]
```

## Reference implementation (source)

Taken from `src/native/time/discordTimestamp.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(time(new Date(ms), style))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Time arguments accept either a raw number (milliseconds) or a duration string like `10m`, `1h30m`, `2d`.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$calendarDay`]($calendarDay.md)
- [`$calendarWeek`]($calendarWeek.md)
- [`$clearInterval`]($clearInterval.md)
- [`$clearTimeout`]($clearTimeout.md)
- [`$day`]($day.md)
- [`$executionTime`]($executionTime.md)
- [`$getTimestamp`]($getTimestamp.md)
- [`$hour`]($hour.md)

**Source:** [`src/native/time/discordTimestamp.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/time/discordTimestamp.ts)

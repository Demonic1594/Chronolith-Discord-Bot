# $setCalendar

> Sets the calendar for time functions

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `time` | v1.5.0 | required | yes | — |

> ⚠️ **experimental** · aliases: $calendar

## Signature

```fs
$setCalendar[type]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `type` | `Enum` | **yes** | no | The calendar type to use |

### Per-parameter notes

- **`type`** (`Enum`, required): The calendar type to use. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Time functions parse, format and convert timestamps/durations.

`$setCalendar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setCalendar[value]
```

## Reference implementation (source)

Taken from `src/native/time/setCalendar.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.calendar = type
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$calendar` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Marked **experimental** in source — behavior may change without a major version bump.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$calendarDay`]($calendarDay.md)
- [`$calendarWeek`]($calendarWeek.md)
- [`$clearInterval`]($clearInterval.md)
- [`$clearTimeout`]($clearTimeout.md)
- [`$day`]($day.md)
- [`$discordTimestamp`]($discordTimestamp.md)
- [`$executionTime`]($executionTime.md)
- [`$getTimestamp`]($getTimestamp.md)

**Source:** [`src/native/time/setCalendar.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/time/setCalendar.ts)

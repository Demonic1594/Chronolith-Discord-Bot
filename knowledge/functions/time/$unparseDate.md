# $unparseDate

> Unparses given date to ms

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `time` | v1.2.0 | required | yes | `Number` |

## Signature

```fs
$unparseDate[date]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `date` | `Date` | **yes** | no | The date to get its ms |

### Per-parameter notes

- **`date`** (`Date`, required): The date to get its ms. Expects a date. A unix timestamp in milliseconds (number) or any string the JS `Date` constructor understands (`2024-01-01`, ISO strings, ...).

## How it works

Time functions parse, format and convert timestamps/durations.

`$unparseDate` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$unparseDate[1710000000000]
```

## Reference implementation (source)

Taken from `src/native/time/unparseDate.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(date.getTime())
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$calendarDay`]($calendarDay.md)
- [`$calendarWeek`]($calendarWeek.md)
- [`$clearInterval`]($clearInterval.md)
- [`$clearTimeout`]($clearTimeout.md)
- [`$day`]($day.md)
- [`$discordTimestamp`]($discordTimestamp.md)
- [`$executionTime`]($executionTime.md)
- [`$getTimestamp`]($getTimestamp.md)

**Source:** [`src/native/time/unparseDate.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/time/unparseDate.ts)

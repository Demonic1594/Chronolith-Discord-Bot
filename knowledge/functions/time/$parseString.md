# $parseString

> Parses valid duration string to ms

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `time` | v1.0.2 | required | yes | `Number` |

## Signature

```fs
$parseString[duration]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `duration` | `String` | **yes** | no | The valid string to convert to ms |

### Per-parameter notes

- **`duration`** (`String`, required): The valid string to convert to ms. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Time functions parse, format and convert timestamps/durations.

`$parseString` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$parseString[10m]
```

## Reference implementation (source)

Taken from `src/native/time/parseString.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        try {
            return this.success(TimeParser.parseToMS(str))
        } catch (error) {
            return this.success(0)
        }
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.
4. VERIFIED (2.7.1): this is the native text-to-ms converter (`10m` → 600000). Returns 0 for unparsable input, no error. Its sibling `$parseMS` does the reverse (ms → human text) — do not confuse them.

## Related functions

- [`$calendarDay`]($calendarDay.md)
- [`$calendarWeek`]($calendarWeek.md)
- [`$clearInterval`]($clearInterval.md)
- [`$clearTimeout`]($clearTimeout.md)
- [`$day`]($day.md)
- [`$discordTimestamp`]($discordTimestamp.md)
- [`$executionTime`]($executionTime.md)
- [`$getTimestamp`]($getTimestamp.md)

**Source:** [`src/native/time/parseString.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/time/parseString.ts)

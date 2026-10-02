# $executionTime

> Returns current execution time

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `time` | v1.0.3 | none | no | `Number` |

## Signature

```fs
$executionTime
```

## How it works

Time functions parse, format and convert timestamps/durations.

`$executionTime` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$executionTime
```

## Reference implementation (source)

Taken from `src/native/time/executionTime.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(performance.now() - ctx.executionTimestamp)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$calendarDay`]($calendarDay.md)
- [`$calendarWeek`]($calendarWeek.md)
- [`$clearInterval`]($clearInterval.md)
- [`$clearTimeout`]($clearTimeout.md)
- [`$day`]($day.md)
- [`$discordTimestamp`]($discordTimestamp.md)
- [`$getTimestamp`]($getTimestamp.md)
- [`$hour`]($hour.md)

**Source:** [`src/native/time/executionTime.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/time/executionTime.ts)

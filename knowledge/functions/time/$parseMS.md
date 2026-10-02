# $parseMS

> Parses valid ms to duration

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `time` | v1.0.2 | required | yes | `String` |

## Signature

```fs
$parseMS[ms;limit;separator;and]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `ms` | `Number` | **yes** | no | The ms to convert to string |
| 2 | `limit` | `Number` | no | no | Limit of units to use |
| 3 | `separator` | `String` | no | no | The separator to use for every unit |
| 4 | `and` | `Boolean` | no | no | Whether to use and word for last unit |

### Per-parameter notes

- **`ms`** (`Number`, required): The ms to convert to string. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`limit`** (`Number`, optional): Limit of units to use. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`separator`** (`String`, optional): The separator to use for every unit. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`and`** (`Boolean`, optional): Whether to use and word for last unit. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Time functions parse, format and convert timestamps/durations.

`$parseMS` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$parseMS[5]
```

**Full form (all arguments)**

```fs
$parseMS[5;5;,;true]
```

## Reference implementation (source)

Taken from `src/native/time/parseMS.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            TimeParser.parseToString(ms, {
                and: and || false,
                limit: limit || undefined,
                separator: sep || " ",
            })
        )
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`limit`, `separator`, `and`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.
6. VERIFIED (2.7.1): converts ms → human-readable text (NOT text→ms). For text→ms use `$parseString[duration]`.

## Related functions

- [`$calendarDay`]($calendarDay.md)
- [`$calendarWeek`]($calendarWeek.md)
- [`$clearInterval`]($clearInterval.md)
- [`$clearTimeout`]($clearTimeout.md)
- [`$day`]($day.md)
- [`$discordTimestamp`]($discordTimestamp.md)
- [`$executionTime`]($executionTime.md)
- [`$getTimestamp`]($getTimestamp.md)

**Source:** [`src/native/time/parseMS.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/time/parseMS.ts)

# $bar

> Generates a progress bar

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `other` | v1.5.0 | required | yes | `String` |

> aliases: $generateBar

## Signature

```fs
$bar[current;max;length;fill;empty;trunc;fillStart;fillEnd;emptyStart;emptyEnd]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `current` | `Number` | **yes** | no | The current value |
| 2 | `max` | `Number` | **yes** | no | The max value of current |
| 3 | `length` | `Number` | no | no | The length of the bar |
| 4 | `fill` | `String` | no | no | The string to use as filled points of the bar |
| 5 | `empty` | `String` | no | no | The string to use as empty points of the bar |
| 6 | `trunc` | `Boolean` | no | no | Whether to truncate instead of round |
| 7 | `fillStart` | `String` | no | no | The string to use as filled start of the bar |
| 8 | `fillEnd` | `String` | no | no | The string to use as filled end of the bar |
| 9 | `emptyStart` | `String` | no | no | The string to use as empty start of the bar |
| 10 | `emptyEnd` | `String` | no | no | The string to use as empty end of the bar |

### Per-parameter notes

- **`current`** (`Number`, required): The current value. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`max`** (`Number`, required): The max value of current. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`length`** (`Number`, optional): The length of the bar. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`fill`** (`String`, optional): The string to use as filled points of the bar. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`empty`** (`String`, optional): The string to use as empty points of the bar. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`trunc`** (`Boolean`, optional): Whether to truncate instead of round. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`fillStart`** (`String`, optional): The string to use as filled start of the bar. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`fillEnd`** (`String`, optional): The string to use as filled end of the bar. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`emptyStart`** (`String`, optional): The string to use as empty start of the bar. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`emptyEnd`** (`String`, optional): The string to use as empty end of the bar. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Uncategorized utilities.

`$bar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$bar[5;5]
```

**Full form (all arguments)**

```fs
$bar[5;5;5;value;value;true;value;value;value;value]
```

## Reference implementation (source)

Taken from `src/native/other/bar.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            generateBar(
                curr,
                max,
                len ?? undefined,
                fill ?? undefined,
                empty ?? undefined,
                !trunc,
                fillStart || undefined,
                fillEnd || undefined,
                emptyStart || undefined,
                emptyEnd || undefined
            )
        )
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$generateBar` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`length`, `fill`, `empty`, `trunc`, `fillStart`, `fillEnd`, `emptyStart`, `emptyEnd`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedBar`]($advancedBar.md)
- [`$awaitComponent`]($awaitComponent.md)
- [`$awaitMessage`]($awaitMessage.md)
- [`$awaitModalSubmit`]($awaitModalSubmit.md)
- [`$c`]($c.md)
- [`$callFunction`]($callFunction.md)
- [`$callLocalFunction`]($callLocalFunction.md)
- [`$debug`]($debug.md)

**Source:** [`src/native/other/bar.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/other/bar.ts)

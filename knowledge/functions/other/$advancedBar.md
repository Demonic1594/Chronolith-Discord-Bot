# $advancedBar

> Generates an advanced progress bar

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `other` | v1.5.0 | required | yes | `String` |

> aliases: $generateAdvancedBar

## Signature

```fs
$advancedBar[current;max;length;values]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `current` | `Number` | **yes** | no | The current value |
| 2 | `max` | `Number` | **yes** | no | The max value of current |
| 3 | `length` | `Number` | no | no | The length of the bar |
| 4 | `values` | `String` | **yes** | yes | The values to make the bar with, for example `=;~;#` means `0%;33%;66%` |

### Per-parameter notes

- **`current`** (`Number`, required): The current value. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`max`** (`Number`, required): The max value of current. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`length`** (`Number`, optional): The length of the bar. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`values`** (`String` , rest, required): The values to make the bar with, for example `=;~;#` means `0%;33%;66%`. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Uncategorized utilities.

`$advancedBar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `values` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$advancedBar[5;5;5]
```

**Full form (all arguments)**

```fs
$advancedBar[5;5;5;value]
```

## Reference implementation (source)

Taken from `src/native/other/advancedBar.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            generateAdvancedBar(
                curr,
                max,
                len || undefined,
                values
            )
        )
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$generateAdvancedBar` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`length`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$awaitComponent`]($awaitComponent.md)
- [`$awaitMessage`]($awaitMessage.md)
- [`$awaitModalSubmit`]($awaitModalSubmit.md)
- [`$bar`]($bar.md)
- [`$c`]($c.md)
- [`$callFunction`]($callFunction.md)
- [`$callLocalFunction`]($callLocalFunction.md)
- [`$debug`]($debug.md)

**Source:** [`src/native/other/advancedBar.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/other/advancedBar.ts)

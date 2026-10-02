# $inRange

> Returns whether a number is in range

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `number` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$inRange[number;min;max]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `number` | `Number` | **yes** | no | The number to validate |
| 2 | `min` | `Number` | no | no | The min value |
| 3 | `max` | `Number` | no | no | The max value |

### Per-parameter notes

- **`number`** (`Number`, required): The number to validate. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`min`** (`Number`, optional): The min value. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`max`** (`Number`, optional): The max value. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Number functions format and round numeric values.

`$inRange` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$inRange[5]
```

**Full form (all arguments)**

```fs
$inRange[5;5;5]
```

## Reference implementation (source)

Taken from `src/native/number/inRange.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(min === null || max === null ? false : Math.max(min, n) === Math.min(max, n))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`min`, `max`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$abbreviateNumber`]($abbreviateNumber.md)
- [`$average`]($average.md)
- [`$hexToInt`]($hexToInt.md)
- [`$intToHex`]($intToHex.md)
- [`$isFloat`]($isFloat.md)
- [`$isInteger`]($isInteger.md)
- [`$isNumber`]($isNumber.md)
- [`$maxSafeInteger`]($maxSafeInteger.md)

**Source:** [`src/native/number/inRange.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/number/inRange.ts)

# $clamp

> Clamps the value to the specified range

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| Edge | `math` | v1.0.0 | required | yes | `Number` |

## Signature

```fs
$clamp[value;min;max]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `value` | `Number` | **yes** | no | Value to clamp |
| 2 | `min` | `Number` | **yes** | no | Minimum value |
| 3 | `max` | `Number` | **yes** | no | Maximum value |

### Per-parameter notes

- **`value`** (`Number`, required): Value to clamp. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`min`** (`Number`, required): Minimum value. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`max`** (`Number`, required): Maximum value. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Math functions evaluate arithmetic expressions and apply numeric operations.

`$clamp` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$clamp[5;5;5]
```

## Reference implementation (source)

Taken from `src/functions/math/clamp.ts` in the `Edge` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(Math.max(min, Math.min(max, value)));
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$factorial`]($factorial.md)
- [`$gcd`]($gcd.md)
- [`$lcm`]($lcm.md)
- [`$lerp`]($lerp.md)

**Source:** [`src/functions/math/clamp.ts`](https://github.com/nationdex/edge/blob/main/src/functions/math/clamp.ts)

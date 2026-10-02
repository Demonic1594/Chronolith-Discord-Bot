# $lcm

> Calculates the least common multiple of two numbers

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| Edge | `math` | v1.0.0 | required | yes | `Number` |

## Signature

```fs
$lcm[first;second]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `first` | `Number` | **yes** | no | First number |
| 2 | `second` | `Number` | **yes** | no | Second number |

### Per-parameter notes

- **`first`** (`Number`, required): First number. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`second`** (`Number`, required): Second number. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Math functions evaluate arithmetic expressions and apply numeric operations.

`$lcm` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$lcm[5;5]
```

## Reference implementation (source)

Taken from `src/functions/math/lcm.ts` in the `Edge` repository — this is exactly what runs:

```ts
execute(...) {
        let a = Math.abs(first);
        let b = Math.abs(second);
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return this.success(Math.abs(first * second) / a);
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$clamp`]($clamp.md)
- [`$factorial`]($factorial.md)
- [`$gcd`]($gcd.md)
- [`$lerp`]($lerp.md)

**Source:** [`src/functions/math/lcm.ts`](https://github.com/nationdex/edge/blob/main/src/functions/math/lcm.ts)

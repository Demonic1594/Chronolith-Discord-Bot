# $factorial

> Calculates the factorial of a number

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| Edge | `math` | v1.0.0 | required | yes | `Number` |

## Signature

```fs
$factorial[number]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `number` | `Number` | **yes** | no | Number to calculate factorial |

### Per-parameter notes

- **`number`** (`Number`, required): Number to calculate factorial. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Math functions evaluate arithmetic expressions and apply numeric operations.

`$factorial` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$factorial[5]
```

## Reference implementation (source)

Taken from `src/functions/math/factorial.ts` in the `Edge` repository — this is exactly what runs:

```ts
execute(...) {
        let result = 1;
        for (let i = 2; i <= number; i++) result *= i;
        return this.success(result);
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$clamp`]($clamp.md)
- [`$gcd`]($gcd.md)
- [`$lcm`]($lcm.md)
- [`$lerp`]($lerp.md)

**Source:** [`src/functions/math/factorial.ts`](https://github.com/nationdex/edge/blob/main/src/functions/math/factorial.ts)

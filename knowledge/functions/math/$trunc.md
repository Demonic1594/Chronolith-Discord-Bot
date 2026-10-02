# $trunc

> Returns the integer part of the a numeric expression, x, removing any fractional digits. If x is already an integer, the result is x

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `math` | v1.0.0 | required | yes | `Number` |

> aliases: $truncate

## Signature

```fs
$trunc[number]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `number` | `Number` | **yes** | no | The number to use |

### Per-parameter notes

- **`number`** (`Number`, required): The number to use. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Math functions evaluate arithmetic expressions and apply numeric operations.

`$trunc` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$trunc[5]
```

## Reference implementation (source)

Taken from `src/native/math/trunc.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(Math.trunc(n))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$truncate` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$abs`]($abs.md)
- [`$base`]($base.md)
- [`$bigintDivide`]($bigintDivide.md)
- [`$bigintMulti`]($bigintMulti.md)
- [`$bigintSub`]($bigintSub.md)
- [`$bigintSum`]($bigintSum.md)
- [`$ceil`]($ceil.md)
- [`$divide`]($divide.md)

**Source:** [`src/native/math/trunc.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/math/trunc.ts)

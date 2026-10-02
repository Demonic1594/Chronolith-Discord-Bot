# $bigintSum

> Adds multiple numbers

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `math` | v1.3.0 | required | yes | `BigInt` |

## Signature

```fs
$bigintSum[numbers]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `numbers` | `BigInt` | **yes** | yes | Numbers to add |

### Per-parameter notes

- **`numbers`** (`BigInt` , rest, required): Numbers to add. Expects a very large integer. Coerced with JS `BigInt()` — must be an integer literal like `123456789012345678n` or `123456789012345678`.

## How it works

Math functions evaluate arithmetic expressions and apply numeric operations.

`$bigintSum` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `numbers` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$bigintSum[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/math/bigintSum.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(numbers.reduce((x, y) => x + y))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$abs`]($abs.md)
- [`$base`]($base.md)
- [`$bigintDivide`]($bigintDivide.md)
- [`$bigintMulti`]($bigintMulti.md)
- [`$bigintSub`]($bigintSub.md)
- [`$ceil`]($ceil.md)
- [`$divide`]($divide.md)
- [`$floor`]($floor.md)

**Source:** [`src/native/math/bigintSum.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/math/bigintSum.ts)

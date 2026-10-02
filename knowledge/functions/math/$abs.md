# $abs

> Returns the absolute value of a number (the value without regard to whether it is positive or negative)

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `math` | v1.0.1 | required | yes | `Number` |

## Signature

```fs
$abs[number]
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

`$abs` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$abs[5]
```

## Reference implementation (source)

Taken from `src/native/math/abs.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(Math.abs(n))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$base`]($base.md)
- [`$bigintDivide`]($bigintDivide.md)
- [`$bigintMulti`]($bigintMulti.md)
- [`$bigintSub`]($bigintSub.md)
- [`$bigintSum`]($bigintSum.md)
- [`$ceil`]($ceil.md)
- [`$divide`]($divide.md)
- [`$floor`]($floor.md)

## Community guides covering this function

- [$abs guide](../../guides/guide-224.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-224)

**Source:** [`src/native/math/abs.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/math/abs.ts)

# $modulo

> Returns the remainder of multiple numbers

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `math` | v1.0.0 | required | yes | `Number` |

## Signature

```fs
$modulo[numbers]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `numbers` | `Number` | **yes** | yes | Numbers to get their remainders |

### Per-parameter notes

- **`numbers`** (`Number` , rest, required): Numbers to get their remainders. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Math functions evaluate arithmetic expressions and apply numeric operations.

`$modulo` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `numbers` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$modulo[5]
```

## Reference implementation (source)

Taken from `src/native/math/modulo.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(numbers.reduce((x, y) => x % y))
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
- [`$bigintSum`]($bigintSum.md)
- [`$ceil`]($ceil.md)
- [`$divide`]($divide.md)

## Community guides covering this function

- [$modulo guide](../../guides/guide-103.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-103)

**Source:** [`src/native/math/modulo.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/math/modulo.ts)

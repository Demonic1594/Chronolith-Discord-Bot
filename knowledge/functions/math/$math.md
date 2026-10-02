# $math

> Runs math expression, returns nothing if incorrect expression

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `math` | v1.0.0 | required | yes | `Number` |

## Signature

```fs
$math[expr]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `expr` | `String` | **yes** | no | The math expression to run |

### Per-parameter notes

- **`expr`** (`String`, required): The math expression to run. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Math functions evaluate arithmetic expressions and apply numeric operations.

`$math` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$math[value]
```

## Reference implementation (source)

Taken from `src/native/math/math.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        try {
            if (MathRegex.test(expr)) return this.success()
            return this.success(eval(expr))
        } catch (error: any) {
            return this.success()
        }
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

- [$math guide](../../guides/guide-104.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-104)

**Source:** [`src/native/math/math.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/math/math.ts)

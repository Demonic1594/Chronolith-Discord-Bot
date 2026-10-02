# $round

> Rounds provided number to a certain number of decimal places

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `math` | v1.0.0 | required | yes | `Number` |

## Signature

```fs
$round[number;decimal places]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `number` | `Number` | **yes** | no | The number to use |
| 2 | `decimal places` | `Number` | no | no | The number of decimal places to round to |

### Per-parameter notes

- **`number`** (`Number`, required): The number to use. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`decimal places`** (`Number`, optional): The number of decimal places to round to. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Math functions evaluate arithmetic expressions and apply numeric operations.

`$round` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$round[5]
```

**Full form (all arguments)**

```fs
$round[5;5]
```

## Reference implementation (source)

Taken from `src/native/math/round.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        dp = dp === null ? 1 : Math.pow(10, dp)
        return this.success(Math.round(n * dp) / dp)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`decimal places`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

## Community guides covering this function

- [$round guide](../../guides/guide-110.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-110)

**Source:** [`src/native/math/round.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/math/round.ts)

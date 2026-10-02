# $base

> Convert number from one base to another

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `math` | v1.1.0 | required | yes | `Number` |

## Signature

```fs
$base[number;to;from]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `number` | `String` | **yes** | no | The target number for conversion |
| 2 | `to` | `Number` | **yes** | no | The target base |
| 3 | `from` | `Number` | no | no | The source base |

### Per-parameter notes

- **`number`** (`String`, required): The target number for conversion. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`to`** (`Number`, required): The target base. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`from`** (`Number`, optional): The source base. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Math functions evaluate arithmetic expressions and apply numeric operations.

`$base` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$base[value;5]
```

**Full form (all arguments)**

```fs
$base[value;5;5]
```

## Reference implementation (source)

Taken from `src/native/math/base.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(parseInt(n, from ?? 10).toString(to))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`from`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$abs`]($abs.md)
- [`$bigintDivide`]($bigintDivide.md)
- [`$bigintMulti`]($bigintMulti.md)
- [`$bigintSub`]($bigintSub.md)
- [`$bigintSum`]($bigintSum.md)
- [`$ceil`]($ceil.md)
- [`$divide`]($divide.md)
- [`$floor`]($floor.md)

## Community guides covering this function

- [$base guide](../../guides/guide-225.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-225)

**Source:** [`src/native/math/base.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/math/base.ts)

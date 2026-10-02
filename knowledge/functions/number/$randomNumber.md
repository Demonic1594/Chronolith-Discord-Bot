# $randomNumber

> Returns a random number (no cache)

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `number` | v1.0.0 | required | yes | `Number` |

## Signature

```fs
$randomNumber[min;max;decimals]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `min` | `Number` | **yes** | no | The minimum possible number |
| 2 | `max` | `Number` | no | no | The max possible number |
| 3 | `decimals` | `Boolean` | no | no | Whether to use decimals |

### Per-parameter notes

- **`min`** (`Number`, required): The minimum possible number. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`max`** (`Number`, optional): The max possible number. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`decimals`** (`Boolean`, optional): Whether to use decimals. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Number functions format and round numeric values.

`$randomNumber` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$randomNumber[5]
```

**Full form (all arguments)**

```fs
$randomNumber[5;5;true]
```

## Reference implementation (source)

Taken from `src/native/number/randomNumber.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const rnd = max ? Math.random() * (max - min) + min : Math.random() * min
        return this.success(!decimals ? Math.floor(rnd) : rnd)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`max`, `decimals`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$abbreviateNumber`]($abbreviateNumber.md)
- [`$average`]($average.md)
- [`$hexToInt`]($hexToInt.md)
- [`$inRange`]($inRange.md)
- [`$intToHex`]($intToHex.md)
- [`$isFloat`]($isFloat.md)
- [`$isInteger`]($isInteger.md)
- [`$isNumber`]($isNumber.md)

## Community guides covering this function

- [$randomNumber guide](../../guides/guide-153.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-153)

**Source:** [`src/native/number/randomNumber.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/number/randomNumber.ts)

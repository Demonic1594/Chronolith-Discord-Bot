# $abbreviateNumber

> Abbreviates given number

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `number` | v1.0.0 | required | yes | `String` |

## Signature

```fs
$abbreviateNumber[number]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `number` | `Number` | **yes** | no | The number to abbreviate |

### Per-parameter notes

- **`number`** (`Number`, required): The number to abbreviate. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Number functions format and round numeric values.

`$abbreviateNumber` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$abbreviateNumber[5]
```

## Reference implementation (source)

Taken from `src/native/number/abbreviateNumber.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(Formatter.format(n))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$average`]($average.md)
- [`$hexToInt`]($hexToInt.md)
- [`$inRange`]($inRange.md)
- [`$intToHex`]($intToHex.md)
- [`$isFloat`]($isFloat.md)
- [`$isInteger`]($isInteger.md)
- [`$isNumber`]($isNumber.md)
- [`$maxSafeInteger`]($maxSafeInteger.md)

**Source:** [`src/native/number/abbreviateNumber.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/number/abbreviateNumber.ts)

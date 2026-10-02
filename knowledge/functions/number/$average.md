# $average

> Calculates the average of given numbers

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `number` | v1.5.0 | required | yes | — |

## Signature

```fs
$average[separator;values]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `separator` | `String` | **yes** | no | The delimiter of each value |
| 2 | `values` | `String` | **yes** | no | Values separated by `separator` |

### Per-parameter notes

- **`separator`** (`String`, required): The delimiter of each value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`values`** (`String`, required): Values separated by `separator`. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Number functions format and round numeric values.

`$average` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$average[,;value]
```

## Reference implementation (source)

Taken from `src/native/number/average.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const n = values.split(sep).map(Number)
        return this.success(
            n.reduce((x, y) => x + y, 0) / n.length
        )
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$abbreviateNumber`]($abbreviateNumber.md)
- [`$hexToInt`]($hexToInt.md)
- [`$inRange`]($inRange.md)
- [`$intToHex`]($intToHex.md)
- [`$isFloat`]($isFloat.md)
- [`$isInteger`]($isInteger.md)
- [`$isNumber`]($isNumber.md)
- [`$maxSafeInteger`]($maxSafeInteger.md)

**Source:** [`src/native/number/average.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/number/average.ts)

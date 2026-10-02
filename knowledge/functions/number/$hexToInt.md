# $hexToInt

> Turns hex string to number

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `number` | v1.2.0 | required | yes | `Color` |

## Signature

```fs
$hexToInt[hex]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `hex` | `String` | **yes** | no | The hex to convert |

### Per-parameter notes

- **`hex`** (`String`, required): The hex to convert. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Number functions format and round numeric values.

`$hexToInt` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$hexToInt[value]
```

## Reference implementation (source)

Taken from `src/native/number/hexToInt.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(hex2int(hex))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$abbreviateNumber`]($abbreviateNumber.md)
- [`$average`]($average.md)
- [`$inRange`]($inRange.md)
- [`$intToHex`]($intToHex.md)
- [`$isFloat`]($isFloat.md)
- [`$isInteger`]($isInteger.md)
- [`$isNumber`]($isNumber.md)
- [`$maxSafeInteger`]($maxSafeInteger.md)

**Source:** [`src/native/number/hexToInt.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/number/hexToInt.ts)

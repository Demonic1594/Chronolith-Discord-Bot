# $isInteger

> Returns whether the number is an integer

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `number` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$isInteger[number]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `number` | `String` | **yes** | no | The number to check |

### Per-parameter notes

- **`number`** (`String`, required): The number to check. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Number functions format and round numeric values.

`$isInteger` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$isInteger[value]
```

## Reference implementation (source)

Taken from `src/native/number/isInteger.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(!!n && !isNaN(Number(n)) && isInteger(Number(n)))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$abbreviateNumber`]($abbreviateNumber.md)
- [`$average`]($average.md)
- [`$hexToInt`]($hexToInt.md)
- [`$inRange`]($inRange.md)
- [`$intToHex`]($intToHex.md)
- [`$isFloat`]($isFloat.md)
- [`$isNumber`]($isNumber.md)
- [`$maxSafeInteger`]($maxSafeInteger.md)

**Source:** [`src/native/number/isInteger.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/number/isInteger.ts)

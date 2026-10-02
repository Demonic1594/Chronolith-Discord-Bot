# $maxSafeInteger

> Returns the highest safe integer

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `number` | v1.0.6 | none | no | `Number` |

## Signature

```fs
$maxSafeInteger
```

## How it works

Number functions format and round numeric values.

`$maxSafeInteger` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$maxSafeInteger
```

## Reference implementation (source)

Taken from `src/native/number/maxSafeInteger.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(Number.MAX_SAFE_INTEGER)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$abbreviateNumber`]($abbreviateNumber.md)
- [`$average`]($average.md)
- [`$hexToInt`]($hexToInt.md)
- [`$inRange`]($inRange.md)
- [`$intToHex`]($intToHex.md)
- [`$isFloat`]($isFloat.md)
- [`$isInteger`]($isInteger.md)
- [`$isNumber`]($isNumber.md)

**Source:** [`src/native/number/maxSafeInteger.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/number/maxSafeInteger.ts)

# $isValidHex

> Checks whether given hex is a valid integer number between 0x00000 and 0xffffff

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `condition` | v1.3.0 | required | yes | `Boolean` |

## Signature

```fs
$isValidHex[hex]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `hex` | `String` | **yes** | no | The hex to check for |

### Per-parameter notes

- **`hex`** (`String`, required): The hex to check for. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Condition helpers (`$checkCondition`, `$and`, `$or`, validators) evaluate boolean logic over resolved values.

`$isValidHex` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$isValidHex[value]
```

## Reference implementation (source)

Taken from `src/native/condition/isValidHex.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const int = parseInt(hex.replace(HexHashtagStripping, ""), 16)
        return this.success(!isNaN(int) && int >= MinHexIntValue && int <= MaxHexIntValue)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$and`]($and.md)
- [`$checkCondition`]($checkCondition.md)
- [`$isBoolean`]($isBoolean.md)
- [`$isValidLink`]($isValidLink.md)
- [`$or`]($or.md)

**Source:** [`src/native/condition/isValidHex.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/condition/isValidHex.ts)

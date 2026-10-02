# $isBoolean

> Checks whether given value is bool like

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `condition` | v1.0.6 | required | yes | `Boolean` |

> aliases: $isBool

## Signature

```fs
$isBoolean[value]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `value` | `String` | **yes** | no | Value to check if its a valid bool |

### Per-parameter notes

- **`value`** (`String`, required): Value to check if its a valid bool. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Condition helpers (`$checkCondition`, `$and`, `$or`, validators) evaluate boolean logic over resolved values.

`$isBoolean` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$isBoolean[value]
```

## Reference implementation (source)

Taken from `src/native/condition/isBoolean.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(v === "true" || v === "false")
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$isBool` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$and`]($and.md)
- [`$checkCondition`]($checkCondition.md)
- [`$isValidHex`]($isValidHex.md)
- [`$isValidLink`]($isValidLink.md)
- [`$or`]($or.md)

**Source:** [`src/native/condition/isBoolean.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/condition/isBoolean.ts)

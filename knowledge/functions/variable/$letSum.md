# $letSum

> Short-hand for $let[...;$sum[$get[...];...]]

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `variable` | v1.3.0 | required | yes | — |

## Signature

```fs
$letSum[key;value]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `key` | `String` | **yes** | no | The key name |
| 2 | `value` | `Number` | **yes** | no | The value to sum with |

### Per-parameter notes

- **`key`** (`String`, required): The key name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`value`** (`Number`, required): The value to sum with. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Variable functions manage the interpreter's TWO variable stores: `$let` writes the **keywords** store and `$get` reads it; `$env` reads the separate **environment** store (custom-fn params, `$jsonLoad`, `$try` errors, `$loop` counters, `$httpRequest` responses) and walks nested paths; `$has` checks existence. `$let[x;v]$env[x]` is empty — never cross the stores.

`$letSum` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$letSum[value;5]
```

## Reference implementation (source)

Taken from `src/native/variable/letSum.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.setKeyword(key, Number(ctx.getKeyword(key)) + value)
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$delete`]($delete.md)
- [`$env`]($env.md)
- [`$get`]($get.md)
- [`$has`]($has.md)
- [`$let`]($let.md)
- [`$letDivide`]($letDivide.md)
- [`$letMulti`]($letMulti.md)
- [`$letSub`]($letSub.md)

**Source:** [`src/native/variable/letSum.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/variable/letSum.ts)

# $varBanao

> Create a keyword

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `variable` | v1.0.0 | required | yes | — |

> aliases: $rakho, $variableSetKaro

## Signature

```fs
$varBanao[key;value]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `key` | `String` | **yes** | no | The key name |
| 2 | `value` | `String` | **yes** | no | The key value |

### Per-parameter notes

- **`key`** (`String`, required): The key name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`value`** (`String`, required): The key value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Variable functions manage the interpreter's TWO variable stores: `$let` writes the **keywords** store and `$get` reads it; `$env` reads the separate **environment** store (custom-fn params, `$jsonLoad`, `$try` errors, `$loop` counters, `$httpRequest` responses) and walks nested paths; `$has` checks existence. `$let[x;v]$env[x]` is empty — never cross the stores.

`$varBanao` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$varBanao[value;value]
```

## Quirks & gotchas

1. Callable by its aliases too: `$rakho`, `$variableSetKaro` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$varLo`]($varLo.md)

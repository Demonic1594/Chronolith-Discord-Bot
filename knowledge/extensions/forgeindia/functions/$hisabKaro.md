# $hisabKaro

> Runs math expression, returns nothing if incorrect expression

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `math` | v1.0.0 | required | yes | `Number` |

> aliases: $calculateKaro, $ganitKaro, $mathKaro

## Signature

```fs
$hisabKaro[expr]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `expr` | `String` | **yes** | no | The math expression to run |

### Per-parameter notes

- **`expr`** (`String`, required): The math expression to run. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Math functions evaluate arithmetic expressions and apply numeric operations.

`$hisabKaro` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$hisabKaro[value]
```

## Quirks & gotchas

1. Callable by its aliases too: `$calculateKaro`, `$ganitKaro`, `$mathKaro` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$bato`]($bato.md)
- [`$gunaKaro`]($gunaKaro.md)
- [`$ghatao`]($ghatao.md)
- [`$jod`]($jod.md)

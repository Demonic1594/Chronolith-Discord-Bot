# $warnaAgar

> Creates an else if statement

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `statement` | v1.2.0 | required | no | `Unknown` |

> aliases: $phirAgar

## Signature

```fs
$warnaAgar[condition;if true]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `condition` | `String` | no | no | The condition to check against |
| 2 | `if true` | `String` | **yes** | no | The code to run if true |

### Per-parameter notes

- **`condition`** (`String`, optional): The condition to check against. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
  - Condition argument: supports the operators `==`, `!=`, `<`, `<=`, `>`, `>=`. Without an operator, the left side is checked for equality against the string `"true"`.
- **`if true`** (`String`, required): The code to run if true. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Statement functions are control flow: `$if`/`$else`/`$elseIf`, `$ifx` blocks, `$while`, `$loop`, `$switch`/`$case`/`$default`, `$try`, `$scope`, `$async`. With `unwrap: false` their code arguments are passed as raw text and compiled/ran lazily — this is why you can put `;`-separated multi-statement code inside them.

`$warnaAgar` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$warnaAgar[value]
```

**Full form (all arguments)**

```fs
$warnaAgar[value;value]
```

## Quirks & gotchas

1. Callable by its aliases too: `$phirAgar` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
4. Optional arguments (`condition`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
5. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
6. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
7. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$varna`]($varna.md)
- [`$agar`]($agar.md)
- [`$ghumao`]($ghumao.md)
- [`$koshishKaro`]($koshishKaro.md)
- [`$jabTak`]($jabTak.md)

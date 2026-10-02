# $koshishKaro

> Handles a possible error from given code

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `statement` | v1.0.0 | required | no | — |

> aliases: $tryKaro

## Signature

```fs
$koshishKaro[code;catch code;variable]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `code` | `String` | **yes** | no | The code to safely execute |
| 2 | `catch code` | `String` | no | no | The code to run in case of an error |
| 3 | `variable` | `String` | no | no | Variable to load the error message to |

### Per-parameter notes

- **`code`** (`String`, required): The code to safely execute. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`catch code`** (`String`, optional): The code to run in case of an error. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`variable`** (`String`, optional): Variable to load the error message to. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Statement functions are control flow: `$if`/`$else`/`$elseIf`, `$ifx` blocks, `$while`, `$loop`, `$switch`/`$case`/`$default`, `$try`, `$scope`, `$async`. With `unwrap: false` their code arguments are passed as raw text and compiled/ran lazily — this is why you can put `;`-separated multi-statement code inside them.

`$koshishKaro` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$koshishKaro[code]
```

**Full form (all arguments)**

```fs
$koshishKaro[code;code;value]
```

## Quirks & gotchas

1. Callable by its aliases too: `$tryKaro` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
4. Optional arguments (`catch code`, `variable`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$varna`]($varna.md)
- [`$warnaAgar`]($warnaAgar.md)
- [`$agar`]($agar.md)
- [`$ghumao`]($ghumao.md)
- [`$jabTak`]($jabTak.md)

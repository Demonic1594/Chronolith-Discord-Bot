# $ghumao

> Executes given code for N times

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `statement` | v1.4.0 | required | no | — |

> aliases: $barbarChalao, $loopLagao

## Signature

```fs
$ghumao[times;code;variable;desc]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `times` | `Number` | **yes** | no | How many times to run the code |
| 2 | `code` | `String` | **yes** | no | The code to execute |
| 3 | `variable` | `String` | no | no | The variable to load the current iteration count for $env |
| 4 | `desc` | `Boolean` | no | no | Whether to use desc order for iteration count |

### Per-parameter notes

- **`times`** (`Number`, required): How many times to run the code. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`code`** (`String`, required): The code to execute. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`variable`** (`String`, optional): The variable to load the current iteration count for $env. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`desc`** (`Boolean`, optional): Whether to use desc order for iteration count. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Statement functions are control flow: `$if`/`$else`/`$elseIf`, `$ifx` blocks, `$while`, `$loop`, `$switch`/`$case`/`$default`, `$try`, `$scope`, `$async`. With `unwrap: false` their code arguments are passed as raw text and compiled/ran lazily — this is why you can put `;`-separated multi-statement code inside them.

`$ghumao` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$ghumao[5;code]
```

**Full form (all arguments)**

```fs
$ghumao[5;code;value;true]
```

## Quirks & gotchas

1. Callable by its aliases too: `$barbarChalao`, `$loopLagao` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
4. Optional arguments (`variable`, `desc`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
5. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
6. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
7. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$varna`]($varna.md)
- [`$warnaAgar`]($warnaAgar.md)
- [`$agar`]($agar.md)
- [`$koshishKaro`]($koshishKaro.md)
- [`$jabTak`]($jabTak.md)

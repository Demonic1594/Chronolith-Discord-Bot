# $sirfAgar

> Stop execution if condition is not matched

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `limiter` | v1.0.0 | required | no | — |

> aliases: $basTabhi, $tabhiChalega

## Signature

```fs
$sirfAgar[condition;code]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `condition` | `String` | **yes** | no | The condition to use |
| 2 | `code` | `String` | no | no | The code to execute if error |

### Per-parameter notes

- **`condition`** (`String`, required): The condition to use. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
  - Condition argument: supports the operators `==`, `!=`, `<`, `<=`, `>`, `>=`. Without an operator, the left side is checked for equality against the string `"true"`.
- **`code`** (`String`, optional): The code to execute if error. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Limiter functions restrict execution (`$onlyIf`, `$onlyForUsers`, `$onlyForRoles`, ...) and early-exit a command via `$stop`.

`$sirfAgar` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$sirfAgar[value]
```

**Full form (all arguments)**

```fs
$sirfAgar[value;code]
```

## Quirks & gotchas

1. Callable by its aliases too: `$basTabhi`, `$tabhiChalega` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
4. Optional arguments (`code`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$yeChannelsHi`]($yeChannelsHi.md)
- [`$yeUsersHi`]($yeUsersHi.md)
- [`$rukJao`]($rukJao.md)

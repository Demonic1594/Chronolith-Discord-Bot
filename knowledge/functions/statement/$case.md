# $case

> Adds a switch case

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `statement` | v1.0.3 | required | yes | `Unknown` |

> ⚠️ **experimental**

## Signature

```fs
$case[value;code]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `value` | `String` | **yes** | no | The match case |
| 2 | `code` | `String` | **yes** | no | Code to execute if it matches this case |

### Per-parameter notes

- **`value`** (`String`, required): The match case. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`code`** (`String`, required): Code to execute if it matches this case. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Statement functions are control flow: `$if`/`$else`/`$elseIf`, `$ifx` blocks, `$while`, `$loop`, `$switch`/`$case`/`$default`, `$try`, `$scope`, `$async`. With `unwrap: false` their code arguments are passed as raw text and compiled/ran lazily — this is why you can put `;`-separated multi-statement code inside them.

`$case` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$case[value;code]
```

## Reference implementation (source)

Taken from `src/native/statement/case.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(code)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Marked **experimental** in source — behavior may change without a major version bump.
3. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$async`]($async.md)
- [`$break`]($break.md)
- [`$continue`]($continue.md)
- [`$default`]($default.md)
- [`$else`]($else.md)
- [`$elseIf`]($elseIf.md)
- [`$if`]($if.md)
- [`$ifx`]($ifx.md)

**Source:** [`src/native/statement/case.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/statement/case.ts)

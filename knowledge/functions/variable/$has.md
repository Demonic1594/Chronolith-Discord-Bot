# $has

> Checks whether a keyword exists

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `variable` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$has[name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the keyword |

### Per-parameter notes

- **`name`** (`String`, required): The name of the keyword. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Variable functions manage the interpreter's TWO variable stores: `$let` writes the **keywords** store and `$get` reads it; `$env` reads the separate **environment** store (custom-fn params, `$jsonLoad`, `$try` errors, `$loop` counters, `$httpRequest` responses) and walks nested paths; `$has` checks existence. `$let[x;v]$env[x]` is empty — never cross the stores.

`$has` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$has[name]
```

## Reference implementation (source)

Taken from `src/native/variable/has.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.hasKeyword(name))
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
- [`$let`]($let.md)
- [`$letDivide`]($letDivide.md)
- [`$letMulti`]($letMulti.md)
- [`$letSub`]($letSub.md)
- [`$letSum`]($letSum.md)

**Source:** [`src/native/variable/has.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/variable/has.ts)

# $let

> Create a keyword

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `variable` | v1.0.0 | required | yes | — |

## Signature

```fs
$let[key;value]
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

`$let` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Store an array**

```fs
$let[myArray;apple;banana;cherry]
```

**Store a computed value**

```fs
$let[total;$sum[2;3]]
```

**Read it back**

```fs
$get[myArray]
```

## Reference implementation (source)

Taken from `src/native/variable/let.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.setKeyword(name, args)
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
- [`$letDivide`]($letDivide.md)
- [`$letMulti`]($letMulti.md)
- [`$letSub`]($letSub.md)
- [`$letSum`]($letSum.md)

## Community guides covering this function

- [$let guide](../../guides/guide-170.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-170)

**Source:** [`src/native/variable/let.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/variable/let.ts)

# $getCache

> Retrieves and loads data from the cache by variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| Edge | `cache` | v1.0.0 | required | yes | `Unknown` |

## Signature

```fs
$getCache[table;name;variable]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `table` | `String` | **yes** | no | The table name |
| 2 | `name` | `String` | **yes** | no | Variable name |
| 3 | `variable` | `String` | no | no | Environment variable name |

### Per-parameter notes

- **`table`** (`String`, required): The table name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`name`** (`String`, required): Variable name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`variable`** (`String`, optional): Environment variable name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$getCache` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getCache[value;name]
```

**Full form (all arguments)**

```fs
$getCache[value;name;value]
```

## Reference implementation (source)

Taken from `src/functions/cache/getCache.ts` in the `Edge` repository — this is exactly what runs:

```ts
execute(...) {
        const value = caches.get(table)!.get(name);
        if (variable) {
            ctx.setEnvironmentKey(variable, value);
            return this.success();
        }
        return this.successJSON(value as any);
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`variable`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$clearCache`]($clearCache.md)
- [`$deleteCache`]($deleteCache.md)
- [`$exportCache`]($exportCache.md)
- [`$hasCache`]($hasCache.md)
- [`$importCache`]($importCache.md)
- [`$keysCache`]($keysCache.md)
- [`$rangeCache`]($rangeCache.md)
- [`$setCache`]($setCache.md)

**Source:** [`src/functions/cache/getCache.ts`](https://github.com/nationdex/edge/blob/main/src/functions/cache/getCache.ts)

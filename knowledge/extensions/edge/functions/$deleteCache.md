# $deleteCache

> Deletes data from the cache by variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| Edge | `cache` | v1.0.0 | required | yes | — |

## Signature

```fs
$deleteCache[table;name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `table` | `String` | **yes** | no | The table name |
| 2 | `name` | `String` | **yes** | no | Variable name |

### Per-parameter notes

- **`table`** (`String`, required): The table name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`name`** (`String`, required): Variable name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$deleteCache` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteCache[value;name]
```

## Reference implementation (source)

Taken from `src/functions/cache/deleteCache.ts` in the `Edge` repository — this is exactly what runs:

```ts
execute(...) {
        caches.get(table)!.delete(name);
        return this.success();
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$clearCache`]($clearCache.md)
- [`$exportCache`]($exportCache.md)
- [`$getCache`]($getCache.md)
- [`$hasCache`]($hasCache.md)
- [`$importCache`]($importCache.md)
- [`$keysCache`]($keysCache.md)
- [`$rangeCache`]($rangeCache.md)
- [`$setCache`]($setCache.md)

**Source:** [`src/functions/cache/deleteCache.ts`](https://github.com/nationdex/edge/blob/main/src/functions/cache/deleteCache.ts)

# $dbPing

> Returns the database ping.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `advanced` | v2.0.9 | optional | yes | `String` |

> aliases: $dbLatency

## Signature

```fs
$dbPing[full]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `full` | `Boolean` | no | no | This will return the max decimals |

### Per-parameter notes

- **`full`** (`Boolean`, optional): This will return the max decimals. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

See the function list below for exact signatures.

`$dbPing` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$dbPing[true]
```

## Reference implementation (source)

Taken from `src/functions/advanced/dbPing.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        const start = performance.now()
        await DataBase.query("SELECT 1")
        const end = performance.now()
        let res = end - start
        if (!full) res = Number(res.toFixed(2))
        return this.success(res)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$dbLatency` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`full`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteRecords`]($deleteRecords.md)
- [`$getDB`]($getDB.md)
- [`$searchDB`]($searchDB.md)
- [`$wipeDB`]($wipeDB.md)

**Source:** [`src/functions/advanced/dbPing.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/advanced/dbPing.ts)

# $wipeDB

> Deletes one or more databases

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| QuorielDB | `db` | v2.0.0 | required | yes | — |

## Signature

```fs
$wipeDB[type]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `type` | `String` | **yes** | yes | Data type(s) |

### Per-parameter notes

- **`type`** (`String` , rest, required): Data type(s). Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$wipeDB` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `type` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$wipeDB[value]
```

## Reference implementation (source)

Taken from `src/functions/db/wipeDB.js` in the `QuorielDB` repository — this is exactly what runs:

```ts
execute(...) {
        await wipeDB(array);
        return this.success();
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$activeDB`]($activeDB.md)
- [`$closeDB`]($closeDB.md)
- [`$keysDB`]($keysDB.md)
- [`$openDB`]($openDB.md)
- [`$pingDB`]($pingDB.md)
- [`$prefetchDB`]($prefetchDB.md)
- [`$rangeDB`]($rangeDB.md)
- [`$reloadDB`]($reloadDB.md)

**Source:** [`src/functions/db/wipeDB.js`](https://github.com/quoriel/db/blob/main/src/functions/db/wipeDB.js)

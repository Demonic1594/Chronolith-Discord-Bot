# $reloadDB

> Reloads database configuration from file

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| QuorielDB | `db` | v3.0.0 | none | no | — |

## Signature

```fs
$reloadDB
```

## How it works

See the function list below for exact signatures.

`$reloadDB` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$reloadDB
```

## Reference implementation (source)

Taken from `src/functions/db/reloadDB.js` in the `QuorielDB` repository — this is exactly what runs:

```ts
execute(...) {
        await reloadDB();
        return this.success();
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$activeDB`]($activeDB.md)
- [`$closeDB`]($closeDB.md)
- [`$keysDB`]($keysDB.md)
- [`$openDB`]($openDB.md)
- [`$pingDB`]($pingDB.md)
- [`$prefetchDB`]($prefetchDB.md)
- [`$rangeDB`]($rangeDB.md)
- [`$searchDB`]($searchDB.md)

**Source:** [`src/functions/db/reloadDB.js`](https://github.com/quoriel/db/blob/main/src/functions/db/reloadDB.js)

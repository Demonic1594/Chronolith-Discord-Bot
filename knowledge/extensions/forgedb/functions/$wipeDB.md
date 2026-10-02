# $wipeDB

> Wipes all the data stored in the database including cooldowns

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `advanced` | v2.0.8 | none | no | `Json` |

> aliases: $deleteDB, $clearDB

## Signature

```fs
$wipeDB
```

## How it works

See the function list below for exact signatures.

`$wipeDB` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$wipeDB
```

## Reference implementation (source)

Taken from `src/functions/advanced/wipeDB.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        await DataBase.wipe()
        await DataBase.cdWipe()
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$deleteDB`, `$clearDB` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. This function has no brackets — it is used bare.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$dbPing`]($dbPing.md)
- [`$deleteRecords`]($deleteRecords.md)
- [`$getDB`]($getDB.md)
- [`$searchDB`]($searchDB.md)

**Source:** [`src/functions/advanced/wipeDB.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/advanced/wipeDB.ts)

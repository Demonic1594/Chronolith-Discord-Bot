# $wipeGiveaways

> Wipes all existing giveaways from the database permanently, use with caution

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeGiveaways | `database` | v1.0.0 | none | no | — |

## Signature

```fs
$wipeGiveaways
```

## How it works

See the function list below for exact signatures.

`$wipeGiveaways` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$wipeGiveaways
```

## Reference implementation (source)

Taken from `src/native/database/wipeGiveaways.ts` in the `ForgeGiveaways` repository — this is exactly what runs:

```ts
execute(...) {
        await Database.wipe()
        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteGiveaway`]($deleteGiveaway.md)
- [`$getAllGiveaways`]($getAllGiveaways.md)
- [`$getGiveaway`]($getGiveaway.md)

**Source:** [`src/native/database/wipeGiveaways.ts`](https://github.com/tryforge/ForgeGiveaways/blob/main/src/native/database/wipeGiveaways.ts)

# $updateEvents

> Updates all events routes

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| Edge | `other` | v1.0.0 | none | no | — |

## Signature

```fs
$updateEvents
```

## How it works

Uncategorized utilities.

`$updateEvents` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$updateEvents
```

## Reference implementation (source)

Taken from `src/functions/other/updateEvents.ts` in the `Edge` repository — this is exactly what runs:

```ts
execute(...) {
        await updateEvents();
        return this.success();
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$benchmark`]($benchmark.md)
- [`$call`]($call.md)
- [`$parallel`]($parallel.md)
- [`$processEnv`]($processEnv.md)
- [`$require`]($require.md)
- [`$requireCache`]($requireCache.md)
- [`$spread`]($spread.md)
- [`$updateStructures`]($updateStructures.md)

**Source:** [`src/functions/other/updateEvents.ts`](https://github.com/nationdex/edge/blob/main/src/functions/other/updateEvents.ts)

# $linkedEvent

> This function is used to get player info on events for forgelinked

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeLinked | `util` | v1.0.0 | none | no | `Json` |

## Signature

```fs
$linkedEvent
```

## How it works

See the function list below for exact signatures.

`$linkedEvent` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$linkedEvent
```

## Reference implementation (source)

Taken from `src/natives/util/linkedEventData.ts` in the `ForgeLinked` repository — this is exactly what runs:

```ts
execute(...) {
    return this.successJSON(ctx.runtime.extras)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$playerNodeStats`]($playerNodeStats.md)
- [`$playerPing`]($playerPing.md)

**Source:** [`src/natives/util/linkedEventData.ts`](https://github.com/tryforge/ForgeLinked/blob/main/src/natives/util/linkedEventData.ts)

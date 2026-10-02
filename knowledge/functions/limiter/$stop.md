# $stop

> Stops code execution

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `limiter` | v1.0.0 | none | no | — |

## Signature

```fs
$stop
```

## How it works

Limiter functions restrict execution (`$onlyIf`, `$onlyForUsers`, `$onlyForRoles`, ...) and early-exit a command via `$stop`.

`$stop` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$stop
```

## Reference implementation (source)

Taken from `src/native/limiter/stop.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.stop()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$onlyForCategories`]($onlyForCategories.md)
- [`$onlyForChannels`]($onlyForChannels.md)
- [`$onlyForGuilds`]($onlyForGuilds.md)
- [`$onlyForRoles`]($onlyForRoles.md)
- [`$onlyForUsers`]($onlyForUsers.md)
- [`$onlyIf`]($onlyIf.md)

## Community guides covering this function

- [$stop guide](../../guides/guide-189.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-189)

**Source:** [`src/native/limiter/stop.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/limiter/stop.ts)

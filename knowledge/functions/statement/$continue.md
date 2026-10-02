# $continue

> Skips executing bottom code of the loop

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `statement` | v1.0.3 | none | no | — |

## Signature

```fs
$continue
```

## How it works

Statement functions are control flow: `$if`/`$else`/`$elseIf`, `$ifx` blocks, `$while`, `$loop`, `$switch`/`$case`/`$default`, `$try`, `$scope`, `$async`. With `unwrap: false` their code arguments are passed as raw text and compiled/ran lazily — this is why you can put `;`-separated multi-statement code inside them.

`$continue` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$continue
```

## Reference implementation (source)

Taken from `src/native/statement/continue.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.continue()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$async`]($async.md)
- [`$break`]($break.md)
- [`$case`]($case.md)
- [`$default`]($default.md)
- [`$else`]($else.md)
- [`$elseIf`]($elseIf.md)
- [`$if`]($if.md)
- [`$ifx`]($ifx.md)

**Source:** [`src/native/statement/continue.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/statement/continue.ts)

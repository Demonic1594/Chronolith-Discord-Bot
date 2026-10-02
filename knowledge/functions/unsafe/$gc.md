# $gc

> Triggers JavaScript's garbage collector, only available if passed --expose-gc flag to node

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `unsafe` | v1.5.0 | none | no | `Boolean` |

## Signature

```fs
$gc
```

## How it works

Unsafe functions execute dynamic/host-level code (`$djsEval`, `$eval`, ...). Disable/enable them via client options; never expose to untrusted input.

`$gc` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$gc
```

## Reference implementation (source)

Taken from `src/native/unsafe/gc.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(execArgv.includes("--expose-gc") ? (gc!(), true) : false)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$api`]($api.md)
- [`$coroutine`]($coroutine.md)
- [`$djsEval`]($djsEval.md)
- [`$eval`]($eval.md)
- [`$exec`]($exec.md)
- [`$function`]($function.md)
- [`$instanceName`]($instanceName.md)
- [`$loadChannelContext`]($loadChannelContext.md)

**Source:** [`src/native/unsafe/gc.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/unsafe/gc.ts)

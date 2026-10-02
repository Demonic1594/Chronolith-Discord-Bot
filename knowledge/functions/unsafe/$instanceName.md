# $instanceName

> Returns the context's instance name

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `unsafe` | v1.4.0 | none | no | `String` |

> aliases: $instance, $contextInstance

## Signature

```fs
$instanceName
```

## How it works

Unsafe functions execute dynamic/host-level code (`$djsEval`, `$eval`, ...). Disable/enable them via client options; never expose to untrusted input.

`$instanceName` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$instanceName
```

## Reference implementation (source)

Taken from `src/native/unsafe/instanceName.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.obj?.constructor?.name)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$instance`, `$contextInstance` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. This function has no brackets — it is used bare.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$api`]($api.md)
- [`$coroutine`]($coroutine.md)
- [`$djsEval`]($djsEval.md)
- [`$eval`]($eval.md)
- [`$exec`]($exec.md)
- [`$function`]($function.md)
- [`$gc`]($gc.md)
- [`$loadChannelContext`]($loadChannelContext.md)

**Source:** [`src/native/unsafe/instanceName.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/unsafe/instanceName.ts)

# $coroutine

> Runs given code in a separate thread

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `unsafe` | v1.2.0 | required | no | — |

> ⚠️ **experimental**

## Signature

```fs
$coroutine[code]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `code` | `String` | **yes** | no | The code to run |

### Per-parameter notes

- **`code`** (`String`, required): The code to run. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Unsafe functions execute dynamic/host-level code (`$djsEval`, `$eval`, ...). Disable/enable them via client options; never expose to untrusted input.

`$coroutine` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$coroutine[code]
```

## Reference implementation (source)

Taken from `src/native/unsafe/coroutine.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const code = this.displayField(0)!
        return this.success(
            await ctx.client.threading.run({
                code
            })
        )
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Marked **experimental** in source — behavior may change without a major version bump.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$api`]($api.md)
- [`$djsEval`]($djsEval.md)
- [`$eval`]($eval.md)
- [`$exec`]($exec.md)
- [`$function`]($function.md)
- [`$gc`]($gc.md)
- [`$instanceName`]($instanceName.md)
- [`$loadChannelContext`]($loadChannelContext.md)

**Source:** [`src/native/unsafe/coroutine.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/unsafe/coroutine.ts)

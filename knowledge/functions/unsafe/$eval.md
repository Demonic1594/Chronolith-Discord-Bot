# $eval

> Evaluates given code

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `unsafe` | v1.0.0 | required | yes | `Unknown` |

## Signature

```fs
$eval[code;send]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `code` | `String` | **yes** | no | The code to eval |
| 2 | `send` | `Boolean` | no | no | Whether to send as new message |

### Per-parameter notes

- **`code`** (`String`, required): The code to eval. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`send`** (`Boolean`, optional): Whether to send as new message. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Unsafe functions execute dynamic/host-level code (`$djsEval`, `$eval`, ...). Disable/enable them via client options; never expose to untrusted input.

`$eval` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$eval[code]
```

**Full form (all arguments)**

```fs
$eval[code;true]
```

## Reference implementation (source)

Taken from `src/native/unsafe/eval.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        send ??= true
        try {
            const result = await Interpreter.run({
                ...ctx.cloneRuntime(),
                data: Compiler.compile(code),
                doNotSend: !send,
            })

            return result === null ? this.stop() : this.success(send ? undefined : result)
        } catch (error: any) {
            Logger.error(error)
            return this.error(error)
        }
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`send`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$api`]($api.md)
- [`$coroutine`]($coroutine.md)
- [`$djsEval`]($djsEval.md)
- [`$exec`]($exec.md)
- [`$function`]($function.md)
- [`$gc`]($gc.md)
- [`$instanceName`]($instanceName.md)
- [`$loadChannelContext`]($loadChannelContext.md)

## Community guides covering this function

- [$eval guide](../../guides/guide-182.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-182)

**Source:** [`src/native/unsafe/eval.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/unsafe/eval.ts)

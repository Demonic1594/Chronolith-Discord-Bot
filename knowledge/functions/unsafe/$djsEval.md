# $djsEval

> Evaluates JavaScript code

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `unsafe` | v1.0.0 | required | yes | `Unknown` |

> aliases: $js

## Signature

```fs
$djsEval[code]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `code` | `String` | **yes** | yes | The code to eval |

### Per-parameter notes

- **`code`** (`String` , rest, required): The code to eval. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Unsafe functions execute dynamic/host-level code (`$djsEval`, `$eval`, ...). Disable/enable them via client options; never expose to untrusted input.

`$djsEval` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `code` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Evaluate JS against the client**

```fs
$djsEval[client.user.username;true]
```

## Reference implementation (source)

Taken from `src/native/unsafe/djsEval.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const code = arg.join(";")
        try {
            let evaled = await eval(code)
            if (typeof evaled !== "string") evaled = inspect(evaled, { depth: 1 })
            return this.success(evaled)
        } catch (error: unknown) {
            return this.error(ErrorType.Custom, (error as Error).message)
        }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$js` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

### Body constraints (live-verified 2026-10-01, Chronolith `durationToMs` saga)

The JS body lives inside ONE argument, so the field scanner's rules apply to it:

- **No `]` anywhere in the body — including array/object indexing.** `t[i]`, `match[1]`, `units[ch]` all TERMINATE the argument at that bracket; the truncated body then evals to `Unexpected end of input`. This is fatal and invisible at compile time. Replace indexing with ternary helpers / `for...of` / `.charAt()`.
- **No backslashes.** The DSL escape layer strips them before the body reaches `eval`, so regex literals like `/\d/` arrive as `/d/` (or die as unterminated). Use backslash-free character classes: `/[0-9.]/`, not `/\d/`.
- **Plain `;` is FINE** — the code arg is `rest: true`, so the compiler splits on `;` and `execute()` rejoins with `";"`. No `\;` escaping needed (though `\;` also works).
- Newlines are fine; multiline bodies evaluate normally.
- Reading custom-function params: `ctx.getEnvironmentKey("paramName")` matches the `params: [...]` declaration.

Reference implementation of a safe body (bracket-free, backslash-free): see Chronolith `functions/duration.js`.

## Related functions

- [`$api`]($api.md)
- [`$coroutine`]($coroutine.md)
- [`$eval`]($eval.md)
- [`$exec`]($exec.md)
- [`$function`]($function.md)
- [`$gc`]($gc.md)
- [`$instanceName`]($instanceName.md)
- [`$loadChannelContext`]($loadChannelContext.md)

**Source:** [`src/native/unsafe/djsEval.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/unsafe/djsEval.ts)

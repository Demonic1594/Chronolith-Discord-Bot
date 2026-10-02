# $api

> Sends a discord api request, using a discord-api-types route

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `unsafe` | v1.5.0 | required | yes | `Unknown` |

> aliases: $discordAPI

## Signature

```fs
$api[route name;route method;route params;body]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `route name` | `String` | no | no | Route name, like so `channel` |
| 2 | `route method` | `String` | **yes** | no | Route method, like so `get` |
| 3 | `route params;body` | `String` | **yes** | yes | Parameters for this route, body has to be json |

### Per-parameter notes

- **`route name`** (`String`, optional): Route name, like so `channel`. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`route method`** (`String`, required): Route method, like so `get`. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`route params;body`** (`String` , rest, required): Parameters for this route, body has to be json. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Unsafe functions execute dynamic/host-level code (`$djsEval`, `$eval`, ...). Disable/enable them via client options; never expose to untrusted input.

`$api` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `route params;body` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$api[name;value]
```

**Full form (all arguments)**

```fs
$api[name;value;value]
```

## Reference implementation (source)

Taken from `src/native/unsafe/api.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        Routes.user()
        const routeFn = Routes[name as keyof typeof Routes]
        // @ts-ignore
        const path = routeFn(...params.slice(0, routeFn.length))
        const body = params[routeFn.length + 1]
        
        return this.successFormatted(
            await ctx.client.rest[method.toLowerCase() as "post"](path, { body: body ? parseJSON(body) : undefined }).catch(ctx.noop)
        )
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$discordAPI` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`route name`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$coroutine`]($coroutine.md)
- [`$djsEval`]($djsEval.md)
- [`$eval`]($eval.md)
- [`$exec`]($exec.md)
- [`$function`]($function.md)
- [`$gc`]($gc.md)
- [`$instanceName`]($instanceName.md)
- [`$loadChannelContext`]($loadChannelContext.md)

**Source:** [`src/native/unsafe/api.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/unsafe/api.ts)

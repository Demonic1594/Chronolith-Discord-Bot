# $loadGuildContext

> Loads a guild instance to the current context, this is not reversible and is adviced to use with $scope

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `unsafe` | v1.4.0 | required | yes | — |

> aliases: $useGuildContext, $asGuildContext

## Signature

```fs
$loadGuildContext[guild ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to adapt context with |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to adapt context with. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.

## How it works

Unsafe functions execute dynamic/host-level code (`$djsEval`, `$eval`, ...). Disable/enable them via client options; never expose to untrusted input.

`$loadGuildContext` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$loadGuildContext[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/unsafe/loadGuildContext.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.obj = g
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$useGuildContext`, `$asGuildContext` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
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
- [`$instanceName`]($instanceName.md)

**Source:** [`src/native/unsafe/loadGuildContext.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/unsafe/loadGuildContext.ts)

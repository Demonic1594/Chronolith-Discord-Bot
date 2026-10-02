# $loadMessageContext

> Loads a message instance to the current context, this is not reversible and is adviced to use with $scope

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `unsafe` | v1.4.0 | required | yes | — |

> aliases: $useMessageContext, $asMessageContext

## Signature

```fs
$loadMessageContext[channel ID;message ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `TextChannel` | **yes** | no | The channel to pull message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to adapt context with |

### Per-parameter notes

- **`channel ID`** (`TextChannel`, required): The channel to pull message from. Expects a textable channel ID. Same snowflake rules as Channel, but the channel must support messages (`.messages` present), otherwise rejected.
- **`message ID`** (`Message`, required): The message to adapt context with. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Unsafe functions execute dynamic/host-level code (`$djsEval`, `$eval`, ...). Disable/enable them via client options; never expose to untrusted input.

`$loadMessageContext` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$loadMessageContext[123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/unsafe/loadMessageContext.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.obj = m
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$useMessageContext`, `$asMessageContext` — function names are case-insensitive.
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

**Source:** [`src/native/unsafe/loadMessageContext.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/unsafe/loadMessageContext.ts)

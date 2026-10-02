# $loadEmojiContext

> Loads an emoji instance to the current context, this is not reversible and is adviced to use with $scope

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `unsafe` | v2.7.0 | required | yes | — |

> aliases: $useEmojiContext, $asEmojiContext

## Signature

```fs
$loadEmojiContext[emoji ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `emoji ID` | `Emoji` | **yes** | no | The emoji to adapt context with |

### Per-parameter notes

- **`emoji ID`** (`Emoji`, required): The emoji to adapt context with. Expects an emoji. Accepts a raw emoji ID, a `<:name:id>` / `<a:name:id>` string, or a `cdn.discordapp.com/emojis/<id>` URL. Searched in guild emojis, then application emojis.

## How it works

Unsafe functions execute dynamic/host-level code (`$djsEval`, `$eval`, ...). Disable/enable them via client options; never expose to untrusted input.

`$loadEmojiContext` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$loadEmojiContext[:smile:]
```

## Reference implementation (source)

Taken from `src/native/unsafe/loadEmojiContext.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.obj = e
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$useEmojiContext`, `$asEmojiContext` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$api`]($api.md)
- [`$coroutine`]($coroutine.md)
- [`$djsEval`]($djsEval.md)
- [`$eval`]($eval.md)
- [`$exec`]($exec.md)
- [`$function`]($function.md)
- [`$gc`]($gc.md)
- [`$instanceName`]($instanceName.md)

**Source:** [`src/native/unsafe/loadEmojiContext.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/unsafe/loadEmojiContext.ts)

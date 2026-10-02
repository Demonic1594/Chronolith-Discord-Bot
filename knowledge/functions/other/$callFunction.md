# $callFunction

> Calls a forge function made by the user

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `other` | v1.0.0 | required | yes | `Unknown` |

## Signature

```fs
$callFunction[name;args]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The function name |
| 2 | `args` | `String` | no | yes | The args to call this function with |

### Per-parameter notes

- **`name`** (`String`, required): The function name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`args`** (`String` , rest, optional): The args to call this function with. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Uncategorized utilities.

`$callFunction` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `args` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Call a client-registered custom function**

```fs
$callFunction[admin;$guildID;$authorID]
```

**Same thing via direct invocation**

```fs
$admin[$guildID;$authorID]
```

## Reference implementation (source)

Taken from `src/native/other/callFunction.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const fn = ctx.client.functions.get(name)
        if (!fn) return this.error(ErrorType.UnknownXName, "function", name)

        return fn.call(ctx, this, args)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedBar`]($advancedBar.md)
- [`$awaitComponent`]($awaitComponent.md)
- [`$awaitMessage`]($awaitMessage.md)
- [`$awaitModalSubmit`]($awaitModalSubmit.md)
- [`$bar`]($bar.md)
- [`$c`]($c.md)
- [`$callLocalFunction`]($callLocalFunction.md)
- [`$debug`]($debug.md)

**Source:** [`src/native/other/callFunction.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/other/callFunction.ts)

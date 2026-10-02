# $callLocalFunction

> Calls a local function

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `other` | v2.3.0 | required | yes | `Unknown` |

> aliases: $callFn

## Signature

```fs
$callLocalFunction[name;args]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The local function name |
| 2 | `args` | `String` | no | yes | The args to call this local function with |

### Per-parameter notes

- **`name`** (`String`, required): The local function name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`args`** (`String` , rest, optional): The args to call this local function with. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Uncategorized utilities.

`$callLocalFunction` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `args` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$callLocalFunction[name]
```

**Full form (all arguments)**

```fs
$callLocalFunction[name;value]
```

## Reference implementation (source)

Taken from `src/native/other/callLocalFunction.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const func = ctx.getLocalFunction(name)
        if (!func) return this.error(ErrorType.UnknownXName, "local function", name)

        if (args.length < func.args.length)
            return this.error(
                ErrorType.Custom,
                `Calling local function ${name} requires ${func.args.length} argument${func.args.length > 1 ? "s" : ""}, received ${args.length}`
            )

        for (let i = 0, len = func.args.length; i < len; i++) {
            ctx.setEnvironmentKey(func.args[i], args[i])
        }

        const rt = await this["resolveCode"](ctx, func.code)
        return this.success(rt.value)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$callFn` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedBar`]($advancedBar.md)
- [`$awaitComponent`]($awaitComponent.md)
- [`$awaitMessage`]($awaitMessage.md)
- [`$awaitModalSubmit`]($awaitModalSubmit.md)
- [`$bar`]($bar.md)
- [`$c`]($c.md)
- [`$callFunction`]($callFunction.md)
- [`$debug`]($debug.md)

**Source:** [`src/native/other/callLocalFunction.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/other/callLocalFunction.ts)

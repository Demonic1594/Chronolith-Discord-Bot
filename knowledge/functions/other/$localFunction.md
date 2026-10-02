# $localFunction

> Defines a new local function

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `other` | v2.3.0 | required | no | — |

> aliases: $fn

## Signature

```fs
$localFunction[name;code;params]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The local function name |
| 2 | `code` | `String` | **yes** | no | The local function code |
| 3 | `params` | `String` | no | yes | The local function params |

### Per-parameter notes

- **`name`** (`String`, required): The local function name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`code`** (`String`, required): The local function code. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`params`** (`String` , rest, optional): The local function params. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Uncategorized utilities.

`$localFunction` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

The `params` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$localFunction[name;code]
```

**Full form (all arguments)**

```fs
$localFunction[name;code;value]
```

## Reference implementation (source)

Taken from `src/native/other/localFunction.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const code = this.data.fields![1] as IExtendedCompiledFunctionField

        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 2)
        if (!this["isValidReturnType"](rt)) return rt
        const [ name, params ] = args

        ctx.setLocalFunction(name, { 
            code,
            args: params
        })

        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$fn` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
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
- [`$callLocalFunction`]($callLocalFunction.md)

**Source:** [`src/native/other/localFunction.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/other/localFunction.ts)

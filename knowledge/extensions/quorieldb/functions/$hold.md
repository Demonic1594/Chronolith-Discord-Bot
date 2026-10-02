# $hold

> Applies a hold timer to prevent repeated actions

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| QuorielDB | `other` | v3.0.0 | required | no | — |

## Signature

```fs
$hold[variable;type;name;duration;code;key]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable` | `String` | **yes** | no | Environment variable name |
| 2 | `type` | `String` | **yes** | no | Data type |
| 3 | `name` | `String` | **yes** | no | Hold name |
| 4 | `duration` | `Time` | **yes** | no | Hold duration |
| 5 | `code` | `String` | no | no | Code to execute |
| 6 | `key` | `String` | no | no | Record key |

### Per-parameter notes

- **`variable`** (`String`, required): Environment variable name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`type`** (`String`, required): Data type. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`name`** (`String`, required): Hold name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`duration`** (`Time`, required): Hold duration. Expects a duration. A raw number is used as milliseconds directly; otherwise parsed by `TimeParser` (`10m`, `1h30m`, `2d`, `45s`, ...).
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`code`** (`String`, optional): Code to execute. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`key`** (`String`, optional): Record key. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Uncategorized utilities.

`$hold` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$hold[value;value;name;10m]
```

**Full form (all arguments)**

```fs
$hold[value;value;name;10m;code;value]
```

## Reference implementation (source)

Taken from `src/functions/other/hold.js` in the `QuorielDB` repository — this is exactly what runs:

```ts
execute(...) {
        const variable = await this.resolveUnhandledArg(ctx, 0);
        if (!this.isValidReturnType(variable)) return variable;
        const type = await this.resolveUnhandledArg(ctx, 1);
        if (!this.isValidReturnType(type)) return type;
        const name = await this.resolveUnhandledArg(ctx, 2);
        if (!this.isValidReturnType(name)) return name;
        const duration = await this.resolveUnhandledArg(ctx, 3);
        if (!this.isValidReturnType(duration)) return duration;
        const key = await this.resolveUnhandledArg(ctx, 5);
        if (!this.isValidReturnType(key)) return key;
        const data = await hold(type.value, key.value || autoKey(ctx, type.value), ctx.getEnvironmentKey(variable.value), name.value, duration.value);
        if (!data) {
            const field = this.data.fields[4];
            if (field) {
                const code = await this.resolveCode(ctx, field);
                if (!this.isValidReturnType(code)) return code;
                ctx.container.content = code.value;
                await ctx.container.send(ctx.obj);
            }
            return this.stop();
        }
        ctx.setEnvironmentKey(variable.value, data);
        return this.success();
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`code`, `key`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Time arguments accept either a raw number (milliseconds) or a duration string like `10m`, `1h30m`, `2d`.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$key`]($key.md)

**Source:** [`src/functions/other/hold.js`](https://github.com/quoriel/db/blob/main/src/functions/other/hold.js)

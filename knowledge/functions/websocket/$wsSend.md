# $wsSend

> Sends a websocket message

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `websocket` | v1.5.0 | required | no | — |

> aliases: $websocketSend

## Signature

```fs
$wsSend[websocket ID;value;callback;variable name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `websocket ID` | `Number` | **yes** | no | The id of the websocket to attach this listener to |
| 2 | `value` | `Json` | **yes** | no | The json value to send over |
| 3 | `callback` | `String` | no | no | Code to execute on completion of request |
| 4 | `variable name` | `String` | no | no | Variable to store error on if callback was called for an error |

### Per-parameter notes

- **`websocket ID`** (`Number`, required): The id of the websocket to attach this listener to. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`value`** (`Json`, required): The json value to send over. Expects a JSON string. Parsed with ForgeScript's lenient `parseJSON`; invalid JSON is rejected.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`callback`** (`String`, optional): Code to execute on completion of request. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`variable name`** (`String`, optional): Variable to store error on if callback was called for an error. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Websocket functions open and manage custom websocket connections.

`$wsSend` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$wsSend[5;{"key":"value"}]
```

**Full form (all arguments)**

```fs
$wsSend[5;{"key":"value"};value;name]
```

## Reference implementation (source)

Taken from `src/native/websocket/wsSend.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3)
        if (!this["isValidReturnType"](rt)) return rt 

        const [ id, value, param ] = args
        const cb = this.data.fields![2] as IExtendedCompiledFunctionField

        const ws = ctx.client.websockets.get(id)
        if (ws) {
            ws.send(JSON.stringify(value), cb ? async (err) => {
                if (param)
                    ctx.setEnvironmentKey(param, err)
                await this["resolveCode"](ctx, cb)
            } : undefined)
        }

        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$websocketSend` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
4. Optional arguments (`callback`, `variable name`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$ws`]($ws.md)
- [`$wsClose`]($wsClose.md)
- [`$wsOn`]($wsOn.md)
- [`$wsState`]($wsState.md)

**Source:** [`src/native/websocket/wsSend.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/websocket/wsSend.ts)
